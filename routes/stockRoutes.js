const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { verify } = require('../auth/auth');


// Route to display the stock page
router.get("/stock", stockController.stock_page);

// Route to delete a stock item
router.post('/product/deleteProduct/:id', stockController.deleteProduct);

// Route to display purchase confirmation page
router.post("/buy", stockController.showPurchaseConfirmation);

// Route to confirm a purchase
router.post("/confirmPurchase", stockController.confirmPurchase);

router.get('/new', stockController.show_new_entries);
router.post('/new', stockController.post_new_entry);

router.post("/return_to_stock", stockController.return_to_stock);

// Route to display the basket page
router.get("/basket", verify,stockController.show_basket);

// Route to handle adding items to the basket
router.post("/addToBasket", stockController.add_to_basket);

module.exports = router;
