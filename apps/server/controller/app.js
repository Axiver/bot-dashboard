//-- Import required modules --//
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

//-- Hook middlewares --//
app.use(cors());
app.use(bodyParser.json());

//-- Import API Routes --//
const users_routes = require("../routes/users_routes");
//const category_routes = require("../routes/category_routes");
//const product_routes = require("../routes/product_routes");
//const interest_routes = require("../routes/interest_routes");
//const promotion_routes = require("../routes/promotion_routes");
//const tracking_routes = require("../routes/tracking_routes");

//-- Mount API Routes --//
app.use('/api/v1/users/', users_routes);
//app.use('/api/category/', category_routes);
//app.use('/api/product/', product_routes);
//app.use('/api/interest/', interest_routes);
//app.use('/api/promotions/', promotion_routes);
//app.use('/api/tracking/', tracking_routes);

//-- Serve static files --//
//app.use("/uploads/", express.static('./uploads/'));

//Export the app
module.exports = app;