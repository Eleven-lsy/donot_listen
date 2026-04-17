@echo off
title Listening App - Dev Server
echo.
echo ========================================
echo   Listening App - HTTP Dev Server
echo ========================================
echo.
echo Starting local server...
echo Access URL: http://localhost:3000
echo Press Ctrl+C to stop
echo.

cd /d "%~dp0"
python -m http.server 3000

pause
