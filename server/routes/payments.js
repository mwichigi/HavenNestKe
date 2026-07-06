// payments.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { initiateMpesaPayment, mpesaCallback, getPaymentHistory } = require('../controllers/paymentController');

router.post('/mpesa/pay', authMiddleware, initiateMpesaPayment);
router.post('/mpesa/callback', mpesaCallback);
router.get('/history', authMiddleware, getPaymentHistory);

module.exports = router;
