const express = require('express');
const r = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../config/db');
const { logActivity } = require('../config/logger');

// Get active lease for current tenant
r.get('/my', authMiddleware, async (req, res) => {
  const result = await db.query(
    `SELECT l.*, p.title, p.town, p.estate, p.full_address, p.rent_amount
     FROM leases l JOIN properties p ON l.property_id = p.id
     WHERE l.tenant_id = $1 AND l.status NOT IN ('expired','terminated')
     ORDER BY l.created_at DESC LIMIT 1`,
    [req.user.id]
  );
  res.json(result.rows[0] || null);
});

// Get a single lease by ID (with property + landlord details)
r.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, p.title, p.town, p.estate, p.full_address, p.rent_amount,
              u.full_name as landlord_name, u.is_verified as landlord_verified
       FROM leases l
       JOIN properties p ON l.property_id = p.id
       JOIN users u ON l.landlord_id = u.id
       WHERE l.id = $1 AND (l.tenant_id = $2 OR l.landlord_id = $2)`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lease not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lease', details: err.message });
  }
});

// Tenant signs lease
r.patch('/:id/sign', authMiddleware, async (req, res) => {
  await db.query(
    `UPDATE leases SET tenant_signed_at = NOW(),
     status = CASE WHEN landlord_signed_at IS NOT NULL THEN 'active' ELSE 'pending_landlord' END,
     updated_at = NOW() WHERE id = $1`,
    [req.params.id]
  );
  await logActivity(req.user.id, 'lease_signed', `Lease ID: ${req.params.id}`, req.ip);
  res.json({ message: '✅ Lease signed successfully!' });
});

module.exports = r;
