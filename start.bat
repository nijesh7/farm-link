@echo off
title FarmLink Dev Server
echo ========================================
echo        Starting FarmLink Application
echo ========================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm.cmd install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo [INFO] Launching Vite Dev Server at http://localhost:5173 ...
echo.
call npm.cmd run dev

if errorlevel 1 (
    echo.
    echo [ERROR] Server exited with an error code.
    pause
)
