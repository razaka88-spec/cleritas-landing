@echo off
echo Deploying Cleritas Pharma Homepage...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found. Installing Python recommended for local testing.
    echo For deployment, use one of these options:
    echo.
    echo 1. GitHub Pages: Upload files to GitHub repository and enable Pages
    echo 2. Netlify: Drag and drop folder to netlify.com
    echo 3. Vercel: Upload files to vercel.com
    echo.
    pause
    exit /b 1
)

echo Starting local server for testing...
echo Your site will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8000

pause
