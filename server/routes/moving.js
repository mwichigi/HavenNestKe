const express = require('express');
const r = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../config/db');

r.get('/providers', async (req, res) => {
  // In production this would be a DB table; for now return static data
  res.json({
    movers: [
      { id: 1, name: 'SafeMove Kenya', price_from: 3500, rating: 4.9, moves: 312 },
      { id: 2, name: 'QuickShift', price_from: 2800, rating: 4.7, moves: 187 },
    ],
    cleaners: [
      { id: 3, name: 'CleanNest', price_from: 1800, rating: 4.9 },
      { id: 4, name: 'SparklePro', price_from: 1500, rating: 4.7 },
    ],
    internet: [
      { id: 5, name: 'Safaricom Fibre', price_from: 2999, speed: '100Mbps' },
      { id: 6, name: 'Zuku Fibre', price_from: 2499, speed: '40Mbps' },
    ],
  });
});

r.post('/book', authMiddleware, async (req, res) => {
  const { lease_id, service_type, provider_name, scheduled_date, cost } = req.body;
  const result = await db.query(
    `INSERT INTO moving_bookings (tenant_id, lease_id, service_type, provider_name, scheduled_date, cost)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, lease_id, service_type, provider_name, scheduled_date, cost]
  );
  res.status(201).json({ message: 'Booking confirmed!', booking: result.rows[0] });
});

module.exports = r;
