require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const seed = async () => {
  try {
    console.log('🌱 Seeding database...');

    // ── USERS ──────────────────────────────────────────────────────
    const password = await bcrypt.hash('password123', 12);

    await db.query(`
      INSERT INTO users (full_name, email, phone, password_hash, role, segment, rental_score, is_verified)
      VALUES
        ('Peter Kamau',    'peter@nestkenya.com',  '0712000001', $1, 'landlord', NULL,      NULL, true),
        ('Grace Muthoni',  'grace@nestkenya.com',  '0712000002', $1, 'landlord', NULL,      NULL, true),
        ('James Kariuki',  'james@nestkenya.com',  '0712000003', $1, 'tenant',   'student', 742,  true),
        ('Sarah Wanjiku',  'sarah@nestkenya.com',  '0712000004', $1, 'tenant',   'expat',   810,  true),
        ('David Ochieng',  'david@nestkenya.com',  '0712000005', $1, 'tenant',   'student', 620,  false),
        ('Amina Hassan',   'amina@nestkenya.com',  '0712000006', $1, 'tenant',   'family',  780,  true),
        ('BuildRight Ltd', 'builds@nestkenya.com', '0712000007', $1, 'developer',NULL,      NULL, true)
      ON CONFLICT (email) DO NOTHING
    `, [password]);

    console.log('✅ Users seeded');

    // Get user IDs
    const users = await db.query(`SELECT id, email, role FROM users ORDER BY id`);
    const landlord1 = users.rows.find(u => u.email === 'peter@nestkenya.com')?.id;
    const landlord2 = users.rows.find(u => u.email === 'grace@nestkenya.com')?.id;
    const developer = users.rows.find(u => u.email === 'builds@nestkenya.com')?.id;
    const tenant1   = users.rows.find(u => u.email === 'james@nestkenya.com')?.id;
    const tenant2   = users.rows.find(u => u.email === 'sarah@nestkenya.com')?.id;
    const tenant3   = users.rows.find(u => u.email === 'david@nestkenya.com')?.id;
    const tenant4   = users.rows.find(u => u.email === 'amina@nestkenya.com')?.id;

    // ── PROPERTIES ─────────────────────────────────────────────────
    await db.query(`
      INSERT INTO properties (
        owner_id, title, description, type, bedrooms, bathrooms,
        size_sqm, floor_number, rent_amount, deposit_months,
        status, is_furnished, is_new_build, is_verified,
        town, estate, full_address, latitude, longitude,
        amenities, safety_score, transport_score, shopping_score, flooding_risk
      ) VALUES
      (
        $1, 'Rongai Gardens Apartments', 
        'Modern 1-bedroom apartment in the heart of Rongai. Walking distance to Rongai stage, shopping centres and schools. Secure compound with 24hr guard, CCTV and ample parking.',
        'apartment', 1, 1, 45.0, 3, 18000, 2,
        'available', false, false, true,
        'Rongai', 'Tumaini Estate', 'Plot 12, Off Magadi Road, Rongai',
        -1.4241, 36.7528,
        ARRAY['Running Water','KPLC Electricity','Fibre Ready','Parking','Security Guard','CCTV','Waste Collection'],
        8.2, 9.0, 7.5, 'Low'
      ),
      (
        $1, 'Rongai Gardens Block B — 2 Bed',
        'Spacious 2-bedroom unit ideal for a small family or professionals sharing. Tiled throughout, modern kitchen fitout, balcony with estate views.',
        'apartment', 2, 1, 65.0, 2, 24000, 2,
        'available', false, false, true,
        'Rongai', 'Tumaini Estate', 'Plot 12B, Off Magadi Road, Rongai',
        -1.4238, 36.7531,
        ARRAY['Running Water','KPLC Electricity','Parking','Security Guard','Balcony','Tiled Floors'],
        8.2, 9.0, 7.5, 'Low'
      ),
      (
        $1, 'Rongai Executive Studio',
        'Self-contained bedsitter perfect for a working professional. Fully tiled, own bathroom, kitchenette with fitted cabinets. Quiet compound.',
        'studio', 0, 1, 28.0, 1, 12000, 2,
        'occupied', false, false, true,
        'Rongai', 'Gataka', 'Off Gataka Road, Rongai',
        -1.4280, 36.7510,
        ARRAY['Running Water','KPLC Electricity','Security Guard','Fibre Ready'],
        7.8, 8.5, 7.0, 'Low'
      ),
      (
        $2, 'Kitengela Heights — 2 Bed',
        'Brand new 2-bedroom apartment in fast-growing Kitengela. Modern finishes, spacious rooms, rooftop terrace. Excellent road access to Nairobi via Namanga Road.',
        'apartment', 2, 2, 70.0, 4, 25000, 2,
        'available', false, true, true,
        'Kitengela', 'Milimani Estate', 'Namanga Road, Kitengela, Kajiado',
        -1.4748, 36.9605,
        ARRAY['Running Water','KPLC Electricity','Fibre Ready','Rooftop Terrace','Backup Generator','Parking','Security Guard','CCTV'],
        7.5, 8.0, 8.5, 'Low'
      ),
      (
        $2, 'Kitengela Heights — 3 Bed',
        'Flagship 3-bedroom penthouse unit. Fully fitted kitchen, 2 bathrooms, servant quarters. Ideal for families or executives. Pre-register now for October 2026 opening.',
        'apartment', 3, 2, 110.0, 5, 38000, 2,
        'available', false, true, true,
        'Kitengela', 'Milimani Estate', 'Namanga Road, Kitengela, Kajiado',
        -1.4750, 36.9608,
        ARRAY['Running Water','KPLC Electricity','Fibre Ready','Servant Quarters','Parking x2','Security Guard','Intercom','Rooftop Terrace'],
        7.5, 8.0, 8.5, 'Low'
      ),
      (
        $3, 'Thika Road Suites — Furnished',
        'Fully furnished 2-bedroom apartment on Thika Road corridor. Includes bed, sofa, dining set, TV. Perfect for expats and relocating professionals. Short and long-term leases available.',
        'apartment', 2, 1, 60.0, 2, 35000, 2,
        'available', true, false, true,
        'Ruiru', 'Tatu City Area', 'Thika Superhighway, Ruiru, Kiambu',
        -1.1453, 36.9800,
        ARRAY['Running Water','KPLC Electricity','Fibre (Safaricom)','Fully Furnished','Smart TV','Parking','Security Guard','Backup Generator'],
        8.8, 9.5, 8.0, 'Low'
      ),
      (
        $3, 'Juja Green Apartments — Bedsitter',
        'Affordable self-contained bedsitter near Juja town and JKUAT. Perfect for university students and young professionals. Includes water and garbage in rent.',
        'apartment', 0, 1, 25.0, 1, 9500, 1,
        'available', false, false, true,
        'Juja', 'Juja Farm', 'Off Thika Road, Juja, Kiambu',
        -1.1028, 37.0144,
        ARRAY['Running Water (included)','KPLC Electricity','Waste Collection (included)','Security Guard','Near JKUAT'],
        7.0, 8.0, 6.5, 'Low'
      ),
      (
        $3, 'Juja Green Apartments — 1 Bed',
        'Well-maintained 1-bedroom apartment in Juja Farm area. Spacious lounge, fitted kitchen. 10 mins from JKUAT, 5 mins from Juja stage.',
        'apartment', 1, 1, 42.0, 2, 14000, 2,
        'available', false, false, true,
        'Juja', 'Juja Farm', 'Off Thika Road, Juja, Kiambu',
        -1.1032, 37.0148,
        ARRAY['Running Water','KPLC Electricity','Security Guard','Parking','Near JKUAT'],
        7.0, 8.0, 6.5, 'Low'
      ),
      (
        $2, 'Syokimau Luxury Apartments',
        'Premium 2-bedroom apartment near SGR Syokimau station. Easy commute to CBD via train. Modern interior, fitted kitchen, master ensuite.',
        'apartment', 2, 2, 80.0, 3, 32000, 2,
        'available', false, false, true,
        'Syokimau', 'Airport North Road', 'Airport North Road, Syokimau, Machakos',
        -1.3626, 36.9059,
        ARRAY['Running Water','KPLC Electricity','Fibre Ready','SGR Access','Backup Generator','Parking','Security Guard','Intercom','Master Ensuite'],
        9.0, 9.5, 7.5, 'Low'
      ),
      (
        $3, 'Ruiru Budget Bedsitter',
        'Clean and affordable self-contained bedsitter in Ruiru town centre. Minutes from matatu stage, shops and schools. Water and electricity metered separately.',
        'studio', 0, 1, 20.0, 1, 8000, 1,
        'occupied', false, false, false,
        'Ruiru', 'Ruiru Town', 'Kimbo Road, Ruiru, Kiambu',
        -1.1595, 36.9612,
        ARRAY['Running Water','KPLC Electricity','Security Guard'],
        6.5, 8.5, 7.5, 'Medium'
      )
      ON CONFLICT DO NOTHING
    `, [landlord1, landlord2, developer]);

    console.log('✅ Properties seeded');

    // Get property IDs
    const props = await db.query(`SELECT id, title FROM properties ORDER BY id`);
    const prop1 = props.rows[0]?.id; // Rongai Gardens 1 Bed
    const prop3 = props.rows[2]?.id; // Rongai Studio (occupied)
    const prop6 = props.rows[5]?.id; // Thika Road Suites Furnished
    const prop10 = props.rows[9]?.id; // Ruiru Budget (occupied)

    // ── LEASES ─────────────────────────────────────────────────────
    await db.query(`
      INSERT INTO leases (
        property_id, tenant_id, landlord_id,
        start_date, end_date, monthly_rent, deposit_amount,
        status, agreement_number,
        tenant_signed_at, landlord_signed_at
      ) VALUES
      (
        $1, $2, $3,
        '2026-01-01', '2027-01-01', 18000, 36000,
        'active', 'NK-2026-000001',
        '2025-12-20 10:00:00', '2025-12-21 09:00:00'
      ),
      (
        $4, $5, $6,
        '2026-02-01', '2027-02-01', 35000, 70000,
        'active', 'NK-2026-000002',
        '2026-01-25 14:00:00', '2026-01-26 10:00:00'
      ),
      (
        $7, $8, $9,
        '2026-03-01', '2027-03-01', 12000, 12000,
        'active', 'NK-2026-000003',
        '2026-02-25 11:00:00', '2026-02-26 09:00:00'
      )
      ON CONFLICT DO NOTHING
    `, [prop1, tenant1, landlord1, prop6, tenant2, landlord1, prop10, tenant3, landlord2]);

    console.log('✅ Leases seeded');

    // Get lease IDs
    const leases = await db.query(`SELECT id, tenant_id FROM leases ORDER BY id`);
    const lease1 = leases.rows[0]?.id;
    const lease2 = leases.rows[1]?.id;
    const lease3 = leases.rows[2]?.id;

    // ── PAYMENTS ───────────────────────────────────────────────────
    const paymentRows = [];
    // James — 7 months paid on time (Jan–Jul 2026)
    for (let m = 1; m <= 7; m++) {
      paymentRows.push(`(${lease1}, ${tenant1}, 18000, 'rent', 'mpesa', 'paid', 'NK-MPESA-00${String(m).padStart(2,'0')}', '2026-0${m}-01 09:30:00', ${m}, 2026)`);
    }
    // Sarah — 5 months paid (Feb–Jun 2026)
    for (let m = 2; m <= 6; m++) {
      paymentRows.push(`(${lease2}, ${tenant2}, 35000, 'rent', 'mpesa', 'paid', 'NK-MPESA-0${m}00', '2026-0${m}-01 10:00:00', ${m}, 2026)`);
    }
    // David — 3 months paid, 1 pending
    for (let m = 3; m <= 5; m++) {
      paymentRows.push(`(${lease3}, ${tenant3}, 12000, 'rent', 'mpesa', 'paid', 'NK-MPESA-0${m}11', '2026-0${m}-01 11:00:00', ${m}, 2026)`);
    }
    paymentRows.push(`(${lease3}, ${tenant3}, 12000, 'rent', 'mpesa', 'pending', NULL, NULL, 6, 2026)`);

    await db.query(`
      INSERT INTO payments (lease_id, tenant_id, amount, payment_type, payment_method, status, mpesa_receipt_number, paid_at, period_month, period_year)
      VALUES ${paymentRows.join(',\n')}
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Payments seeded');

    // ── MAINTENANCE REQUESTS ────────────────────────────────────────
    await db.query(`
      INSERT INTO maintenance_requests (
        lease_id, tenant_id, property_id, category, urgency, title, description, status
      ) VALUES
      (
        ${lease1}, ${tenant1}, ${prop1},
        'Plumbing', 'urgent',
        'Leaking Pipe — Bathroom',
        'Water dripping from under the sink. Getting worse. Photos attached.',
        'in_progress'
      ),
      (
        ${lease1}, ${tenant1}, ${prop1},
        'Electrical', 'standard',
        'Bulb Replacement — Kitchen',
        'The ceiling light in the kitchen has stopped working. I have tried replacing the bulb but the socket seems faulty.',
        'scheduled'
      ),
      (
        ${lease2}, ${tenant2}, ${prop6},
        'Structural / Walls', 'standard',
        'Damp Patch on Bedroom Wall',
        'There is a damp patch forming on the northern bedroom wall. Appears to be coming from outside. About 30cm wide.',
        'open'
      ),
      (
        ${lease1}, ${tenant1}, ${prop1},
        'Doors / Windows', 'low',
        'Door Lock Stiff',
        'The front door lock has become stiff and hard to turn. Needs lubrication or replacement.',
        'resolved'
      )
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Maintenance requests seeded');

    // ── SAVED PROPERTIES ───────────────────────────────────────────
    const propIds = props.rows.map(p => p.id);
    await db.query(`
      INSERT INTO saved_properties (tenant_id, property_id) VALUES
      ($1, $2), ($1, $3), ($4, $5)
      ON CONFLICT DO NOTHING
    `, [tenant1, propIds[3], propIds[5], tenant4, propIds[8]]);

    console.log('✅ Saved properties seeded');

    // ── MOVING BOOKINGS ────────────────────────────────────────────
    await db.query(`
      INSERT INTO moving_bookings (tenant_id, lease_id, service_type, provider_name, scheduled_date, status, cost)
      VALUES
      ($1, $2, 'moving_company', 'SafeMove Kenya', '2026-01-31', 'completed', 4500),
      ($1, $2, 'cleaning',       'CleanNest',       '2026-01-31', 'completed', 2000),
      ($3, $4, 'moving_company', 'QuickShift',      '2026-02-28', 'completed', 3200),
      ($3, $4, 'internet',       'Safaricom Fibre',  '2026-03-05', 'completed', 2999)
      ON CONFLICT DO NOTHING
    `, [tenant1, lease1, tenant2, lease2]);

    console.log('✅ Moving bookings seeded');

    // ── PROPERTY VIEWS (viewings booked) ───────────────────────────
    await db.query(`
      INSERT INTO property_views (property_id, tenant_id, scheduled_at, status)
      VALUES
      ($1, $2, '2026-07-10 10:00:00', 'confirmed'),
      ($3, $4, '2026-07-12 14:00:00', 'requested'),
      ($5, $6, '2026-07-15 11:00:00', 'requested')
      ON CONFLICT DO NOTHING
    `, [propIds[3], tenant4, propIds[8], tenant3, propIds[4], tenant3]);

    console.log('✅ Property views seeded');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('──────────────────────────────────────────');
    console.log('TEST ACCOUNTS (password: password123)');
    console.log('──────────────────────────────────────────');
    console.log('LANDLORD:  peter@nestkenya.com');
    console.log('LANDLORD:  grace@nestkenya.com');
    console.log('TENANT:    james@nestkenya.com  (score: 742)');
    console.log('TENANT:    sarah@nestkenya.com  (score: 810, expat)');
    console.log('TENANT:    david@nestkenya.com  (score: 620, arrears)');
    console.log('DEVELOPER: builds@nestkenya.com');
    console.log('──────────────────────────────────────────');
    console.log('PROPERTIES SEEDED: 10');
    console.log('  Rongai (3) · Kitengela (2) · Ruiru/Thika (2)');
    console.log('  Juja (2) · Syokimau (1)');
    console.log('LEASES: 3 active');
    console.log('PAYMENTS: 16 records');
    console.log('MAINTENANCE: 4 requests');
    console.log('──────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();
