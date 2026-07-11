const express = require('express');
const r = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const db = require('../config/db');
const PROTECTED_ADMIN_EMAILS = ['ngangamj828@gmail.com', 'jameskarira820@gmail.com'];

// All admin routes require login + admin role
r.use(authMiddleware, requireRole('admin'));

// ── Site-wide stats ──
r.get('/stats', async (req, res) => {
  try {
    const [users, properties, leases, payments, maintenance] = await Promise.all([
      db.query('SELECT role, COUNT(*) FROM users GROUP BY role'),
      db.query('SELECT status, COUNT(*) FROM properties GROUP BY status'),
      db.query("SELECT COUNT(*) FROM leases WHERE status = 'active'"),
      db.query("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status = 'paid'"),
      db.query("SELECT COUNT(*) FROM maintenance_requests WHERE status != 'resolved'"),
    ]);
    res.json({
      usersByRole: users.rows,
      propertiesByStatus: properties.rows,
      activeLeases: leases.rows[0].count,
      totalRevenue: payments.rows[0].total,
      openMaintenance: maintenance.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
});

// ── Users management ──
r.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, phone, role, segment, rental_score, is_verified, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

r.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  try {
    await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role', details: err.message });
  }
});

r.delete('/users/:id', async (req, res) => {
  try {
    const check = await db.query('SELECT email FROM users WHERE id = $1', [req.params.id]);
    if (check.rows.length > 0 && PROTECTED_ADMIN_EMAILS.includes(check.rows[0].email)) {
      return res.status(403).json({ error: 'This admin account is protected and cannot be deleted.' });
    }
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

// ── Properties management ──
r.get('/properties', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.full_name as owner_name FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id ORDER BY p.created_at DESC`
    );
    res.json({ properties: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties', details: err.message });
  }
});

r.delete('/properties/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM properties WHERE id = $1', [req.params.id]);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete property', details: err.message });
  }
});

// ── Payments overview ──
r.get('/payments', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.full_name as tenant_name, pr.title as property_title
       FROM payments p
       JOIN users u ON p.tenant_id = u.id
       JOIN leases l ON p.lease_id = l.id
       JOIN properties pr ON l.property_id = pr.id
       ORDER BY p.created_at DESC LIMIT 100`
    );
    res.json({ payments: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
});

// ── Activity logs ──
r.get('/logs/activity', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT al.*, u.full_name, u.email FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC LIMIT 200`
    );
    res.json({ logs: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity logs', details: err.message });
  }
});

// ── Error logs ──
r.get('/logs/errors', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 200`
    );
    res.json({ logs: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch error logs', details: err.message });
  }
});

module.exports = r;
