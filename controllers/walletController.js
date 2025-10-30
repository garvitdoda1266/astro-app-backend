const { createOrder, verifyPaymentWithRazorpay, withdrawFromWallet } = require('../services/walletService');

async function addMoney(req, res) {
  try {
    const { user_id, amount } = req.body;
    if (!user_id || !amount) return res.status(400).send('Missing params');
    const order = await createOrder(user_id, amount);
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
}

async function withdrawMoney(req, res) {
  try {
    const amount = req.body.amount;
    const payout = await withdrawFromWallet(req.user._id, amount);
    res.json(payout);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function verifyPayment(req, res){
  try {
    const { payment_id, user_id, amount } = req.body;
    const success=verifyPaymentWithRazorpay(payment_id, user_id, amount);
    if(success){
      res.status(200).json({ status: 'success', message: 'Payment verified and wallet credited' });
    }
    else{
      res.status(404).json({ status: 'Not Found', message: 'Payment not verified' });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = { addMoney, withdrawMoney, verifyPayment };
