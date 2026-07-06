const db = require('../config/db');
const { logActivity } = require('../config/logger');

// ── GET LANDLORD OVERVIEW ──
const getDashboard = async (req, res) => {
  const landlord_id = req.user.id;
  try {
    const properties = await db.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM leases l WHERE l.property_id = p.id AND l.status = 'active') as active_tenants,
        (SELECT COUNT(*) FROM maintenance_requests mr WHERE mr.property_id = p.id AND mr.status != 'resolved') as open_requests
       FROM properties p WHERE p.owner_id = $1 ORDER BY p.created_at DESC`,
      [landlord_id]
    );

    const payments = await db.query(
      `SELECT SUM(pm.amount) as total_collected, COUNT(*) as payment_count
       FROM payments pm
       JOIN leases l ON pm.lease_id = l.id
       JOIN properties p ON l.property_id = p.id
       WHERE p.owner_id = $1 AND pm.status = 'paid'
       AND EXTRACT(MONTH FROM pm.paid_at) = EXTRACT(MONTH FROM NOW())`,
      [landlord_id]
    );

    const maintenance = await db.query(
      `SELECT mr.* , u.full_name as tenant_name, p.title as property_title
       FROM maintenance_requests mr
       JOIN properties p ON mr.property_id = p.id
       JOIN users u ON mr.tenant_id = u.id
       WHERE p.owner_id = $1 AND mr.status != 'resolved'
       ORDER BY mr.urgency DESC, mr.created_at ASC`,
      [landlord_id]
    );

    const arrears = await db.query(
      `SELECT u.full_name, u.phone, p.title as property_title, l.monthly_rent,
              pm.due_date, pm.period_month, pm.period_year
       FROM leases l
       JOIN users u ON l.tenant_id = u.id
       JOIN properties p ON l.property_id = p.id
       LEFT JOIN payments pm ON pm.lease_id = l.id AND pm.status = 'pending'
       WHERE p.owner_id = $1 AND pm.id IS NOT NULL`,
      [landlord_id]
    );

    res.json({
      properties: properties.rows,
      stats: {
        total_properties: properties.rows.length,
        total_collected_this_month: payments.rows[0]?.total_collected || 0,
        open_maintenance: maintenance.rows.length,
        tenants_in_arrears: arrears.rows.length,
      },
      maintenance: maintenance.rows,
      arrears: arrears.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard', details: err.message });
  }
};

// ── GET ALL TENANTS FOR LANDLORD ──
const getTenants = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.rental_score,
              l.id as lease_id, l.monthly_rent, l.start_date, l.end_date, l.status as lease_status,
              p.title as property_title, p.town,
              (SELECT COUNT(*) FROM payments pm WHERE pm.lease_id = l.id AND pm.status = 'paid') as payments_made,
              (SELECT COUNT(*) FROM payments pm WHERE pm.lease_id = l.id AND pm.status = 'pending') as payments_pending
       FROM leases l
       JOIN users u ON l.tenant_id = u.id
       JOIN properties p ON l.property_id = p.id
       WHERE p.owner_id = $1
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json({ tenants: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenants', details: err.message });
  }
};

// ── CREATE LEASE FOR TENANT ──
const createLease = async (req, res) => {
  const { property_id, tenant_id, start_date, end_date, monthly_rent, deposit_amount } = req.body;
  try {
    const agreementNo = `NK-${Date.now()}`;
    const result = await db.query(
      `INSERT INTO leases (property_id, tenant_id, landlord_id, start_date, end_date,
        monthly_rent, deposit_amount, agreement_number, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending_signature')
       RETURNING *`,
      [property_id, tenant_id, req.user.id, start_date, end_date, monthly_rent, deposit_amount, agreementNo]
    );
    res.status(201).json({ message: 'Lease created! Tenant has been notified to sign.', lease: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create lease', details: err.message });
  }
};

// ── RESPOND TO MAINTENANCE REQUEST ──
const respondToMaintenance = async (req, res) => {
  const { status, landlord_response, scheduled_date } = req.body;
  try {
    const result = await db.query(
      `UPDATE maintenance_requests
       SET status=$1, landlord_response=$2, scheduled_date=$3,
           resolved_at = CASE WHEN $1='resolved' THEN NOW() ELSE NULL END,
           updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [status, landlord_response, scheduled_date, req.params.id]
    );
    res.json({ message: 'Response sent to tenant.', request: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request', details: err.message });
  }
};

// ── GET VIEWING REQUESTS FOR LANDLORD'S PROPERTIES ──
const getViewingRequests = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT v.*, u.full_name as tenant_name, u.phone as tenant_phone, u.rental_score,
              p.title as property_title, p.town
       FROM property_views v
       JOIN properties p ON v.property_id = p.id
       JOIN users u ON v.tenant_id = u.id
       WHERE p.owner_id = $1
       ORDER BY v.created_at DESC`,
      [req.user.id]
    );
    res.json({ viewings: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch viewing requests', details: err.message });
  }
};

// ── CONFIRM OR REJECT A VIEWING REQUEST ──
const respondToViewing = async (req, res) => {
  const { status } = req.body;
  try {
    const result = await db.query(
      `UPDATE property_views SET status = $1
       WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viewing request not found.' });
    }
    await logActivity(req.user.id, 'viewing_' + status, 'Viewing ID: ' + req.params.id, req.ip);
    res.json({ message: 'Viewing request updated.', viewing: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update viewing', details: err.message });
  }
};

// ── GET ALL LEASES FOR LANDLORD'S PROPERTIES ──
const getLandlordLeases = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, u.full_name as tenant_name, u.phone as tenant_phone,
              p.title as property_title, p.town
       FROM leases l
       JOIN properties p ON l.property_id = p.id
       JOIN users u ON l.tenant_id = u.id
       WHERE p.owner_id = $1
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json({ leases: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leases', details: err.message });
  }
};

// ── LANDLORD SIGNS A LEASE ──
const signLeaseAsLandlord = async (req, res) => {
  try {
    const check = await db.query('SELECT tenant_signed_at FROM leases WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Lease not found.' });
    }
    const newStatus = check.rows[0].tenant_signed_at ? 'active' : 'pending_tenant';
    const result = await db.query(
      `UPDATE leases SET landlord_signed_at = NOW(), status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [newStatus, req.params.id]
    );
    await logActivity(req.user.id, 'lease_signed_landlord', 'Lease ID: ' + req.params.id, req.ip);
    res.json({ message: 'Lease signed! ' + (newStatus === 'active' ? 'Lease is now active.' : 'Waiting for tenant signature.'), lease: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sign lease', details: err.message });
  }
};

module.exports = {
  getDashboard, getTenants, createLease, respondToMaintenance,
  getViewingRequests, respondToViewing, getLandlordLeases, signLeaseAsLandlord
};
