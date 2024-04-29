const nedb = require('nedb');

/**
 * Stock class for managing stock items.
 */
class Stock {
    /**
     * Create a new Stock instance.
     * @param {string} dbFilePath - The file path for the database.
     */
    constructor(dbFilePath) {
        if (dbFilePath) {
            this.db = new nedb({ filename: dbFilePath, autoload: true });
            console.log('DB connected to ' + dbFilePath);
        } else {
            this.db = new nedb();
        }
    }

    /**
     * Initialize the stock with sample data.
     */
    init() {
        // Insert sample data into the stock
        this.db.insert([
            {
                type: 'Dairy',
                productName: 'Milk',
                quantity: 1,
                author: 'Peter',
                expiryDate: '2020-02-20',
                dateAdded: '2020-02-15'
            },
            {
                type: "Dairy",
                productName: "Eggs",
                quantity: 2,
                author: "Peter",
                expiryDate: "2020-02-20",
                dateAdded: "2020-02-15"
            },
            {
                type: "Dairy",
                productName: "Butter",
                quantity: 2,
                author: "Ann",
                expiryDate: "2020-02-20",
                dateAdded: "2020-02-15"
            }
        ], function (err) {
            if (err) {
                console.error('Error inserting sample data:', err);
            } else {
                console.log('Sample data inserted into the stock.');
            }
        });
    }

    /**
     * Get all entries from the stock.
     * @returns {Promise} A promise that resolves with an array of entries.
     */
    getAllEntries() {
        return new Promise((resolve, reject) => {
            this.db.find({}, function(err, entries) {
                if (err) {
                    reject(err);
                } else {
                    console.log('getAllEntries() returns:', entries);
                    resolve(entries);
                }
            });
        });
    }

    /**
     * Get entries by a specific user.
     * @param {string} authorName - The name of the author.
     * @returns {Promise} A promise that resolves with an array of entries by the specified user.
     */
    getEntriesByUser(authorName) {
        return new Promise((resolve, reject) => {
            this.db.find({ 'author': authorName }, function(err, entries) {
                if (err) {
                    reject(err);
                } else {
                    console.log('getEntriesByUser returns:', entries);
                    resolve(entries);
                }
            });
        });
    }

    /**
     * Add a new entry to the stock.
     * @param {string} type - The type of the product.
     * @param {string} productName - The name of the product.
     * @param {number} quantity - The quantity of the product.
     * @param {string} user - The author of the entry.
     * @param {string} expiryDate - The expiry date of the product.
     * @param {string} dateAdded - The date when the product was added.
     */
    addEntry(type, productName, quantity, user, expiryDate, dateAdded) {
        const newProduct = {
            type,
            productName,
            quantity: parseInt(quantity, 10),
            author: user,
            expiryDate,
            dateAdded
        };

        this.db.findOne({ productName: productName, author: user }, (err, product) => {
            if (err) {
                console.error('Error finding product:', err);
                return;
            }

            if (product) {
                // If product exists, increase its quantity by the specified amount
                let newQuantity = product.quantity + parseInt(quantity, 10);
                this.db.update({ _id: product._id }, { $set: { quantity: newQuantity } }, {}, (err, numUpdated) => {
                    if (err) {
                        console.error('Error updating product quantity:', err);
                    } else {
                        console.log('Product quantity updated:', numUpdated);
                    }
                });
            } else {
                // If product does not exist, insert new product
                this.db.insert(newProduct, function(err, doc) {
                    if (err) {
                        console.error('Error inserting new product:', err);
                    } else {
                        console.log('New product added to the stock:', doc);
                    }
                });
            }
        });
    }

    /**
     * Delete a product from the stock.
     * @param {string} productId - The ID of the product to delete.
     * @returns {Promise} A promise that resolves with the number of removed documents.
     */
    deleteProduct(productId) {
        return new Promise((resolve, reject) => {
            this.db.remove({ _id: productId }, {}, function(err, numRemoved) {
                if (err) {
                    console.error('Error removing product:', err);
                    reject(err);
                } else {
                    console.log(`Product with ID ${productId} removed successfully`);
                    resolve(numRemoved);
                }
            });
        });
    }

