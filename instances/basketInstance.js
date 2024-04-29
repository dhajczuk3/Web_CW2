// Import the BasketModel class from the "../models/basketModel" module
const basketModel = require("../models/basketModel");

// Create a new instance of the BasketModel class
const dbBasket = new basketModel();

// Initialize the basket by seeding the database with sample data
dbBasket.init();

// Export the dbBasket instance to make it accessible to other modules
module.exports = dbBasket;
