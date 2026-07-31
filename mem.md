# 🌊 Memory File: Rural Water Quality Monitoring Dashboard (JalDrishti)

This memory file stores the project details, core features, architecture, file structure, and implementation details for the **Rural Water Quality Monitoring System (JalDrishti)**.

---

## 📌 Project Overview

* **Team**: Certificate in MERN Stack Development with AI-Assisted Coding – Team G – Summer Training Cum Internship Program (STCIP- Cohort -2)
* **Goal**: Build a digital platform to track and report water quality in rural Indian communities, replacing paper-based or costly systems with real-time alerting, transparent log tracking, and data-driven visualization.
* **Deadline**: 4 Aug 2026

---

## 🌟 Features & Functionality

### 1. User Authentication & Authorization (RBAC)
Secure access to the platform based on the following distinct user roles:
* **Village Representative / Asha Worker**: 
  - Log daily/weekly water quality tests.
  - Report contamination or infrastructure issues.
* **Community Health Worker / Block Officer**:
  - Review water quality logs.
  - View analytical trends of different sources and villages.
  - Assign and manage issue resolution teams.
* **Administrator**:
  - Full override access to oversee all villages.
  - Manage village master data, users, and water sources.
  - Review audit logs.

### 2. Water Quality Data Entry (CRUD)
Enable logging and management of water quality test results for specific village water sources:
* **Logs include key water quality parameters**:
  - pH Level (Ideal: `6.5 - 8.5`)
  - Turbidity (Ideal: `< 1 - 5 NTU`)
  - Dissolved Oxygen (mg/L)
  - Nitrates (Ideal: `< 45 mg/L`)
  - Fluoride (Ideal: `< 1.0 - 1.5 mg/L`)
  - Total Dissolved Solids (TDS) (Ideal: `< 500 mg/L`, Max Permissible: `< 2000 mg/L`)
  - E. Coli presence (Positive/Negative)
* **Water Quality Index (WQI)**: Calculated automatically upon log submission to classify source quality as:
  - **Safe**
  - **Moderate**
  - **Unsafe**
  - **Critical**

### 3. Real-Time Alerting & Issue Reporting
A public or user-logged issue tracking system to notify authorities about contamination and physical infrastructure issues:
* **Report types**: Pipeline damage, odor, discoloration, health outbreaks.
* **Severity tags**: Low, Medium, High, Emergency.
* **Status workflow**: `Open` ➡️ `In Progress` ➡️ `Resolved`.

### 4. Interactive Trend Visualization
Visual dashboards displaying historical and comparative insights:
* **Trend lines & bar graphs** (using Chart.js / react-chartjs-2) showing changes over days, weeks, months, and years.
* **Aggregations**: Village-wise & Source-wise contamination tracking.

### 5. Admin Management Dashboard
An oversight panel for higher-level health and municipal officers to:
* Co-ordinate interventions across multiple villages and regions.
* View audit trails of who created, edited, or resolved logs.

---

## 🛠️ Technology Stack

* **Frontend**: React.js (Vite, React Router DOM, Tailwind/Vanilla CSS, Lucide React, Chart.js & react-chartjs-2)
* **Backend**: Node.js with Express.js
* **Database**: MongoDB (Mongoose ODM)
* **State & Auth Management**: React Context API & JWT (JSON Web Tokens) with Cookies/LocalStorage
* **HTTP Client**: Axios

---

## 📁 File Structure

The project follows a split MERN structure with a React frontend client and an Express backend server.

