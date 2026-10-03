@echo off
title NeighbourLoop - Cloudflare Web Tunnel ^& QR Code
color 0A

cd /d "%~dp0"

echo ==============================================================================
echo             NEIGHBOURLOOP - CLOUDFLARE FREE TUNNEL ^& QR GENERATOR
echo ==============================================================================
echo.

:: 1. Semak Python Virtual Environment
if exist "%~dp0backend\venv\Scripts\activate.bat" (
    call "%~dp0backend\venv\Scripts\activate.bat"
) else (
    echo [AMARAN] venv tidak dijumpai. Menjalankan python global...
)

:: 2. Semak pustaka qrcode
python -c "import qrcode" >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Memasang pustaka penjana kod QR (qrcode, pillow)...
    pip install "qrcode[pil]" --quiet
)

:: 3. Jalankan skrip penjana Cloudflare Tunnel dan Kod QR
python share_web.py

pause
