🌊 JalDrishti - Rural Water Quality Monitoring System
JalDrishti is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application designed for real-time water quality tracking and issue reporting in rural Indian villages.

📌 Problem Statement
Many rural Indian villages face recurring water contamination issues (high pH, fluoride, arsenic, nitrate, turbidity, e-coli), but there is no accessible system for local residents, village representatives, or health authorities to track water quality and report problems in real time. Existing solutions are paper-based or costly, lacking transparency and timely alerts.

🌟 Key Features
Role-Based Authentication:

Village Representative / Asha Worker: Log daily/weekly water quality tests, report contamination issues.
Community Health Worker / Block Officer: Review logs, assign issue resolution teams, view analytical trends.
Administrator: Manage village master data, water sources, and user roles.
Water Quality Testing Log (CRUD):

Log Parameters: pH level, Turbidity (NTU), Dissolved Oxygen, Nitrates, Fluoride, Total Dissolved Solids (TDS), E. Coli presence.
Automatic Water Quality Index (WQI) computation (Safe, Moderate, Unsafe, Critical).
Real-time Alerting & Issue Reporting:

Report pipeline damage, odor, discoloration, or health outbreaks.
Severity tagging (Low, Medium, High, Emergency) with real-time status updates (Open, In Progress, Resolved).
Visual Analytics & Dashboard:

Interactive trend lines and bar graphs using Chart.js.
Village-wise & Source-wise contamination tracking.
Historical comparison over days, weeks, and months.
📁 Repository & Folder Structure
.
├── client/                      # React Frontend (Vite + Chart.js)
│   ├── public/                  # Static assets & favicon
│   ├── src/
│   │   ├── assets/              # Logos, icons, background graphics
│   │   ├── components/          # Reusable UI Components
│   │   │   ├── auth/            # Login & Signup forms
│   │   │   ├── common/          # Navbar, Sidebar, Footer, Badges
│   │   │   ├── dashboard/       # Stat cards, Chart wrappers, Maps
│   │   │   ├── issues/          # Issue list, report modals
│   │   │   └── logs/            # Water log tables, entry forms
│   │   ├── context/             # React Context API (AuthContext, DataContext)
│   │   ├── hooks/               # Custom React Hooks
│   │   ├── pages/               # Page Views (Dashboard, Analytics, Issues)
│   │   ├── services/            # Axios API instances & service functions
│   │   ├── utils/               # Chart configs, formatters, constants
│   │   ├── App.jsx              # Main router & app entry component
│   │   ├── index.css            # Custom CSS Design System & Theme variables
│   │   └── main.jsx             # React DOM root render
│   ├── .env.example             # Frontend environment variables blueprint
│   ├── index.html               # Main HTML template
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite bundler configuration
│
└── server/                      # Node.js + Express Backend REST API
    ├── src/
    │   ├── config/              # MongoDB connection & env setup
    │   ├── controllers/         # Request handlers (Auth, Logs, Issues, Analytics)
    │   ├── middleware/          # JWT Auth, RBAC, Error Handler, Validator
    │   ├── models/              # Mongoose Schemas (User, WaterLog, WaterSource, Issue)
    │   ├── routes/              # Express API Routes
    │   ├── utils/               # WQI calculator, seed scripts, helper functions
    │   ├── app.js               # Express application initialization
    │   └── server.js            # Node HTTP server launcher
    ├── .env.example             # Backend environment variables blueprint
    └── package.json             # Backend dependencies
🚀 Quick Start Guide
Prerequisites
Node.js (v18.x or above)
MongoDB (Local instance or MongoDB Atlas connection string)
npm or yarn
1. Server Setup
cd server
npm install
cp .env.example .env
# Fill in your MONGODB_URI and JWT_SECRET in .env
npm run seed  # Optional: Seed dummy village water data
npm run dev   # Starts backend on http://localhost:5000
2. Client Setup
cd client
npm install
cp .env.example .env
npm run dev   # Starts frontend on http://localhost:5173
🧪 API Endpoints Overview
Method	Endpoint	Description	Auth Required
POST	/api/v1/auth/register	Register new representative/worker	No
POST	/api/v1/auth/login	User login & JWT issuance	No
GET	/api/v1/logs	Fetch water quality logs (filtered by village/source)	Yes
POST	/api/v1/logs	Submit a new water quality test result	Yes
GET	/api/v1/issues	View contamination & pipeline issue reports	Yes
POST	/api/v1/issues	Report a new water issue	Yes
PATCH	/api/v1/issues/:id	Update issue status (In Progress / Resolved)	Yes (Admin/Health Worker)
GET	/api/v1/analytics/trends	Fetch Chart.js aggregated trend data	Yes
🛡️ Water Quality Index (WQI) Standards (BIS / WHO)
pH: Ideal range 6.5 - 8.5
TDS (Total Dissolved Solids): < 500 mg/L (Desirable), < 2000 mg/L (Maximum Permissible)
Fluoride: < 1.0 - 1.5 mg/L
Nitrate: < 45 mg/L
Turbidity: < 1 - 5 NTU
📜 License
MIT License - Built for Rural Community Health & Empowerment.
