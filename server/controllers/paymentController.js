const axios = require('axios');
const db = require('../config/db');
const { logActivity } = require('../config/logger');

// ── GET M-PESA ACCESS TOKEN ──
const getMpesaToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
};

// ── STK PUSH (trigger M-Pesa prompt on phone) ──
const initiateMpesaPayment = async (req, res) => {
  const { lease_id, phone, amount } = req.body;

  try {
    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_PAYBILL}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_PAYBILL,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_PAYBILL,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `NK-${lease_id}`,
        TransactionDesc: 'HaveNestKe Rent Payment',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Save pending payment record
    const now = new Date();
    await db.query(
      `INSERT INTO payments (lease_id, tenant_id, amount, payment_type, payment_method,
        status, period_month, period_year)
       VALUES ($1, $2, $3, 'rent', 'mpesa', 'pending', $4, $5)`,
      [lease_id, req.user.id, amount, now.getMonth() + 1, now.getFullYear()]
    );

    await logActivity(req.user.id, 'payment_initiated', `Amount: ${amount}, Lease: ${lease_id}`, req.ip);
    res.json({
      message: 'M-Pesa prompt sent to your phone. Enter your PIN to complete.',
      CheckoutRequestID: stkResponse.data.CheckoutRequestID,
    });
  } catch (err) {
    res.status(500).json({ error: 'M-Pesa payment failed', details: err.message });
  }
};

// ── M-PESA CALLBACK (Safaricom calls this after payment) ──
const mpesaCallback = async (req, res) => {
  const { Body } = req.body;
  const result = Body?.stkCallback;

  if (result?.ResultCode === 0) {
    const items = result.CallbackMetadata?.Item || [];
    const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = items.find(i => i.Name === 'Amount')?.Value;

    await db.query(
      `UPDATE payments SET status = 'paid', mpesa_receipt_number = $1, paid_at = NOW()
       WHERE mpesa_transaction_id = $2 OR (status = 'pending' AND amount = $3)`,
      [receipt, result.CheckoutRequestID, amount]
    );

    // Update rental score on successful payment
    await db.query(
      `UPDATE users SET rental_score = LEAST(850, rental_score + 5)
       WHERE id = (SELECT tenant_id FROM payments WHERE mpesa_receipt_number = $1)`,
      [receipt]
    );
    await logActivity(null, 'payment_confirmed', `Receipt: ${receipt}, Amount: ${amount}`, null);
  }

  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
};

// ── GET PAYMENT HISTORY ──
const getPaymentHistory = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, l.property_id,
              pr.title as property_title, pr.town as property_town
       FROM payments p
       JOIN leases l ON p.lease_id = l.id
       JOIN properties pr ON l.property_id = pr.id
       WHERE p.tenant_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ payments: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
};

module.exports = { initiateMpesaPayment, mpesaCallback, getPaymentHistory };
