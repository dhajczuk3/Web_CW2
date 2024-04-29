const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { login, verify } = require('../auth/auth');
const messagesDB = require('../models/messageModel');


// User login and logout routes
router.get("/loggedIn", verify, userController.loggedIn_landing);
router.get('/login', userController.show_login);
router.post('/login', login);
router.get('/login/success', userController.handle_login);
router.get("/logout", userController.logout);

// User registration routes
router.get('/register', userController.show_register_page);
router.post('/register', userController.post_new_user);

// Admin dashboard and user management routes
router.post('/user/update/:id', userController.updateUser);
router.post("/user/delete/:id", userController.deleteUser);

// Route to display the form to add a new entry
router.get('/new', verify, userController.show_new_entries);
router.get('/adminView', verify, userController.show_admin_view);

// Route to handle the submission of the new entry form
router.post('/new', verify, userController.post_new_entry);

// Route to show entries by a specific user
router.get('/entries/:author', userController.show_user_entries);

// Route to handle sending a message
router.post('/sendMessage', userController.send_message);

// Route to display all messages
router.get("/messagesPage", userController.displayMessages);

// Route to display the Thank You For Message page
router.get('/thankyou_message', userController.send_message);

module.exports = router;
