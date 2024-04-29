const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

/**
 * Controller function for handling user login.
 */
exports.login = function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  userModel.lookup(username, function (err, user) {
    if (err) {
      console.log("Error looking up user", err);
      return res.render("user/login", { error: "Invalid credentials, try again." });
    }
    if (!user) {
      return res.render("user/login", { error: "Invalid credentials, try again." });
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        let payload = { username: username, isAdmin: user.isAdmin };
        let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '300s' });
        res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        if (user.isAdmin) {
          req.session.user = { username: username, isAdmin: user.isAdmin };
          res.redirect('/loggedIn'); // Admins go directly to the admin dashboard
        } else {
          req.session.user = { username: username, isAdmin: user.isAdmin };
          res.redirect('/loggedIn'); // Regular users go to a general landing page
        }
      } else {
        return res.render("user/login", { error: "Invalid credentials, try again." });
      }
    });
  });
};

/**
 * Middleware function to verify user authentication token.
 */
exports.verify = function (req, res, next) {
  let accessToken = req.cookies.jwt;
  if (!accessToken) {
    return res.render('landingPage', { error: "Access denied. No token provided." });
  }
  try {
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = payload;  // Attaching the payload to the request so it can be used downstream
    next();
  } catch (e) {
    res.status(401).send("Invalid token.");
  }
};
