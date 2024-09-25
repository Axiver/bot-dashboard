//Load required modules and configs
//const bcrypt = require("bcrypt");
const db = require("./databaseConfig");

/* Functions */
/**
 * Establishes a connection to the database
 * @param {{(err: null | any, dbConn: null | object): void}} callback The callback to pass the db connection to
 */
function connectDB(callback) {
  //Connects to the databse
  var dbConn = db.getConnection();
  dbConn.connect((err) => {
    //Checks if there was an error trying to connect to the database
    if (err) {
      //There was an error
      return callback(err, null);
    } else {
      //There was no error, return the db object
      return callback(null, dbConn);
    }
  });
}

//Declare available methods for interacting with the db
const User = {
  /**
   * Creates a new user with the data supplied
   * @param {Object} userData Object containing the data for the user account to be created
   * @param {string} userData.username The username
   * @param {string} userData.password The password
   * @param {{(err: null | any, result: null | object): void}} callback The callback to invoke once the operation is completed
   */
  createUser: (userData, callback) => {
    //Deconstruct the userData object
    ({ username, password } = userData);

    //Establish a connection to the database
    connectDB((err, dbConn) => {
      //Checks if there was an error
      if (err) {
        //There was an error
        return callback(err, null);
      } else {
        //There was no error
        //Construct the query
        const sqlQuery = "INSERT INTO user_accounts (username, password) VALUES (?, ?)";

        //Execute the query
        dbConn.query(
          sqlQuery,
          [username, password],
          (err, results) => {
            //Closes the db connection
            dbConn.end();

            //Checks if there was an error
            if (err) {
              //There was an error
              return callback(err, null);
            } else {
              //There was no error, return the results
              return callback(null, results);
            }
          }
        );
      }
    });
  },

  /**
   * Retrieves the data for all user accounts
   * @param {{(err: null | any, result: null | object): void}} callback The callback to invoke once the operation is completed
   */
  getUsers: (callback) => {
    //Establish a connection to the database
    connectDB((err, dbConn) => {
      //Checks if there was an error
      if (err) {
        //There was an error
        return callback(err, null);
      } else {
        //There was no error
        //Construct the query
        const sqlQuery = "SELECT id, username, created_at FROM user_accounts";

        //Executes the query
        dbConn.query(sqlQuery, (err, results) => {
          //Closes the db connection
          dbConn.end();

          //Checks if there was an error
          if (err) {
            //There was an error
            return callback(err, null);
          } else {
            //There was no error, return the results
            return callback(null, results);
          }
        });
      }
    });
  },

  /**
   * Retrieves the data for a user with a specific id
   * @param {number} userid The ID of the user to be retrieved
   * @param {{(err: null | any, result: null | object): void}} callback The callback to invoke once the operation is completed
   */
  getUserById: (userid, callback) => {
    //Establish a connection to the database
    connectDB((err, dbConn) => {
      //Checks if there was an error
      if (err) {
        //There was an error
        return callback(err, null);
      } else {
        //There was no error
        //Construct the query
        const sqlQuery = "SELECT id, username, created_at FROM user_accounts WHERE id = ?";

        //Executes the query
        dbConn.query(sqlQuery, [userid], (err, results) => {
          //Closes the db connection
          dbConn.end();

          //Checks if there was an error
          if (err) {
            //There was an error
            return callback(err, null);
          } else {
            //There was no error, return the results
            return callback(null, results);
          }
        });
      }
    });
  },

  /**
   * Authenticates a user login
   * @param {string} username The user's username
   * @param {string} password The user's password
   * @param {{(err: null | any, result: null | object): void}} callback The callback to invoke once the operation is completed
   */
  authenticate: (username, password, callback) => {
    //Establish a connection to the database
    connectDB((err, dbConn) => {
      //Checks if there was an error
      if (err) {
        //There was an error
        return callback(err, null);
      } else {
        //There was no error
        //Construct the SQL query
        const sqlQuery = "SELECT password, id, username, FROM user_accounts WHERE username = ?";

        //Executes the query
        dbConn.query(sqlQuery, [username], (err, results) => {
          //Closes the db connection
          dbConn.end();
          //Checks if there was an error
          if (err) {
            //There was an error
            return callback(err, null);
          } else {
            //There was no error, check if any rows were returned
            if (results.length > 0) {
              //An account with the given username exists
              const account = results[0];

              //Verify the password
              if (password == account.password) {
                //Password matches, return the userid
                return callback(null, account);
              }
            }

            //An account with the given username does not exist
            return callback("invalid account details", null);
          }
        });
      }
    });
  },
};

//Exposes the methods declared
module.exports = User;
