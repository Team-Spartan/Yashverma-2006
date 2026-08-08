# 🌊 JalDrishti (AquaWatch) - Rural Water Quality Monitoring & Health Surveillance System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-646CFF.svg)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**JalDrishti** is a full-stack MERN application designed for real-time water quality tracking, automated Water Quality Indexing (WQI - BIS IS 10500 standards), contamination alerting, and issue resolution tracking in rural Indian villages.

---

## 🌐 Live Application Link

> **Online Web App**: [https://jaldrishti-rural-water.vercel.app](https://jaldrishti-rural-water.vercel.app) *(Deploy link)*  
> **Local Live Server**: `http://localhost:3000`  
> **Backend API Health**: `http://localhost:5000/api/health`  

---

## 🌟 Key Features

- 📊 **Real-time Overview Dashboard**: Automated regional WQI calculations, safe drinking water %, active contamination metrics, and high-risk alerts.
- 🧪 **Water Test Logging & Analytics**: Log & monitor 7 key parameters (*pH, TDS, Turbidity, Fluoride, Nitrate, Bacterial Count, Dissolved Oxygen*).
- 🚨 **Contamination Issue Reporting**: Seamless reporting for pipe leaks, sewer contamination, chemical runoff, and pump failures with severity tagging (*Critical, High, Medium, Low*).
- 📈 **Trend Analytics & Visualization**: Monthly trend line charts and distribution breakdown powered by Chart.js.
- 👥 **Role-Based Access Control (RBAC)**: Role switching & permissions for *District Admins, Health Representatives, and Village Residents*.
- 🔔 **Real-time Notifications**: Alert feed with read/unread tracking and severity flags.
- 🌐 **Bilingual Support**: Instant switching between **English** and **Hindi (हिंदी)**.

---

## 👥 Development Team (All 15 User Stories Completed)

| Team Member | Role & Responsibilities | Status |
| :--- | :--- | :--- |
| **Yash Sharma** | Team Leader & Full-Stack Architect | ✅ 5/5 Stories Complete |
| **Ankit Kumar** | Frontend & Chart.js Specialist | ✅ 5/5 Stories Complete |
| **Nitish Singh** | Backend & API Engineer | ✅ 5/5 Stories Complete |
| **Rohit Verma** | System Design & QA Engineer | ✅ 5/5 Stories Complete |

---

## ⚡ Quick Start (How to Run Locally)

### Option 1: 1-Click Execution (Windows)
Simply double-click **`start.bat`** in the project root folder. It automatically launches both Backend (Port 5000) and Frontend (Port 3000).

### Option 2: Command Line Setup

```bash
# 1. Clone repository
git clone https://github.com/YourUsername/Yashverma-2006.git
cd Yashverma-2006

# 2. Start Backend API Server
cd backend
npm install
node server.js

# 3. Start Frontend UI (in a new terminal tab)
cd frontend
npm install
npx vite
```

---

## ☁️ How to Deploy Online (Free 24/7 Live URL)

### 1. Deploy Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** and select your `Yashverma-2006` repository.
3. Set **Root Directory** to `frontend`.
4. Click **Deploy**! Vercel gives you a permanent `https://...vercel.app` URL.

### 2. Deploy Backend on Render
1. Go to [Render.com](https://render.com) and create a **Web Service**.
2. Connect your GitHub repository and set **Root Directory** to `backend`.
3. Set **Build Command**: `npm install` and **Start Command**: `node server.js`.
4. Click **Create Web Service**.

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
