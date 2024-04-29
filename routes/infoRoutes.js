const express = require('express');
const router = express.Router();
const infoController = require('../controllers/infoController');


// Routes for informational pages
router.get("/", infoController.landing_page);
router.get("/contact", infoController.contact_page);
router.get("/about", infoController.about_page);

module.exports = router;
