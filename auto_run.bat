@echo off
title NeighbourLoop Auto-Launcher
color 0A

echo ==============================================================================
echo                      NEIGHBOURLOOP - SYSTEM LAUNCHER
echo ==============================================================================
echo.
echo Initializing NeighbourLoop services...
echo Root Directory: %~dp0
echo.

:: ------------------------------------------------------------------------------
:: 1. Semak & Lancarkan Backend (FastAPI)
:: ------------------------------------------------------------------------------
echo [1/2] Memulakan Backend (FastAPI)...

if not exist "%~dp0backend\venv\Scripts\activate.bat" (
    echo [AMARAN] venv tidak dijumpai dalam folder backend. Sedang membina venv...
    cd /d "%~dp0backend"
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd /d "%~dp0"
)

start "NeighbourLoop - Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && echo ======================================== && echo  NeighbourLoop Backend (FastAPI) is Running! && echo  - API Base URL: http://127.0.0.1:8000 && echo  - Swagger Docs: http://127.0.0.1:8000/docs && echo ======================================== && echo. && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Tunggu 2 saat sebelum melancarkan frontend
timeout /t 2 /nobreak >nul

:: ------------------------------------------------------------------------------
:: 2. Semak & Lancarkan Frontend (Expo React Native)
:: ------------------------------------------------------------------------------
echo [2/2] Memulakan Frontend (Expo Metro Bundler)...

start "NeighbourLoop - Frontend (Expo)" cmd /k "cd /d "%~dp0frontend" && echo ======================================== && echo  NeighbourLoop Frontend (Expo) is Starting... && echo  Imbas Kod QR dengan aplikasi Expo Go && echo ======================================== && echo. && npx expo start"

echo.
echo ==============================================================================
echo [BERJAYA] Kedua-dua Backend dan Frontend telah dilancarkan di tetingkap berasingan!
echo ==============================================================================
echo.
echo  * Backend API:  http://127.0.0.1:8000
echo  * Swagger Docs: http://127.0.0.1:8000/docs
echo  * Frontend:     Lihat tetingkap Expo untuk kod QR dan log
echo.
echo Tips:
echo  - Biarkan kedua-dua tetingkap terbuka semasa membuat ujian / demo.
echo  - Untuk menghentikan servis, tekan Ctrl + C dalam tetingkap masing-masing.
echo.
echo Tetingkap launcher ini boleh ditutup pada bila-bila masa.
pause

