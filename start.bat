@echo off
echo ========================================================
echo   Starting JalDrishti Application (Backend & Frontend)
echo ========================================================
echo.

start "JalDrishti Backend API (Port 5000)" cmd /k "cd /d %~dp0 && node backend/server.js"
start "JalDrishti Frontend UI (Port 3000)" cmd /k "cd /d %~dp0frontend && powershell -ExecutionPolicy Bypass -Command "npx vite --host 0.0.0.0 --port 3000""

echo Services started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
pause
