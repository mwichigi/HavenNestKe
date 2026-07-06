const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logActivity } = require('../config/logger');

// ── REGISTER ──
const register = async (req, res) => {
  const { full_name, email, phone, password, role = 'tenant', segment } = req.body;

  try {
    // Check if user already exists
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email or phone already registered.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user
    const result = await db.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, segment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, phone, role, segment, rental_score, created_at`,
      [full_name, email, phone, password_hash, role, segment]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    await logActivity(user.id, 'register', `New ${user.role} account created`, req.ip);
    res.status(201).json({ message: 'Account created successfully!', token, user });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

// ── LOGIN ──
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password_hash, ...safeUser } = user;
    await logActivity(user.id, 'login', null, req.ip);
    res.json({ message: 'Login successful!', token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

// ── GET CURRENT USER ──
const getMe = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, phone, role, segment, id_number,
              rental_score, is_verified, profile_photo_url, language, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user', details: err.message });
  }
};

module.exports = { register, login, getMe };