```text
C:\Users\Aman Kumar\OneDrive\Desktop\Yashverma-2006
├── backend/                       # Node.js + Express Backend REST API
│   ├── src/
│   │   ├── config/                # MongoDB connection configuration
│   │   │   └── db.js
│   │   ├── controllers/           # Request handlers for routes
│   │   │   ├── analyticsController.js
│   │   │   ├── auditController.js
│   │   │   ├── authController.js
│   │   │   ├── issueController.js
│   │   │   └── waterLogController.js
│   │   ├── middleware/            # JWT Auth, Roles (RBAC), Error Handler
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/                # Mongoose Schemas & Database Models
│   │   │   ├── AuditLog.js
│   │   │   ├── IssueReport.js
│   │   │   ├── User.js
│   │   │   ├── WaterSource.js
│   │   │   └── WaterTestLog.js
│   │   ├── routes/                # Express API Routes
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── auditRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── issueRoutes.js
│   │   │   └── waterLogRoutes.js
│   │   ├── utils/                 # WQI calculators & seed scripts
│   │   │   ├── calculateWQI.js
│   │   │   └── seedData.js
│   │   ├── app.js                 # Express application initialization
│   │   └── server.js              # Server entry point
│   ├── .env.example               # Backend environment variables
│   ├── .env                       # Backend local configuration
│   ├── package.json               # Backend dependencies
│   └── package-lock.json
│
├── frontend/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/            # Reusable UI Components
│   │   │   ├── common/            # Navbar, Sidebar, ProtectedRoute
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── dashboard/         # Dashboard Stats & Chart components
│   │   │   │   ├── ContaminationChart.jsx
│   │   │   │   └── WaterQualityStats.jsx
│   │   │   └── logs/              # Water Quality Log components
│   │   │       └── WaterTestTable.jsx
│   │   ├── context/               # React Contexts
│   │   │   └── AuthContext.jsx
│   │   ├── pages/                 # Full Page Views
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── IssuesPage.jsx
│   │   │   ├── LogTestPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── TestLogsPage.jsx
│   │   ├── services/              # API Client & Services (Axios wrapper)
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── issueService.js
│   │   │   └── waterLogService.js
│   │   ├── utils/                 # Visual layouts & Chart configurations
│   │   │   └── chartConfigs.js
│   │   ├── App.jsx                # Core App component with React Router
│   │   ├── index.css              # Styling (Design System)
│   │   └── main.jsx               # Entry point
│   ├── .env.example               # Frontend environment variables
│   ├── index.html                 # Main template index file
│   ├── package.json               # Frontend dependencies
│   ├── package-lock.json
│   └── vite.config.js             # Vite configurations
```

---

## 🧪 Planned REST API Endpoint Map

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new user (Representative/Worker) | No |
| `POST` | `/api/v1/auth/login` | Log in user, issue JWT cookie or body token | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user details | Yes |
| `GET` | `/api/v1/logs` | Fetch water quality logs (filter by village/source) | Yes |
| `POST` | `/api/v1/logs` | Create a new water test entry | Yes |
| `PUT` | `/api/v1/logs/:id` | Edit an existing water test entry | Yes |
| `DELETE` | `/api/v1/logs/:id` | Delete an existing water test entry | Yes |
| `GET` | `/api/v1/issues` | Fetch issue reports | Yes |
| `POST` | `/api/v1/issues` | Report a new water source/pipeline issue | Yes |
| `PATCH` | `/api/v1/issues/:id` | Update issue status (open, in progress, resolved) | Yes (Admin/Health Worker) |
| `GET` | `/api/v1/analytics/trends` | Fetch trend and contamination metrics for Charts | Yes |

---

## 🎓 Grading Rubric Focus

To score maximum marks (**100/100**), the implementation must strictly satisfy the following criteria:

1. **Technical Implementation (Weight: 3)**:
   - Full working system with all MVP features.
   - Zero critical bugs.
   - Clean, secure REST endpoints and role checks.
2. **Code Quality (Weight: 2)**:
   - Modular, well-structured React components.
   - Express controllers and middlewares separating concern.
   - Consistent naming, zero dead/commented-out code blocks.
3. **Problem Relevance (Weight: 2)**:
   - Directly solve rural water safety tracking.
   - Compute WQI based on standard limits.
   - Populate dashboard with realistic mock data representing villages and real pollutants.
4. **Documentation & Demo (Weight: 2)**:
   - Clear setup README, architecture diagrams, and robust operation.
5. **Innovation & Depth (Weight: 1)**:
   - Clean UI aesthetics (vibrant dark-mode, glassmorphism, responsive micro-animations).
   - Clear audit trails for entries.
