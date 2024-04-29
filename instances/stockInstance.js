// Import the StockModel class from the "../models/stockModel" module
const Stock = require("../models/stockModel");

// Create a new instance of the StockModel class
const db = new Stock();

// Initialize the stock database by seeding it with sample data
db.init();

// Export the db instance to make it accessible to other modules
module.exports = db;