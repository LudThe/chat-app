@echo off
echo Starting the backend...

REM Navigate to the backend directory and start the backend
cd chat-app-backend/chat-app-backend
if errorlevel 1 (
    echo Backend directory not found
    exit /b 1
)
dotnet restore
start /B dotnet run

echo Starting the frontend in a new terminal...

REM Navigate to the frontend directory and start the frontend in a new Command Prompt window
start cmd /k "cd ..\..\chat-app-frontend && npm install && npm run dev"

echo Both applications are now running.
pause
