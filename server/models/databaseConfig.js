//Import required modules
const { Client } = require('pg');

//Declare a pre-configured getConnection() method
const dbconnect = {
    getConnection: () => {
        const conn = new Client({
            user: 'postgres',
			host: 'localhost',
			database: 'bot-dashboard',
			password: 'defaultPassword',
			port: 3211,
        });     
        return conn;
    }
};

//Export the db config
module.exports = dbconnect;