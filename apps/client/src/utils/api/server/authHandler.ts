/* eslint-disable camelcase */
import PrismaClient, { RefreshTokens } from "@bot-dashboard/db";
import crypto from "crypto";
import { InvalidTokenError, TokenExpiredError } from "@bot-dashboard/errors";

/**
 * Type declarations
 */
type ValidateTokenOptions<T> = {
  userId: string;
  token: T | null;
  tokenType?: "access" | "refresh";
};

/**
 * Global variables
 */
export const ACCESS_TOKEN_VALIDITY = 1000 * 60 * 60 * 2; // The validity of the access token in milliseconds (2 hours)
export const REFRESH_TOKEN_VALIDITY = 1000 * 60 * 60 * 24; // The validity of the refresh token in milliseconds (1 day)
const REFRESH_TOKEN_REFRESH_THRESHOLD = 1000 * 60 * 60 * 4; // The time before the refresh token expires to refresh it in milliseconds (4 hours)
const TOKEN_GRACE_PERIOD = 1000 * 30; // The time before an expired access token can no longer be used to retrieve the new one in milliseconds (30 seconds)

/**
 * Revokes all refresh tokens associated with the user
 * @param userId The ids of the users to revoke the tokens of
 */
const revokeRefreshTokens = async (userId: string | string[]) =>
  // Revoke all refresh tokens associated with the users
  PrismaClient.refreshTokens.updateMany({
    where: {
      userId: {
        in: userId,
      },
    },
    data: {
      revoked: true,
    },
  });

/**
 * Revokes a refresh token
 * @param token The refresh token to revoke
 */
const revokeRefreshToken = async (token: string) =>
  // Revokes a specific refresh token
  PrismaClient.refreshTokens.update({
    where: {
      token,
    },
    data: {
      revoked: true,
    },
  });

/**
 * Retrieves a refresh token from the database
 * @param token The refresh token
 * @returns The refresh token if it is valid, otherwise null
 */
const retrieveRefreshToken = async (token: string) => {
  // Retrieve the refresh token from the database
  const refreshToken = await PrismaClient.refreshTokens.findUnique({
    where: {
      token,
    },
  });

  return refreshToken;
};

/**
 * Retrieves an access token from the database
 * @param token The access token
 * @returns The access token if it is valid, otherwise null
 */
const retrieveAccessToken = async (token: string) => {
  // Retrieve the access token from the database
  const accessToken = await PrismaClient.accessTokens.findUnique({
    where: {
      token,
    },
  });

  return accessToken;
};

/**
 * Retrieves the latest refresh token(s) from the database
 * @param userId The id of the user to use to retrieve the latest refresh token
 * @param limit The number of refresh tokens to retrieve
 * @returns The latest refresh token(s) generated for the user
 */
