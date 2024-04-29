const nedb = require('nedb');

/**
 * Basket class for managing items in the basket.
 */
class Basket {
    /**
     * Initialize Basket with a database file path.
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


    init() {
    }

    /**
     * Add an item to the basket.
     * @param {string} type - The type of the product.
     * @param {string} productName - The name of the product.
     * @param {number} quantity - The quantity of the product.
     * @param {string} productId - The ID of the product.
     * @param {string} author - The author of the product.
     * @param {string} expiryDate - The expiry date of the product.
     * @param {string} dateAdded - The date when the product was added.
     */
    addItem(type, productName, quantity, productId, author, expiryDate, dateAdded) {
        this.db.findOne({ productId: productId }, (err, item) => {
            if (err) {
                console.error('Database error:', err);
                return;
            }

            if (item) {
                let newQuantity = item.quantity + quantity;
                this.db.update({ _id: item._id }, { $set: { quantity: newQuantity } }, {}, (err, numUpdated) => {
                    if (err) {
                        console.error('Error updating item quantity:', err);
                    } else {
                        console.log('Item quantity updated:', numUpdated);
                    }
                });
            } else {
                const newItem = { type, productName, quantity, productId, author, expiryDate, dateAdded };
                this.db.insert(newItem, function(err, doc) {
                    if (err) {
                        console.error('Error inserting item:', err);
                    } else {
                        console.log('Item inserted into the basket:', doc);
                    }
                });
            }
        });
    }

    /**
     * Get all items in the basket.
     * @returns {Promise} A promise that resolves with an array of items.
     */
    getAllItems() {
        return new Promise((resolve, reject) => {
            this.db.find({}, function(err, items) {
                if (err) {
                    reject(err);
                } else {
                    resolve(items);
                }
            });
        });
    }

    /**
     * Get an item from the basket by its ID.
     * @param {string} itemId - The ID of the item.
     * @returns {Promise} A promise that resolves with the item.
     */
    getItemById(itemId) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ _id: itemId }, function(err, item) {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                } else if (!item) {
                    console.log(`No item found with ID: ${itemId}`);
                    reject(new Error('Item not found'));
                } else {
                    resolve(item);
                }
            });
        });
    }

    /**
     * Remove an item from the basket by its ID.
     * @param {string} itemId - The ID of the item.
     */
    removeItem(itemId) {
        console.log('Attempting to remove item with ID:', itemId);
        this.db.remove({ _id: itemId }, { multi: false }, function(err, numRemoved) {
            if (err) {
                console.error('Error removing item:', err);
            } else if (numRemoved === 0) {
                console.log('No item was removed for ID:', itemId);
            } else {
                console.log('Item removed from the basket. Number of items removed:', numRemoved);
            }
        });
    }

    /**
     * Update the quantity of an item in the basket.
     * @param {string} itemId - The ID of the item.
     * @param {number} change - The change in quantity (positive or negative).
     * @returns {Promise} A promise that resolves with the number of items updated.
     */
    updateItemQuantity(itemId, change) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ _id: itemId }, (err, item) => {
                if (err) {
                    console.error('Error finding item:', err);
                    reject(err);
                    return;
                }
                if (!item) {
                    console.error('Item not found:', itemId);
                    reject(new Error('Item not found'));
                    return;
                }
                let newQuantity = item.quantity + change;
                if (newQuantity <= 0) {
                    this.db.remove({ _id: itemId }, {}, (err, numRemoved) => {
                        if (err) {
                            console.error('Error removing item:', err);
                            reject(err);
                        } else {
                            console.log('Item removed from the basket:', numRemoved);
                            resolve(numRemoved);
                        }
                    });
                } else {
                    this.db.update({ _id: itemId }, { $set: { quantity: newQuantity } }, {}, (err, numUpdated) => {
                        if (err) {
                            console.error('Error updating item quantity:', err);
                            reject(err);
                        } else {
                            console.log('Item quantity updated:', numUpdated);
                            resolve(numUpdated);
                        }
                    });
                }
            });
        });
    }

    /**
     * Clear all items from the basket.
     * @returns {Promise} A promise that resolves with the number of items removed.
     */
    clearAllItems() {
        return new Promise((resolve, reject) => {
            this.db.remove({}, { multi: true }, function(err, numRemoved) {
                if (err) {
                    reject(err);
                } else {
                    console.log(`All items removed from the basket, count: ${numRemoved}`);
                    resolve(numRemoved);
                }
            });
        });
    }

    /**
     * Clear all items from the basket on logout.
     * @returns {Promise} A promise that resolves when all items are removed.
     */
    clearBasketOnLogout() {
        return new Promise((resolve, reject) => {
            console.log('Starting to clear basket items...');
            this.getAllItems()
                .then(items => {
                    console.log(`Found ${items.length} items in the basket.`);
                    const promises = items.map(item => {
                        return this.removeItem(item._id)
                            .then(() => {
                                console.log(`Item ${item._id} removed from the basket.`);
                            })
                            .catch(err => {
                                console.error(`Error removing item ${item._id} from the basket:`, err);
                                throw err;
                            });
                    });
                    return Promise.all(promises);
                })
                .then(() => {
                    console.log('All basket items cleared successfully.');
                    resolve();
                })
                .catch(err => {
                    console.error('Error clearing basket items:', err);
                    reject(err);
                });
        });
    }
}

module.exports = Basket;
