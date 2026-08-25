@echo off
cd /d "C:\Users\ayisha\Desktop\Medivault\MediVault\unified-app"
echo Starting React development server...
start /min cmd /k npm start
echo React server started in background window
timeout /t 10
echo Opening browser...
start http://localhost:3000