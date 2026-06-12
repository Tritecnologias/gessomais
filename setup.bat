@echo off
echo === Gesso Premium - Setup Inicial ===
cd /d "%~dp0app"
npm run db:setup
pause
