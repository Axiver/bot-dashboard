import prismaClient from '../../index';

import { Categories } from './tables/category';
import { Companies } from './tables/companies';
import { Users } from './tables/users';
import { Listings } from './tables/listing';
import { ListingItems } from './tables/listing_items';
import { Rooms } from './tables/rooms';
import { Offers } from './tables/offers';
import { Messages } from './tables/messages';
import { Parameters } from './tables/parameter';
import { Advertisements } from './tables/advertisements';
import { CategoriesParameters } from './tables/categories_parameters';
import { AdvertClicks } from './tables/advert_clicks';
import { ListingClicks } from './tables/listing_clicks';
import { CompaniesBookmarks } from './tables/companies_bookmarks';
import { Invite } from './tables/invite';
import { ListingBookmarks } from './tables/listing_bookmarks';
import { ListingsParametersValue } from './tables/listings_parameters_value';
import { UserBookmarks } from './tables/user_bookmarks';
import { SibKeys } from './tables/sibkeys';
import { PasswordReset } from './tables/password_reset';

const main = async (): Promise<void> => {
  console.log('\nClearing database...');

  await Promise.allSettled([
    prismaClient.logs.deleteMany({}),
    prismaClient.parameter.deleteMany({}),
    prismaClient.rooms.deleteMany({}),
    prismaClient.offers.deleteMany({}),
    prismaClient.messages.deleteMany({}),
    prismaClient.share.deleteMany({}),
    prismaClient.sharesListings.deleteMany({}),
    prismaClient.advertisements.deleteMany({}),
    prismaClient.categoriesParameters.deleteMany({}),
    prismaClient.advertClicks.deleteMany({}),
    prismaClient.listingClicks.deleteMany({}),
    prismaClient.listingItem.deleteMany({}),
    prismaClient.companiesBookmarks.deleteMany({}),
    prismaClient.companiesNotifications.deleteMany({}),
    prismaClient.listingNotifications.deleteMany({}),
    prismaClient.invite.deleteMany({}),
    prismaClient.listingBookmarks.deleteMany({}),
    prismaClient.listingsParametersValue.deleteMany({}),
    prismaClient.userBookmarks.deleteMany({}),
    prismaClient.userNotifications.deleteMany({}),
    prismaClient.userReports.deleteMany({}),
    prismaClient.refreshTokens.deleteMany({}),
    prismaClient.accessTokens.deleteMany({}),
    prismaClient.sibkeys.deleteMany({}),
    prismaClient.passwordReset.deleteMany({}),
    prismaClient.category.deleteMany({}),
    prismaClient.companies.deleteMany({}),
    prismaClient.users.deleteMany({}),
    prismaClient.listing.deleteMany({}),
  ]);

  console.log('Database cleared');
  console.log('Resetting sequences...');

  await Promise.allSettled([
    prismaClient.$executeRaw`ALTER SEQUENCE public.access_tokens_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.advert_clicks_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.advertisements_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.category_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.companies_bookmarks_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.companies_notifications_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.companies_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.invite_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.listing_bookmarks_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.listing_clicks_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.listing_item_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.listing_notifications_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.listing_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.logs_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.parameter_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.password_reset_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.refresh_tokens_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.reviews_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.share_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.user_bookmarks_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.user_notifications_seq RESTART WITH 1;`,
    prismaClient.$executeRaw`ALTER SEQUENCE public.user_reports RESTART WITH 1;`,
  ]);

  console.log('Sequences reset');
  console.log('Seeding public.category...');

  const { count: categoryCount } = await prismaClient.category.createMany({
    data: Categories,
  });

  console.log(`Seeded ${categoryCount} rows into public.category`);
  console.log('Seeding public.companies...');

  const { count: companiesCount } = await prismaClient.companies.createMany({
    data: Companies,
  });

  console.log(`Seeded ${companiesCount} rows into public.companies`);
  console.log('Seeding public.users...');

  const { count: usersCount } = await prismaClient.users.createMany({
    data: Users,
  });

  console.log(`Seeded ${usersCount} rows into public.users`);
  console.log('Seeding public.listingItem...');

  const newListingItems = ListingItems.map((item, index) => {
    return {
      ...item,
      createdAt: new Date(new Date().getTime() - index * 60 * 60 * 1000),
      updatedAt: new Date(new Date().getTime() - index * 60 * 60 * 1000),
    };
  });

  const { count: listingItemsCount } = await prismaClient.listingItem.createMany({
    data: newListingItems,
  });

  console.log(`Seeded ${listingItemsCount} rows into public.users`);
  console.log('Seeding public.listing...');

  const newListings = Listings.map((listing, index) => {
    return {
      ...listing,
      createdAt: new Date(new Date().getTime() - index * 60 * 60 * 1000),
      updatedAt: new Date(new Date().getTime() - index * 60 * 60 * 1000),
    };
  });

  const { count: listingCount } = await prismaClient.listing.createMany({
    data: newListings,
  });

  console.log(`Seeded ${listingCount} rows into public.listing`);
  console.log('Seeding public.rooms...');

  const { count: roomsCount } = await prismaClient.rooms.createMany({
    data: Rooms,
  });

  console.log(`Seeded ${roomsCount} rows into public.rooms`);
  console.log('Seeding public.offers...');

  const { count: offersCount } = await prismaClient.offers.createMany({
    data: Offers,
  });

  await prismaClient.$executeRawUnsafe(
    `ALTER SEQUENCE public.offers_seq RESTART WITH ${offersCount};`
  );

  console.log(`Seeded ${offersCount} rows into public.offers`);
  console.log('Updated public.offers_seq');
  console.log('Seeding public.messages...');

  const { count: messagesCount } = await prismaClient.messages.createMany({
    data: Messages,
  });

  await prismaClient.$executeRawUnsafe(
    `ALTER SEQUENCE public.messages_seq RESTART WITH ${messagesCount};`
  );

  console.log(`Seeded ${messagesCount} rows into public.messages`);
  console.log('Updated public.messages_seq...');
  console.log('Seeding public.parameter...');

  const { count: parameterCount } = await prismaClient.parameter.createMany({
    data: Parameters,
  });

  console.log(`Seeded ${parameterCount} rows into public.parameter`);
  console.log('Seeding public.advertisements...');

  const { count: advertisementsCount } = await prismaClient.advertisements.createMany({
    data: Advertisements,
  });

  console.log(`Seeded ${advertisementsCount} rows into public.advertisements`);
  console.log('Seeding public.categories_parameters...');

  const { count: categoriesParametersCount } = await prismaClient.categoriesParameters.createMany({
    data: CategoriesParameters,
  });

  console.log(`Seeded ${categoriesParametersCount} rows into public.categories_parameters`);
  console.log('Seeding public.advert_clicks...');

  const { count: advertClicksCount } = await prismaClient.advertClicks.createMany({
    data: AdvertClicks,
  });

  console.log(`Seeded ${advertClicksCount} rows into public.advert_clicks`);
  console.log('Seeding public.listing_clicks...');

  const { count: listingClicksCount } = await prismaClient.listingClicks.createMany({
    data: ListingClicks,
  });

  console.log(`Seeded ${listingClicksCount} rows into public.listing_clicks`);
  console.log('Seeding public.companies_bookmarks...');

  const { count: companiesBookmarksCount } = await prismaClient.companiesBookmarks.createMany({
    data: CompaniesBookmarks,
  });

  console.log(`Seeded ${companiesBookmarksCount} rows into public.companies_bookmarks`);
  console.log('Seeding public.invite...');

  const { count: inviteCount } = await prismaClient.invite.createMany({
    data: Invite,
  });

  console.log(`Seeded ${inviteCount} rows into public.invite`);
  console.log('Seeding public.listing_bookmarks...');

  const { count: listingBookmarksCount } = await prismaClient.listingBookmarks.createMany({
    data: ListingBookmarks,
  });

  console.log(`Seeded ${listingBookmarksCount} rows into public.listing_bookmarks`);

  console.log('Seeding public.listings_parameters_value...');

  const { count: listingsParametersValueCount } =
    await prismaClient.listingsParametersValue.createMany({
      data: ListingsParametersValue,
    });

  console.log(`Seeded ${listingsParametersValueCount} rows into public.listings_parameters_value`);
  console.log('Seeding public.user_bookmarks...');

  const { count: userBookmarksCount } = await prismaClient.userBookmarks.createMany({
    data: UserBookmarks,
  });

  console.log(`Seeded ${userBookmarksCount} rows into public.user_bookmarks`);
  console.log('Seeding public.sibkeys...');

  const { count: sibkeysCount } = await prismaClient.sibkeys.createMany({
    data: SibKeys,
  });

  console.log(`Seeded ${sibkeysCount} rows into public.sibkeys`);
  console.log('Seeding public.password_reset...');

  const { count: passwordResetCount } = await prismaClient.passwordReset.createMany({
    data: PasswordReset,
  });

  console.log(`Seeded ${passwordResetCount} rows into public.password_reset`);
};

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
