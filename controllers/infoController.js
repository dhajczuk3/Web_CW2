// Controller for informational pages

const stockDAO = require('../models/stockModel');
const db = new stockDAO();
db.init();

/**
 * Controller function for rendering the landing or home page.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.landing_page = function (req, res) {
    db.getAllEntries()
        .then((list) => {
            res.render("home", {
                title: "Home",
                entries: list,
                user: req.session.user,
                showAdminLink: req.user && req.user.isAdmin
            });
        })
        .catch((err) => {
            console.log("Error loading the home page", err);
        });
};

/**
 * Controller function for rendering the about page.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.about_page = function (req, res) {
    res.render("about", {
        title: "About",
        user: req.session.user,
        isAdmin: req.session.user && req.session.user.isAdmin
    });
};

/**
 * Controller function for rendering the contact page.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.contact_page = function (req, res) {
    res.render("contact", {
        title: "Contact",
        user: req.session.user,
        isAdmin: req.session.user && req.session.user.isAdmin
    });
};
