//-- Load required libraries --//
import axios from 'axios';


//-- GET Requests --//



//-- POST Requests --//
/**
 * Authenticates the user using the provided username and password
 * @param username The username of the account
 * @param password The matching password
 * @param callback Invoked when the request is complete
 */
const authenticateUser = (username: string, password: string, callback: Function) => {
  //Sends a POST request to the server
  const reqUrl = '/api/v1/users/authenticate/';
  axios.post(reqUrl, {
    username: username,
    password: password
}).then((response) => {
    //Invoke the callback with the server response
    if (callback)
      callback(null, response);
    return;
  }).catch((err) => {
    //An error occured, return the error
    callback(err.response.data);
  });
}


//Expose methods
export default {
  authenticateUser
};