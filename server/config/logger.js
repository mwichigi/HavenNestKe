const db = require('./db');

// Record a user action (login, register, payment, etc.)
const logActivity = async (userId, action, details = null, ipAddress = null) => {
  try {
    await db.query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)`,
      [userId, action, details, ipAddress]
    );
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// Record a server-side error
const logError = async (req, err, statusCode = 500) => {
  try {
    await db.query(
      `INSERT INTO error_logs (method, path, status_code, message, stack, user_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.method, req.originalUrl, statusCode, err.message, err.stack, req.user ? req.user.id : null]
    );
  } catch (logErr) {
    console.error('Failed to log error:', logErr.message);
  }
};

module.exports = { logActivity, logError };
