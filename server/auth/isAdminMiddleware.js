/**
 * Xavier Teo Zai Ken (p2104261)
 * DIT/1B/02
 */
//-- Import required modules --//
const User = require("../models/User");


//Check if the JWT supplied is valid
const check = (req, res, next) => {
	//Retrieve userid from the req decodedtoken
    const userid = req.decodedToken.userid;

    //Check if the user is an admin
    User.getUserById(userid, (err, result) => {
        //Check if there was an error
        if (err) {
            //There was an error, assume unauthorised access
            console.log(err);
            return res.status(401).send();
        }

        //Check if there are any results
        if (result.length == 0) {
            //There are no results, no account with the given userid exists
            return res.status(401).send();
        }

        //There was no error, check if the account is an admin account
        if (result[0].type != "Admin") {
            //User is not an admin account, this is unauthorised
            return res.status(401).send();
        }

        //All checks passed, move on to the next middleware
        next();
    });
};

//Export the middleware
module.exports = check;