    /**
     * Get a product by its ID.
     * @param {string} productId - The ID of the product.
     * @returns {Promise} A promise that resolves with the product object.
     */
    getProductById(productId) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ _id: productId }, function(err, product) {
                if (err) {
                    console.error('Error finding product:', err);
                    reject(err);
                } else if (!product) {
                    console.log(`No product found with ID ${productId}`);
                    resolve(null);
                } else {
                    resolve(product);
                }
            });
        });
    }

    /**
     * Update the quantity of a product in the stock.
     * If the quantity reaches zero or less, the product is removed from the stock.
     * @param {string} productId - The ID of the product to update.
     * @param {number} quantityChange - The amount by which to increment (or decrement) the product quantity.
     * @returns {Promise} A promise that resolves with the number of updated documents or rejects with an error.
     */
    updateProductQuantity(productId, quantityChange) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ _id: productId }, (err, product) => {
                if (err) {
                    console.error('Error finding product:', err);
                    reject(err);
                    return;
                }

                if (!product) {
                    console.error('Product not found:', productId);
                    reject(new Error('Product not found with ID: ' + productId));
                    return;
                }

                let newQuantity = (product.quantity || 0) + quantityChange;
                if (newQuantity <= 0) {
                    // If quantity reaches zero or less, remove the product from the stock
                    this.db.remove({ _id: productId }, {}, (err, numRemoved) => {
                        if (err) {
                            console.error('Error removing product:', err);
                            reject(err);
                        } else {
                            console.log('Product removed from stock due to zero quantity');
                            resolve(numRemoved);
                        }
                    });
                } else {
                    // Update the quantity of the product
                    this.db.update({ _id: productId }, { $set: { quantity: newQuantity } }, {}, (err, numUpdated) => {
                        if (err) {
                            console.error('Error updating product quantity:', err);
                            reject(err);
                        } else {
                            console.log('Product quantity updated:', numUpdated);
                            resolve(numUpdated);
                        }
                    });
                }
            });
        });
    }

    /**
     * Increase the quantity of a product in the stock.
     * @param {string} productId - The ID of the product to update.
     * @param {number} increment - The amount by which to increase the product quantity.
     * @returns {Promise} A promise that resolves with the number of updated documents or rejects with an error.
     */
    increaseProductQuantity(productId, increment) {
        return new Promise((resolve, reject) => {
            if (!productId) {
                console.error('Product ID is undefined in increaseProductQuantity');
                reject(new Error('Product ID is undefined'));
                return;
            }
            
            this.db.findOne({ _id: productId }, (err, product) => {
                if (err) {
                    console.error('Error finding product:', err);
                    reject(err);
                    return;
                }

                if (!product) {
                    console.error('Product not found:', productId);
                    reject(new Error('Product not found with ID: ' + productId));
                    return;
                }

                // Ensure the quantity is a number
                if (typeof product.quantity !== 'number') {
                    console.error('Product quantity is not a number:', product.quantity);
                    reject(new Error('Product quantity is not a number'));
                    return;
                }

                // Increment the quantity
                this.db.update({ _id: productId }, { $inc: { quantity: increment } }, {}, (err, numUpdated) => {
                    if (err) {
                        console.error('Error increasing product quantity:', err);
                        reject(err);
                    } else {
                        console.log('Product quantity increased:', numUpdated);
                        resolve(numUpdated);
                    }
                });
            });
        });
    }

    /**
     * Function to correct quantities in the stock.
     */
    correctQuantities() {
        this.db.find({}, (err, products) => {
            if (err) {
                console.error('Error fetching products:', err);
                return;
            }

            products.forEach(product => {
                let quantity = parseInt(product.quantity);
                if (isNaN(quantity)) {
                    quantity = 0; // Default to 0 if the current value is not a number
                }

                this.db.update({ _id: product._id }, { $set: { quantity: quantity } }, {}, (err) => {
                    if (err) {
                        console.error('Error updating product quantity:', err);
                    } else {
                        console.log('Corrected quantity for product:', product._id);
                    }
                });
            });
        });
    }
}

module.exports = Stock;
