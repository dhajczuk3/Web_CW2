const db = require('../instances/stockInstance')
const dbBasket = require('../instances/basketInstance')

/**
 * Display all stock items on the stock page.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.stock_page = function(req, res) {
    db.getAllEntries()
        .then((list) => {
            res.render("stock", {
                title: "Stock",
                entries: list,
                user: req.session.user,
                showAdminLink: req.user && req.user.isAdmin
            });
        })
        .catch((err) => {
            console.error("Error loading the stock page", err);
        });
};

/**
 * Handle the deletion of a stock item.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.deleteProduct = function(req, res) {
    const productId = req.params.id;
    db.getProductById(productId)
        .then(product => {
            if (!product) {
                res.status(404).send("Product not found or already deleted.");
            } else {
                return db.deleteProduct(productId);
            }
        })
        .then(numRemoved => {
            if (numRemoved) {
                res.redirect('/adminView'); // Redirect to a specific admin view if required
            }
        })
        .catch(err => {
            console.error('Error deleting product:', err);
            res.status(500).render('error', { error: 'Failed to delete product' });
        });
};

/**
 * Show the purchase confirmation page for selected stock items.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.showPurchaseConfirmation = function(req, res) {
    dbBasket.getAllItems()
        .then(items => {
            if (items.length === 0) {
                return res.status(400).send("No items in the basket for confirmation.");
            }
            res.render("purchaseConfirmation", { items: items });
        })
        .catch(err => {
            console.error('Error fetching items from the basket:', err);
            res.status(500).send("Internal server error");
        });
};

/**
 * Confirm the purchase of items in the basket.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.confirmPurchase = function(req, res) {
    dbBasket.clearAllItems()
    .then(() => {
        res.render('purchaseSuccess'); // Display a success message or page
    })
    .catch(err => {
        console.error('Error during purchase confirmation:', err);
        res.status(500).render('error', { error: 'Internal Server Error during purchase confirmation' });
    });
};

/**
 * Render the form for adding a new entry.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.show_new_entries = function (req, res) {
    res.render("newEntry", {
      title: "Add Item",
      user: "user"
    });
  };
  
/**
 * Handle adding a new product.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.post_new_entry = function (req, res) {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    const expiryDate = req.body.expiryDate;

    if (!req.body.productName || expiryDate < minDate) {  // Validate productName and expiryDate
        res.status(400).send("Entries must have a productName and a valid expiryDate.");
        return;
    }

    // Pobranie nazwy zalogowanego użytkownika z sesji
    const username = req.session.user.username;  // Zakładając, że 'username' to właściwość w 'req.user'

    db.addEntry(req.body.type, req.body.productName, req.body.quantity, username, expiryDate, new Date().toISOString().split('T')[0]);
    res.redirect("/stock");  // Redirect to the stock page to see all entries
};

/**
 * Show the entries of a specific user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.show_user_entries = function (req, res) {
    let user = req.params.author;
    db.getEntriesByUser(user)
        .then((entries) => {
            res.render("entries", {
                title: "Guest Book",
                user: "user",
                entries: entries,
            });
        })
        .catch((err) => {
            console.log("Error: ");
            console.log(JSON.stringify(err));
        });
};

/**
 * Display items currently in the basket.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.show_basket = function(req, res) {
    dbBasket.getAllItems()
        .then(items => {
            res.render("basket", { items: items,
                user: req.session.user,
                showAdminLink: req.user && req.user.isAdmin });
        })
        .catch(err => {
            console.error('Error fetching items from the basket:', err);
            res.status(500).render('error', { error: 'Failed to fetch items from the basket' });
        });
};

/**
 * Add a product to the basket.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.add_to_basket = function(req, res) {
    const productId = req.body.productId;

    db.getProductById(productId)
    .then(product => {
        if (!product) {
            return res.status(404).send('Product not found');
        }
        if (product.quantity <= 0) {
            return res.status(400).send('Insufficient stock available');
        }
        // Decrement the product quantity in the database
        return db.updateProductQuantity(productId, -1)
        .then(() => {
            // After updating stock, add item to the basket
            return dbBasket.addItem(product.type, product.productName, 1, productId, product.author, product.expiryDate, product.dateAdded)
        })
        .then(() => {
            res.redirect('/stock');
        });
    })
    .catch(err => {
        console.error('Error during adding to basket:', err);
        res.status(500).send('Internal Server Error');
    });
};

/**
 * Return an item to the stock from the basket.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.return_to_stock = function(req, res) {
    const itemId = req.body.itemId;

    dbBasket.getItemById(itemId)
    .then(item => {
        if (!item) {
            throw new Error('Item not found in basket');
        }
        if (item.quantity <= 0) {
            throw new Error('Invalid item quantity in basket');
        }

        // Check if the product exists in stock
        return db.getProductById(item.productId)
        .then(product => {
            if (product) {
                // If product exists, increase its quantity by one
                return db.updateProductQuantity(item.productId, 1);
            } else {
                // If product does not exist, create a new entry in stock with quantity of one
                return db.addEntry(item.type, item.productName, 1, item.author, item.expiryDate, item.dateAdded);
            }
        })
        .then(() => {
            if (item.quantity > 1) {
                // If more than one item remains in the basket, decrement the quantity by one
                return dbBasket.updateItemQuantity(item._id, -1);
            } else {
                // If exactly one item remains, remove it from the basket
                return dbBasket.removeItem(itemId);
            }
        })
        .then(() => {
            res.redirect('/basket');
        });
    })
    .catch(err => {
        console.error('Error in processing return to stock:', err);
        res.status(500).send(err.message || 'Internal Server Error');
    });
};
