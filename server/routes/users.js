const express = require('express');
const r = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../config/db');

// Update profile
r.patch('/me', authMiddleware, async (req, res) => {
  const { full_name, phone, language, segment } = req.body;
  const result = await db.query(
    `UPDATE users SET full_name=COALESCE($1,full_name), phone=COALESCE($2,phone),
     language=COALESCE($3,language), segment=COALESCE($4,segment), updated_at=NOW()
     WHERE id=$5 RETURNING id, full_name, email, phone, role, segment, rental_score, language`,
    [full_name, phone, language, segment, req.user.id]
  );
  res.json({ user: result.rows[0] });
});

// Get saved properties
r.get('/me/saved', authMiddleware, async (req, res) => {
  const result = await db.query(
    `SELECT p.* FROM saved_properties sp
     JOIN properties p ON sp.property_id = p.id
     WHERE sp.tenant_id = $1 ORDER BY sp.created_at DESC`,
    [req.user.id]
  );
  res.json({ saved: result.rows });
});

module.exports = r;
