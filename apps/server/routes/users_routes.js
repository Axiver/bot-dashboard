//Import required modules
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const configs = require("../config/config.js");

//Models
const User = require("../models/User");

//Middlewares
const isLoggedInMiddleware = require("../auth/isLoggedInMiddleware");

//-- Functions --//
/**
 * Trims all properties in a object
 * @param {{}} object The object containing properties to be trimmed
 * @param {*} callback The callback to invoke once the operation is completed
 */
function trimObject(object, callback) {
    //Try to trim all the properties in a object
    try {
        //Loops through the object
        for (const [key, value] of Object.entries(object)) {
            //Trim the current index in the object
            object[key] = `${value}`.trim();
        }

        //The object has been trimmed, invoke the callback with the result
        callback(null, object);
    } catch (error) {
        //There was an error while trying to perform trim(), most likely encountered a null value
        callback(error, null);
    }
}

//-- POST Request handling --//
/**
 * Creates a new user
 */
router.post("/", (req, res) => {
    //Trims the user input before passing it through to the createUser method
    trimObject(req.body, (err, trimmedInput) => {
        //Check if there was an error
        if (err) {
            //There was an error
            console.log(err);
            return res.status(500).send();
        } else {
            //There was no error
            //Create a new user
            User.createUser(trimmedInput, (err, result) => {
                //Checks if there was an error
                if (err) {
                    //There was an error
                    console.log(err);
                    //Check if the error was due to a duplicate entry
                    if (err.code == "ER_DUP_ENTRY") {
                        //Error was caused by a duplicate entry. Check which column is affected
                        let response = {};
                        if (err.sqlMessage.includes("users.username")) {
                            //Username is already in use
                            response = {"message": "Username is already in use!", "affectedInputs": ["username"]};
                        } else if (err.sqlMessage.includes("users.email")) {
                            //Email is already in use
                            response = {"message": "Email address is already registered! Try logging in instead?", "affectedInputs": ["email"]};
                        }
                        return res.status(422).send(response);
                    } else {
                        //Unknown error occured
                        return res.status(500).send();
                    }
                } else {
                    //There was no error
                    let response = {"userid": result.insertId};
                    return res.status(201).send(response);
                }
            });
        }
    });
});

/**
 * Authenticates a user
 */
router.post("/authenticate", (req, res) => {
    //Trims the user input before passing it through to the authenticate method
    trimObject(req.body, (err, trimmedInput) => {
        //Check if there was an error
        if (err) {
            //There was an error
            console.log(err);
            return res.status(500).send();
        } else {
            //There was no error
            //Authenticate the user
            User.authenticate(trimmedInput.username, trimmedInput.password, (err, result) => {
                //Checks if there was an error
                if (err) {
                    //There was an error
                    console.log(err);
                    //Account details are invalid
                    return res.status(401).send();
                } else {
                    //There was no error, generate a JWT token and send it to the user
                    const payload = { userid: result.userid };
                    jwt.sign(payload, configs.JWTSecretKey, { algorithm: "HS256" }, (error, token) => {
                        //Check if there was an error
                        if (error) {
                            console.log(error);
                            res.status(401).send();
                            return;
                        }
                        //There was no error, send the JWT token and userid
                        res.status(200).send({
                            token: token,
                            userid: result.id,
                            username: result.username
                        });
                    });
                }
            });
        }
    });
});

//-- GET Request handling --//
/**
 * Retrieves data for all user accounts
 */
router.get("/", (req, res) => {
    //Retrieves a list of all the users
    User.getUsers((err, result) => {
        //Checks if there was an error
        if (err) {
            //There was an error
            console.log(err);
            return res.status(500).send();
        } else {
            //There was no error
            return res.status(200).send(result);
        }
    });
});

/**
 * Retrieves data for a specific user account
 */
router.get("/:id", (req, res) => {
    //Get the id supplied in the request parameter
    let userid = req.params.id;
    //Retrieves data for the user with a specific id
    User.getUserById(userid, (err, result) => {
        //Checks if there was an error
        if (err) {
            //There was an error
            console.log(err);
            return res.status(500).send();
        } else {
            //There was no error, check if any results were returned
            if (result.length > 0) {
                //There was at least 1 row returned
                return res.status(200).send(result[0]);
            } else {
                //No results were returned
                return res.status(500).send();
            }
        }
    });
});