const retrieveLatestRefreshToken = async (userid: string, limit: number) => {
  // Retrieve the latestaccess token from the database
  const accessToken = await PrismaClient.refreshTokens.findMany({
    where: {
      userId: userid,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return accessToken;
};

/**
 * Retrieves the latest access token(s) from the database
 * @param refreshTokenId The id of the refresh token to use to retrieve the latest access token
 * @param limit The number of access tokens to retrieve
 * @returns The latest access token generated by the refresh token
 */
const retrieveLatestAccessToken = async (refreshTokenId: number, limit: number) => {
  // Retrieve the latestaccess token from the database
  const accessToken = await PrismaClient.accessTokens.findMany({
    where: {
      refreshToken: refreshTokenId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return accessToken;
};

/**
 * Validates both the access token and the refresh token
 * @param userId The id of the user making the request
 * @param token The token to validate
 * @returns The token if the token is valid, otherwise throws an error
 */
export const validateToken = async <T extends RefreshTokens>({
  userId,
  token,
  tokenType = "access",
}: ValidateTokenOptions<T>) => {
  // Check if the token exists in the database
  if (!token) {
    // The token does not exist in the database, this might be an attack
    // Revoke all tokens associated with the user
    await revokeRefreshTokens(userId);

    console.log("fake token attack: ", token);

    throw new InvalidTokenError(tokenType);
  }

  // Check if the token is for the user making the request
  if (token.userId !== userId) {
    // It is not, this might be an attack
    // Revoke all tokens associated with both users
    await revokeRefreshTokens(userId);
    await revokeRefreshTokens(token.userId);

    console.log("wrong user token attack: ", token);

    throw new InvalidTokenError(tokenType);
  }

  // Check if the token has expired (if required)
  if (tokenType === "refresh" && token.expiresAt < new Date()) {
    // The token has expired, revoke it
    await revokeRefreshToken(token.token);

    console.log("token expired attack: ", token);

    throw new TokenExpiredError(tokenType);
  }

  // Check if the token has been revoked
  if (token.revoked) {
    // The token has been revoked, but it was still used in the request
    // This might be an attack, so we should revoke all refresh tokens associated with the user
    // await revokeRefreshTokens(userId);

    console.log("token revoked attack: ", token);

    throw new InvalidTokenError(tokenType);
  }

  // The token is valid
  return token;
};

/**
 * Validates the refresh token
 * @param userId The id of the user
 * @param token The refresh token
 * @returns The refresh token if it is valid, otherwise throws an error
 */
const validateRefreshToken = async (userId: string, token: string) => {
  // Retrieve the refresh token from the database
  const refreshToken = await retrieveRefreshToken(token);

  // Validate the refresh token
  return validateToken({
    userId,
    token: refreshToken,
    tokenType: "refresh",
  });
};

/**
 * Validates the access token
 * @param userId The id of the user
 * @param token The access token
 * @returns The access token if it is valid, otherwise throws an error
 */
const validateAccessToken = async (userId: string, token: string) => {
  // Retrieve the access token from the database
  let accessToken = await retrieveAccessToken(token);

  // Validate the access token
  accessToken = await validateToken({
    userId,
    token: accessToken,
  });

  // Retrieve the latest access token generated by the refresh token
  const latestAccessToken = await retrieveLatestAccessToken(accessToken.refreshToken, 1);

  // Check if this is the latest access token
  if (latestAccessToken[0]?.token !== accessToken.token) {
    // This is not the latest access token, check if it expired within the grace period
    if (accessToken.expiresAt > new Date(new Date().getTime() - TOKEN_GRACE_PERIOD)) {
      // The access token expired within the grace period, its considered as valid
      return accessToken;
    }
    // Token is expired, this might be an attack
    await revokeRefreshTokens(userId);
    console.log("second latest access token expired outside grace attack: ", accessToken);

    throw new TokenExpiredError("access");
  }

  // Check if this is the newest access token
  if (latestAccessToken[0]?.token !== token) {
    // The access token is not the latest access token, this might be an attack
    // Revoke all refresh tokens associated with the user
    await revokeRefreshTokens(userId);

    console.log("token not the latest two access tokens attack: ", accessToken);

    throw new InvalidTokenError("access");
  }

  return accessToken;
};

/**
 * Generates a new token string, compliant with RFC 6750
 */
const generateToken = () => {
  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");

  // Return the token
  return token;
};

/**
 * Generates a new access token and saves it to the database
 * @param userId The id of the user
 * @param refreshToken The refresh token to generate the access token with
 * @returns The new access token
 */
const generateAccessToken = async (userId: string, refreshToken: RefreshTokens) => {
  // Generate a new access token
  const newAccessToken = generateToken();

  // Calculate the expiry of the access token
  const expiry = new Date(new Date().getTime() + ACCESS_TOKEN_VALIDITY);

  // Save the new access token to the database
  const result = await PrismaClient.accessTokens.create({
    data: {
      token: newAccessToken,
      userId,
      expiresAt: expiry,
      revoked: false,
      refreshToken: refreshToken.id,
    },
  });

  // Return the new access token
  return result;
};

/**
 * Generates a new refresh token and saves it to the database
 * @param userId The id of the user
 * @returns The new refresh token
 */
const generateRefreshToken = async (userId: string) => {
  // The refresh token needs to be refreshed, generate a new one
  const generatedToken = generateToken();

  // Save the new refresh token to the database
  const newRefreshToken = await PrismaClient.refreshTokens.create({
    data: {
      token: generatedToken,
      userId,
      expiresAt: new Date(new Date().getTime() + REFRESH_TOKEN_VALIDITY),
      revoked: false,
    },
  });

  return newRefreshToken;
};

/**
 * Generates a new refresh token and saves it to the database (if necessary)
 * @param userId The id of the user
 * @param $refreshToken The old refresh token
 * @returns New refresh token
 */
const refreshRefreshToken = async (userId: string, $refreshToken: string) => {
  // Validate the refresh token
  const refreshToken = await validateRefreshToken(userId, $refreshToken);

  // Refresh token is currently valid, check if it needs to be refreshed
  if (refreshToken.expiresAt.getTime() - new Date().getTime() < REFRESH_TOKEN_REFRESH_THRESHOLD) {
    // Generate a new refresh token
    const newRefreshToken = generateRefreshToken(userId);

    // Invalidate old refresh token and all its associated access tokens
    await revokeRefreshToken(refreshToken.token);

    // Return the new refresh token
    return newRefreshToken;
  }

  // The refresh token need not be refreshed, return the old one
  return refreshToken;
};

/**
 * Generates a new access token with the refresh token
 */
const refreshAccessToken = async (userId: string, $accessToken: string, $refreshToken: string) => {
  // Validate the access token
  const accessToken = await validateAccessToken(userId, $accessToken);

  // Validate the refresh token
  const refreshToken = await validateRefreshToken(userId, $refreshToken);

  // Check that the access token is generated by the provided refresh token
  if (accessToken.refreshToken !== refreshToken.id) {
    // It was not, this might be an attack
    // Revoke all the user's refresh tokens
    await revokeRefreshTokens(userId);
    throw new InvalidTokenError("access");
  }

  // Both the access token and the refresh token are valid, refresh the refresh token if necessary
  const newRefreshToken = await refreshRefreshToken(userId, $refreshToken);

  // Initialise result
  let newAccessToken = accessToken;

  // Check if the access token has expired
  if (accessToken.expiresAt.getTime() <= new Date().getTime()) {
    // The access token has expired, generate a new one
    newAccessToken = await generateAccessToken(userId, newRefreshToken);
  }

  // Format the result
  const result = {
    accessToken: newAccessToken.token,
    accessTokenExpires: newAccessToken.expiresAt.getTime(),
    refreshToken: newRefreshToken.token,
  };

  return result;
};

/**
 * Generates both access and refresh tokens for a user on initial login
 * @param userId The id of the user
 */
const requestTokens = async (userId: string) => {
  // Generate a new refresh token
  const refreshToken = await generateRefreshToken(userId);

  // Generate a new access token
  const accessToken = await generateAccessToken(userId, refreshToken);

  // Prepare the result object
  const result = {
    accessToken: accessToken.token,
    accessTokenExpires: accessToken.expiresAt.getTime(),
    refreshToken: refreshToken.token,
  };

  return result;
};

export default {
  refreshAccessToken,
  refreshRefreshToken,
  requestTokens,
};
