const express = require('express');
const { addMoney, withdrawMoney, verifyPayment } = require('../controllers/walletController');
const { protect, userOnly } = require('../middleware/auth');

const router = express.Router();

// remove protect and userOnly for local testing
router.post('/add-money', protect, userOnly, addMoney);
router.post('/withdraw',protect, withdrawMoney);
router.post('/verify-payment',protect, userOnly, verifyPayment);

module.exports = router;
