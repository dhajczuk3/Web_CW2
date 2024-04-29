const userDao = require('../models/userModel');
const db = require('../instances/stockInstance');
const dbBasket = require('../instances/basketInstance');
const messagesDB = require('../models/messageModel');

/**
 * Display the login page.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.show_login = function(req, res) {
    res.render("user/login");
};

/**
 * Handle user login.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.handle_login = function(req, res) {
    const user = req.user;

    if (!user) {
        return res.render("/user/login", { error: "Session expired or invalid, please log in again." });
    }

    if (user.isAdmin) {
        res.redirect("/entries");  // Redirect admins to the admin dashboard
    } else {
        res.redirect("/entries");  // Redirect regular users to a general page
    }
};

/**
 * Render the logged-in landing page.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.loggedIn_landing = function (req, res) {
    if (!req.user) {
        return res.redirect('/login');
    }
    db.getAllEntries()
        .then((list) => {
            res.render("home", {
                title: "Home",
                user: req.session.user,
                entries: list,
                showAdminLink: req.user && req.user.isAdmin
            });
        })
        .catch((err) => {
            console.error("Error loading the entries page", err);
        });
};

/**
 * Logout the user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.logout = function(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session during logout:', err);
            return res.status(500).render('error', { error: 'Failed to logout' });
        }
        dbBasket.getAllItems()
            .then(items => {
                const returnToStockPromises = items.map(item => {
                    return db.getProductById(item.productId)
                        .then(product => {
                            if (product) {
                                return db.updateProductQuantity(item.productId, item.quantity);
                            } else {
                                return db.addEntry(item.type, item.productName, item.quantity, item.author, item.expiryDate, item.dateAdded);
                            }
                        })
                        .then(() => {
                            return dbBasket.removeItem(item._id);
                        });
                });
                return Promise.all(returnToStockPromises);
            })
            .then(() => {
                res.clearCookie('cookieParser', { path: '/' }); 
                res.redirect('/');
            })
            .catch(err => {
                console.error('Error during logout:', err);
                res.redirect('/');
            });
    });
};

/**
 * Display the user registration page.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.show_register_page = function(req, res) {
    res.render("user/register");
};

/**
 * Handle new user registration.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.post_new_user = function(req, res) {
    const user = req.body.username;
    const password = req.body.pass;

    userDao.lookup(user, function (err, u) {
        if (u) {
            res.render('user/register', { error: 'User already exists, please login' });
            return;
        }
        userDao.create(user, password);
        console.log("Registered user", user);
        res.redirect("/login");
    });
};

/**
 * Display the admin dashboard.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.show_admin_view = function(req, res) {
    Promise.all([
        userDao.getAllUsers(),
        db.getAllEntries()
    ])
    .then(([users, list]) => {
        let activeTab = req.query.tab || 'users';
        res.render("user/adminView", {
            title: "Admin Dashboard",
            users: users,
            entries: list,
            activeTab: activeTab,
            user: req.session.user,
            showAdminLink: req.user && req.user.isAdmin,
            isAdmin: req.user && req.user.isAdmin
        });
    })
    .catch((err) => {
        console.error("Failed to fetch admin data", err);
        res.status(500).render('error', { error: 'Failed to fetch data' });
    });
};

/**
 * Update user information.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.updateUser = function(req, res) {
    const userId = req.params.id;
    const newDetails = req.body;
    userDao.updateUser(userId, newDetails, (err, success) => {
        if (err || !success) {
            res.status(500).json({ error: "Failed to update user" });
        } else {
            res.redirect('/user/adminView');
        }
    });
};

/**
 * Delete a user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.deleteUser = function(req, res) {
    userDao.deleteUser(req.params.id, (err, success) => {
        if (err || !success) {
            res.status(500).json({ error: "Failed to delete user" });
        } else {
            res.redirect('/adminView');
        }
    });
};

/**
 * Display the form for adding new entries.
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
    const currentUser = req.user;

    if (!req.body.productName) {
        res.status(400).send("Product name is required.");
        return;
    }

    db.addEntry(req.body.type, req.body.productName, req.body.quantity, currentUser, req.body.expiryDate, new Date().toISOString().split('T')[0]);
    res.redirect("/stock");
};

/**
 * Display entries by a specific user.
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
 * Send a message.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.send_message = async function(req, res) {
    try {
        const { name, email, message } = req.body;
        console.log("Received message from:", name);
        console.log("Email:", email);
        console.log("Message:", message);

        res.render("thankyou_message");
    } catch (err) {
        console.error('Error processing the message:', err);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Display all messages.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.displayMessages = function(req, res) {
    messagesDB.getAllMessages()
        .then(messages => {
            res.render('messagesPage', { messages });
        })
        .catch(err => {
            console.error('Error fetching messages:', err);
            res.status(500).send('Internal Server Error');
        });
};
