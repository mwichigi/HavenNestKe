# NestKenya 🏠
Full tenant lifecycle real estate platform for Kenya.

## Stack
- **Frontend:** React + React Router + Tailwind CSS + Google Maps
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Payments:** M-Pesa Daraja STK Push
- **Deploy:** Vercel (frontend) + Render (backend) + Supabase (database)

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL installed locally
- A Google Maps API key (console.cloud.google.com)
- M-Pesa Daraja sandbox account (developer.safaricom.co.ke)

### 1. Clone and open
```bash
# Unzip the project, then open in VS Code
code nestkenya/
```

### 2. Backend setup
```bash
cd server
cp .env.example .env        # copy example env file
# Open .env and fill in: DB_PASSWORD, JWT_SECRET, MPESA keys, GOOGLE_MAPS_API_KEY
npm install
npm run db:migrate           # creates all 8 database tables
npm run db:seed              # loads 10 properties + test users + sample data
npm run dev                  # starts API on http://localhost:5000
```

### 3. Frontend setup
```bash
cd client
# Open .env and add your Google Maps API key
npm install
npm start                    # opens app on http://localhost:3000
```

### 4. Test accounts (after seeding)
| Role      | Email                    | Password     |
|-----------|--------------------------|--------------|
| Landlord  | peter@nestkenya.com      | password123  |
| Landlord  | grace@nestkenya.com      | password123  |
| Tenant    | james@nestkenya.com      | password123  |
| Tenant    | sarah@nestkenya.com      | password123  |
| Tenant    | david@nestkenya.com      | password123  |
| Developer | builds@nestkenya.com     | password123  |

---

## Deployment (Free Tier)

### Step 1 — Database on Supabase (free PostgreSQL)
1. Go to supabase.com → New project
2. Copy the connection string (host, user, password, dbname)
3. Run migrations against Supabase:
```bash
DB_HOST=your.supabase.host DB_USER=postgres DB_PASSWORD=xxx DB_NAME=postgres node server/config/migrate.js
node server/config/seed.js   # optional: seed demo data
```

### Step 2 — Backend on Render (free Node.js hosting)
1. Push your code to GitHub
2. Go to render.com → New Web Service → connect your repo
3. Set these in the Render dashboard Environment section:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` from Supabase
   - `JWT_SECRET` (any long random string)
   - `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PAYBILL`, `MPESA_PASSKEY`
   - `MPESA_CALLBACK_URL` = `https://your-render-url.onrender.com/api/payments/mpesa/callback`
   - `CLIENT_URL` = your Vercel URL (add after step 3)
4. Build command: `cd server && npm install`
5. Start command: `cd server && npm start`
6. Note your Render URL: `https://nestkenya-api.onrender.com`

### Step 3 — Frontend on Vercel (free React hosting)
1. Go to vercel.com → New Project → import your GitHub repo
2. Set environment variables:
   - `REACT_APP_API_URL` = `https://nestkenya-api.onrender.com/api`
   - `REACT_APP_GOOGLE_MAPS_KEY` = your Google Maps key
3. Deploy — Vercel auto-detects React
4. Copy your Vercel URL and set it as `CLIENT_URL` in Render

---

## API Endpoints

### Auth
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/auth/register  | Create account       |
| POST   | /api/auth/login     | Login, get JWT token |
| GET    | /api/auth/me        | Get current user     |

### Properties
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/properties             | List (filterable by town, type, rent) |
| GET    | /api/properties/:id         | Single property detail   |
| POST   | /api/properties             | Create listing (landlord)|
| POST   | /api/properties/:id/save    | Save / unsave            |
| POST   | /api/properties/:id/view    | Book a viewing           |

### Payments
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | /api/payments/mpesa/pay     | Trigger M-Pesa STK Push  |
| POST   | /api/payments/mpesa/callback| Safaricom callback       |
| GET    | /api/payments/history       | Tenant payment history   |

### Maintenance
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/maintenance      | List tenant requests     |
| POST   | /api/maintenance      | Submit new request       |
| PATCH  | /api/maintenance/:id  | Update status            |

### Landlord Dashboard
| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| GET    | /api/landlord/dashboard        | Full dashboard data      |
| GET    | /api/landlord/tenants          | All tenants              |
| POST   | /api/landlord/leases           | Create lease             |
| PATCH  | /api/landlord/maintenance/:id  | Respond to request       |

---

## Project Structure
```
nestkenya/
├── client/                    # React frontend
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js             # Routes
│   │   ├── index.js           # Entry point
│   │   ├── index.css          # Tailwind base
│   │   ├── context/
│   │   │   └── AuthContext.js # Global user state + JWT
│   │   ├── utils/
│   │   │   └── api.js         # Axios + auto JWT injection
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Layout.js  # Bottom nav wrapper
│   │   └── pages/
│   │       ├── HomePage.js
│   │       ├── MapPage.js
│   │       ├── RentPaymentPage.js
│   │       ├── MaintenancePage.js
│   │       ├── AllPages.js    # Login, Register, Profile, Lease, Moving, Splash
│   │       └── landlord/
│   │           └── LandlordDashboard.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                   # Local env (not committed)
│   └── .env.production        # Production env (not committed)
│
├── server/                    # Node.js + Express backend
│   ├── index.js               # App entry + route mounting
│   ├── config/
│   │   ├── db.js              # PostgreSQL pool (with SSL for prod)
│   │   ├── migrate.js         # Creates all tables
│   │   └── seed.js            # Demo data
│   ├── middleware/
│   │   └── auth.js            # JWT verify + role guard
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── propertyController.js
│   │   ├── paymentController.js
│   │   ├── maintenanceController.js
│   │   └── landlordController.js
│   └── routes/
│       ├── auth.js
│       ├── properties.js
│       ├── payments.js
│       ├── maintenance.js
│       ├── leases.js
│       ├── moving.js
│       ├── users.js
│       └── landlord.js
│
├── render.yaml                # Render deployment config
├── vercel.json                # Vercel deployment config
├── .gitignore
└── README.md
```
