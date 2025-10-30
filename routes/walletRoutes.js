const express = require('express');
const { addMoney, withdrawMoney, verifyPayment } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/add-money', addMoney);
router.post('/withdraw',protect, withdrawMoney);
router.post('/verify-payment', verifyPayment);

module.exports = router;
