/**
 * Xavier Teo Zai Ken (p2104261)
 * DIT/1B/02
 */
//-- Import required modules --//
const jwt = require("jsonwebtoken");
const { JWTSecretKey } = require("../config/config");

//Check if the JWT supplied is valid
const check = (req, res, next) => {
	//Retrieve authorisation headers
	const authHeader = req.headers.authorization;

	//Check if the authorisation headers are set
	if (authHeader === null || authHeader === undefined || !authHeader.startsWith("Bearer ")) {
		//Authorization headers are not set
		res.status(401).send();
		return;
	}

	//Retrieve the token from the authorisation header
	const token = authHeader.replace("Bearer ", "");

	//Decode the token to make sure that it is valid
	jwt.verify(token, JWTSecretKey, { algorithms: ["HS256"] }, (error, decodedToken) => {
		//Checks if there was an error
		if (error) {
			//There was an error
			res.status(401).send();
			return;
		}
		
		//Add the decoded token to the req object
		req.decodedToken = decodedToken;

		//Move on to the next middleware
		next();
	});
};

//Export the middleware
module.exports = check;
