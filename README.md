# 🌊 JalDrishti & AquaWatch - Rural Water Quality Monitoring System

JalDrishti (AquaWatch) is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application designed for real-time water quality tracking, analytics, and issue reporting in rural Indian villages.

## 📌 Problem Statement
Many rural Indian villages face recurring water contamination issues (high pH, fluoride, arsenic, nitrate, turbidity, e-coli), but there is no accessible system for local residents, village representatives, or health authorities to track water quality and report problems in real time.

## 🌟 Key Features
- **Role-Based Authentication**: Admin, Community Health Worker, Village Representative, Asha Worker, User.
- **Water Quality Testing Log (CRUD)**: Log Parameters (pH level, Turbidity, Dissolved Oxygen, Nitrates, Fluoride, TDS, E. Coli).
- **Real-time Alerting & Issue Reporting**: Pipeline damage, odor, discoloration, health outbreaks.
- **Visual Analytics & Dashboard**: Trend lines, bar graphs, village-wise & source-wise contamination tracking.
- **User Profile & Comparison**: Village water quality comparison, role management.

## 📁 Folder Structure
- `frontend/` - React Frontend (Vite + Chart.js)
- `backend/` - Node.js + Express Backend REST API

## 🚀 Quick Start
```bash
# Backend Setup
cd backend
npm install
npm run dev

# Frontend Setup
cd frontend
npm install
npm run dev
```