//-- PUT request handling --//
/**
 * Updates the information of a user account that matches a specific userid
 */
router.put("/:id", isLoggedInMiddleware, (req, res) => {
    //Get the id supplied in the request parameter
    let userid = req.params.id;

    //Checks if the user is logged in to the account they are updating
    if (userid != req.decodedToken.userid) {
        //The user is not logged in to the correct account
        return res.status(401).send();
    }

    //Trims the user input before passing it through to the updateUser method
    trimObject(req.body, (err, trimmedInput) => {
        console.log("trimmedinput", trimmedInput);
        //Check if there was an error
        if (err) {
            //There was an error
            console.log(err);
            return res.status(500).send();
        } else {
            //Updates the information of a user with a specific id
            User.updateUser(userid, trimmedInput, (err, result) => {
                //Checks if there was an error
                if (err) {
                    //There was an error
                    console.log(err);
                    //Check if the error was due to a duplicate entry
                    if (err.code == "ER_DUP_ENTRY") {
                        //Error was caused by a duplicate entry. Check which column is affected
                        let response = {};
                        if (err.sqlMessage.includes("users.username")) {
                            //Username is already in use
                            response = {"message": "Username is already in use!", "affectedInputs": ["username"]};
                        } else if (err.sqlMessage.includes("users.email")) {
                            //Email is already in use
                            response = {"message": "Email address is already registered!", "affectedInputs": ["email"]};
                        }
                        return res.status(422).send(response);
                    //Check if error was due to password mismatch
                    } else if (err.code == "unauthorised") {
                        //Password mismatch
                        let response = {"message": "Old password is invalid", "affectedInputs": ["oldPassword"]};
                        return res.status(401).send(response);
                    //Check if error was due to the new password being the same as the old password
                    } else if (err.code == "same password") {
                        //The password is the same
                        let response = {"message": "New password cannot be the same as old password", "affectedInputs": ["password"]};
                        return res.status(422).send(response);
                    } else {
                        //Unknown error occured
                        return res.status(500).send();
                    }
                } else {
                    //There was no error
                    return res.status(204).send();
                }
            });
        }
    });
});

/**
 * Uploads a image to the server for a specific user
 */
/*
router.put("/:id/profilepic", isLoggedInMiddleware, (req, res) => {
    //Retrieve the userid from the url
    const userid = req.params.id;

    //Check if the user is logged in to the they are trying to modify
    if (req.decodedToken.userid != userid) {
        //The user is not logged in to the correct account
        return res.status(401).send();
    }

    //User is logged in to the correct account, handle the image upload
    upload(req, res, async (err) => {
        //Checks if there was an error
        if (err) {
            console.log(err);
            //Checks if the error is due to filesize limit
            if (err.code == "LIMIT_FILE_SIZE") {
                //The file being uploaded is too large
                return res.status(413).send();
            }
            return res.status(500).send();
        }

        //Get the file extension
        const fileExt = req.file.originalname.split(".").at(-1).replace(/ /g, "");

        //Check if the file extension is allowed
        if (fileExt !== 'png' && fileExt !== 'jpg' && fileExt !== 'jpeg') {
            //The file is not allowed
            console.log("Filetype not allowed");
            return res.status(415).send();
        }
        //The file passes the checks, it is allowed
        //Get a hash of the file
        const buffer = req.file.buffer;
        imageHash({
            name: req.file.originalname,
            data: buffer
        }, 16, true, (err, data) => {
            //Check if there was an error
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            //There was no error
            //Write the file to disk with a filepath of /uploads/ and filename of <hash of file> + <file ext>
            let filepath = `./uploads/profile_images/${data}.${fileExt}`;
            fs.writeFile(filepath, buffer, (err) => {
                //Checks if there was an error
                if (err) {
                    //There was an error
                    console.log(err);
                    return res.status(500).send();
                }
                //There was no error, save the filepath to db
                User.updateProfilePic(userid, `/profile_images/${data}.${fileExt}`, (err, result) => {
                    //Checks if there was an error
                    if (err) {
                        //There was an error
                        console.log(err);
                        return res.status(500).send();
                    }
                    //There was no error, return the url of the new image
                    let response = {"url": `/profile_images/${data}.${fileExt}`};
                    return res.status(200).send(response);
                });
            });
        });
    })
});
*/

//Export routes
module.exports = router;