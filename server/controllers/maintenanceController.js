const db = require('../config/db');

// ── GET ALL REQUESTS FOR TENANT ──
const getRequests = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT mr.*, p.title as property_title, p.town
       FROM maintenance_requests mr
       JOIN properties p ON mr.property_id = p.id
       WHERE mr.tenant_id = $1
       ORDER BY mr.created_at DESC`,
      [req.user.id]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests', details: err.message });
  }
};

// ── CREATE NEW REQUEST ──
const createRequest = async (req, res) => {
  const { lease_id, property_id, category, urgency, title, description } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO maintenance_requests
        (lease_id, tenant_id, property_id, category, urgency, title, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [lease_id, req.user.id, property_id, category, urgency, title, description]
    );
    res.status(201).json({
      message: 'Maintenance request submitted! Landlord notified.',
      request: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit request', details: err.message });
  }
};

// ── UPDATE REQUEST STATUS (landlord) ──
const updateRequest = async (req, res) => {
  const { status, landlord_response, scheduled_date } = req.body;
  try {
    const resolved_at = status === 'resolved' ? 'NOW()' : 'NULL';
    const result = await db.query(
      `UPDATE maintenance_requests
       SET status = $1, landlord_response = $2, scheduled_date = $3,
           resolved_at = ${resolved_at}, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, landlord_response, scheduled_date, req.params.id]
    );
    res.json({ message: 'Request updated.', request: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request', details: err.message });
  }
};

module.exports = { getRequests, createRequest, updateRequest };
