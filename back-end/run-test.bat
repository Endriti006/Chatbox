@echo off
echo Starting server and test in separate windows...

:: Start the server in a new window
start "Chatbox Server" cmd /k "set NODE_ENV=development && set GEMINI_API_KEY=AIzaSyD7PIq0t4lKQqS7qYfBZK-hoWFD2eE0ZTs && set PORT=3001 && node src/index.js"

:: Wait for server to start
timeout /t 5

:: Run the tests in this window
npm run test:chat