
const razorpay = require('../config/razorpay');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const axios = require('axios');

const razorpayClient = axios.create({
  baseURL: 'https://api.razorpay.com/v1',
  auth: {
    username: process.env.RAZORPAY_KEY_ID,
    password: process.env.RAZORPAY_KEY_SECRET,
  },
});

/**
 * Create Razorpay order and save transaction in MongoDB
 */
async function createOrder(userId, amount) {
  const order = await razorpay.orders.create({
    amount: amount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    payment_capture: 1,
  });

  // Save transaction in MongoDB
  await Transaction.create({
    userId:userId,
    type: 'add',
    amount: amount * 100,
    status: 'created',
    razorpayOrderId: order.id
  });

  return order;
}


/**
 * Verify payment with Razorpay API and update wallet
 */
async function verifyPaymentWithRazorpay(paymentId, userId, amount) {
  const payment = await razorpay.payments.fetch(paymentId);

  if (payment.status === 'captured' && payment.amount === amount * 100) {
    // Protect route with auth middleware — userId should come from token ideally
    await User.findByIdAndUpdate(userId, {
      $inc: { walletBalance: amount },
    });

    await Transaction.findOneAndUpdate(
      { razorpayOrderId: payment.order_id },
      {
        status: 'captured',
        razorpayPaymentId: payment.id,
      },
      { new: true }
    );

    return true;
  } else {
    return false;
  }
}

async function withdrawFromWallet(userId, amount){
  const user = await User.findById(userId);

  if (!user) throw new Error('User not found');
  if (user.walletBalance < amount) throw new Error('Insufficient balance');

  // 🔹 Create a new Transaction
  const transaction = await Transaction.create({
    userId,
    type: 'withdraw',
    amount,
    status: 'created',
  });

  // 🔹 Simulate creating a RazorpayX payout (test mode)
  const payoutPayload = {
    account_number: "2323230076543210", // RazorpayX virtual account (works in test)
    fund_account: {
      account_type: "bank_account",
      bank_account: {
        name: 'Garvit',
        ifsc: 'PUNB00',
        account_number: '1233444'
      },
      contact: {
        name: user.name,
        email: user.email || "test@example.com",
        contact: user.phone || "9999999999",
        type: "employee"
      }
    },
    amount: amount * 100,
    currency: "INR",
    mode: "IMPS",
    purpose: "payout",
    queue_if_low_balance: true,
    reference_id: transaction._id.toString(),
    narration: "Wallet Withdrawal"
  };

  try {
    const response = await razorpayClient.post('/payouts', payoutPayload);

    // Update transaction
    transaction.status = response.data.status || 'processed';
    transaction.razorpayPaymentId = response.data.id;
    await transaction.save();

    // Deduct wallet balance
    user.walletBalance -= amount;
    await user.save();

    return { success: true, transaction };
  } catch (err) {
    console.error('Withdraw failed:', err.response?.data || err.message);
    transaction.status = 'failed';
    await transaction.save();
    throw new Error('Withdrawal failed');
  }
};



module.exports = { createOrder, verifyPaymentWithRazorpay, withdrawFromWallet };
