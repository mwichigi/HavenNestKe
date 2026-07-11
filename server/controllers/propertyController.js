const db = require('../config/db');
const { logActivity } = require('../config/logger');

// ── GET ALL PROPERTIES (with filters) ──
const getProperties = async (req, res) => {
  const {
    town, type, min_rent, max_rent,
    bedrooms, is_furnished, is_new_build,
    status = 'available', limit = 20, offset = 0
  } = req.query;

  let conditions = ['p.status = $1'];
  let params = [status];
  let idx = 2;

  if (town) { conditions.push(`p.town ILIKE $${idx++}`); params.push(`%${town}%`); }
  if (type) { conditions.push(`p.type = $${idx++}`); params.push(type); }
  if (min_rent) { conditions.push(`p.rent_amount >= $${idx++}`); params.push(min_rent); }
  if (max_rent) { conditions.push(`p.rent_amount <= $${idx++}`); params.push(max_rent); }
  if (bedrooms) { conditions.push(`p.bedrooms = $${idx++}`); params.push(bedrooms); }
  if (is_furnished !== undefined) { conditions.push(`p.is_furnished = $${idx++}`); params.push(is_furnished); }
  if (is_new_build !== undefined) { conditions.push(`p.is_new_build = $${idx++}`); params.push(is_new_build); }

  const whereClause = conditions.join(' AND ');

  try {
    const result = await db.query(
      `SELECT p.*, u.full_name as owner_name, u.phone as owner_phone,
              u.is_verified as owner_verified
       FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    res.json({ properties: result.rows, count: result.rows.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties', details: err.message });
  }
};

// ── GET SINGLE PROPERTY ──
const getProperty = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.full_name as owner_name, u.phone as owner_phone,
              u.is_verified as owner_verified, u.profile_photo_url as owner_photo
       FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property', details: err.message });
  }
};

// ── CREATE PROPERTY ──
const createProperty = async (req, res) => {
  const {
    title, description, type, bedrooms, bathrooms,
    size_sqm, floor_number, rent_amount, deposit_months,
    is_furnished, is_new_build, town, estate, full_address,
    latitude, longitude, amenities
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO properties
        (owner_id, title, description, type, bedrooms, bathrooms,
         size_sqm, floor_number, rent_amount, deposit_months,
         is_furnished, is_new_build, town, estate, full_address,
         latitude, longitude, amenities)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [req.user.id, title, description, type, bedrooms, bathrooms,
       size_sqm, floor_number, rent_amount, deposit_months,
       is_furnished, is_new_build, town, estate, full_address,
       latitude, longitude, amenities]
    );
    res.status(201).json({ message: 'Property listed!', property: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create property', details: err.message });
  }
};

// ── SAVE / UNSAVE PROPERTY ──
const toggleSaveProperty = async (req, res) => {
  const { id: property_id } = req.params;
  const tenant_id = req.user.id;

  try {
    const existing = await db.query(
      'SELECT id FROM saved_properties WHERE tenant_id=$1 AND property_id=$2',
      [tenant_id, property_id]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'DELETE FROM saved_properties WHERE tenant_id=$1 AND property_id=$2',
        [tenant_id, property_id]
      );
      return res.json({ saved: false, message: 'Property removed from saved.' });
    } else {
      await db.query(
        'INSERT INTO saved_properties (tenant_id, property_id) VALUES ($1, $2)',
        [tenant_id, property_id]
      );
      return res.json({ saved: true, message: 'Property saved!' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle save', details: err.message });
  }
};

// ── BOOK VIEWING ──
const bookViewing = async (req, res) => {
  const { scheduled_at } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO property_views (property_id, tenant_id, scheduled_at)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, req.user.id, scheduled_at]
    );
    await logActivity(req.user.id, 'viewing_booked', `Property ID: ${req.params.id}`, req.ip);
    res.status(201).json({ message: 'Viewing booked! Landlord will confirm.', view: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to book viewing', details: err.message });
  }
};

module.exports = { getProperties, getProperty, createProperty, toggleSaveProperty, bookViewing };
