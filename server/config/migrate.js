require('dotenv').config();
const db = require('./db');

const migrate = async () => {
  try {
    console.log('🔄 Running migrations...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'tenant',
        segment VARCHAR(30),
        rental_score INTEGER DEFAULT 600,
        is_verified BOOLEAN DEFAULT false,
        id_number VARCHAR(20),
        profile_photo_url TEXT,
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER REFERENCES users(id),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        type VARCHAR(30),
        bedrooms INTEGER DEFAULT 0,
        bathrooms INTEGER DEFAULT 1,
        size_sqm NUMERIC(6,1),
        floor_number INTEGER,
        rent_amount NUMERIC(10,2) NOT NULL,
        deposit_months INTEGER DEFAULT 2,
        status VARCHAR(20) DEFAULT 'available',
        is_furnished BOOLEAN DEFAULT false,
        is_new_build BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT false,
        town VARCHAR(100),
        estate VARCHAR(100),
        full_address TEXT,
        latitude NUMERIC(10,7),
        longitude NUMERIC(10,7),
        amenities TEXT[],
        photos TEXT[],
        safety_score NUMERIC(3,1),
        transport_score NUMERIC(3,1),
        shopping_score NUMERIC(3,1),
        flooding_risk VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS leases (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id),
        tenant_id INTEGER REFERENCES users(id),
        landlord_id INTEGER REFERENCES users(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        monthly_rent NUMERIC(10,2) NOT NULL,
        deposit_amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(30) DEFAULT 'pending_signature',
        tenant_signed_at TIMESTAMP,
        landlord_signed_at TIMESTAMP,
        agreement_number VARCHAR(50) UNIQUE,
        move_in_photos TEXT[],
        move_out_photos TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        lease_id INTEGER REFERENCES leases(id),
        tenant_id INTEGER REFERENCES users(id),
        amount NUMERIC(10,2) NOT NULL,
        payment_type VARCHAR(30) DEFAULT 'rent',
        payment_method VARCHAR(20) DEFAULT 'mpesa',
        status VARCHAR(20) DEFAULT 'pending',
        mpesa_receipt_number VARCHAR(50),
        mpesa_transaction_id VARCHAR(100),
        due_date DATE,
        paid_at TIMESTAMP,
        period_month INTEGER,
        period_year INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id SERIAL PRIMARY KEY,
        lease_id INTEGER REFERENCES leases(id),
        tenant_id INTEGER REFERENCES users(id),
        property_id INTEGER REFERENCES properties(id),
        category VARCHAR(50) NOT NULL,
        urgency VARCHAR(20) DEFAULT 'standard',
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(30) DEFAULT 'open',
        photos TEXT[],
        landlord_response TEXT,
        scheduled_date DATE,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS moving_bookings (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES users(id),
        lease_id INTEGER REFERENCES leases(id),
        service_type VARCHAR(50) NOT NULL,
        provider_name VARCHAR(100),
        scheduled_date DATE,
        status VARCHAR(20) DEFAULT 'pending',
        cost NUMERIC(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS property_views (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id),
        tenant_id INTEGER REFERENCES users(id),
        scheduled_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'requested',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS saved_properties (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES users(id),
        property_id INTEGER REFERENCES properties(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, property_id)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id SERIAL PRIMARY KEY,
        method VARCHAR(10),
        path VARCHAR(255),
        status_code INTEGER,
        message TEXT,
        stack TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ All tables created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

migrate();
