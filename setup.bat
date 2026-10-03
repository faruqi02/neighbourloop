@echo off
setlocal enabledelayedexpansion
title NeighbourLoop - Automated Setup
color 0B

echo ==============================================================================
echo                     NEIGHBOURLOOP - AUTOMATED SETUP
echo ==============================================================================
echo.
echo [INFO] Menyiapkan persekitaran NeighbourLoop untuk kali pertama...
echo [INFO] Direktori Projek: %~dp0
echo.

set "PROJECT_ROOT=%~dp0"

:: -----------------------------------------------------------------------------
:: Semakan Asas: Python & Node.js
:: -----------------------------------------------------------------------------
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [RALAT] Python tidak dijumpai dalam sistem PATH anda!
    echo Sila pasang Python 3.10+ dari https://www.python.org/downloads/
    echo dan pastikan tanda 'Add python.exe to PATH' dipilih semasa pemasangan.
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [RALAT] Node.js / npm tidak dijumpai dalam sistem PATH anda!
    echo Sila pasang Node.js LTS dari https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: -----------------------------------------------------------------------------
:: LANGKAH 1 & 2: Backend (Python Virtual Environment & Requirements)
:: -----------------------------------------------------------------------------
echo ------------------------------------------------------------------------------
echo [LANGKAH 1/3] Menyediakan Backend (FastAPI & Python venv)...
echo ------------------------------------------------------------------------------
cd /d "%PROJECT_ROOT%backend"

if not exist "%PROJECT_ROOT%backend\venv\Scripts\activate.bat" (
    echo [1.1] Membina virtual environment baharu (venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [AMARAN] Percubaan pertama gagal, mencuba 'py -m venv venv'...
        py -m venv venv
    )
    echo [1.1] Virtual environment berjaya dibina!
) else (
    echo [1.1] Virtual environment (venv) sedia ada dikesan.
)

echo.
echo [1.2] Memasang pustaka backend daripada requirements.txt...
call "%PROJECT_ROOT%backend\venv\Scripts\activate.bat"
python -m pip install --upgrade pip --quiet
pip install -r "%PROJECT_ROOT%backend\requirements.txt"
if %errorlevel% neq 0 (
    echo [RALAT] Gagal memasang beberapa pakej python. Sila semak sambungan internet.
) else (
    echo [1.2] Pustaka backend berjaya dipasang sepenuhnya!
)

:: -----------------------------------------------------------------------------
:: LANGKAH 3: Admin Website (React Vite)
:: -----------------------------------------------------------------------------
echo.
echo ------------------------------------------------------------------------------
echo [LANGKAH 2/3] Menyediakan Laman Web Pentadbir (Website)...
echo ------------------------------------------------------------------------------
cd /d "%PROJECT_ROOT%website"
echo [2.1] Menjalankan 'npm install' untuk website...
call npm install
if %errorlevel% neq 0 (
    echo [RALAT] Terdapat masalah semasa memasang modul website.
) else (
    echo [2.1] Modul website berjaya dipasang!
)

:: -----------------------------------------------------------------------------
:: LANGKAH 4: Frontend (React Native Expo App)
:: -----------------------------------------------------------------------------
echo.
echo ------------------------------------------------------------------------------
echo [LANGKAH 3/3] Menyediakan Aplikasi Mudah Alih (Frontend React Native)...
echo ------------------------------------------------------------------------------
cd /d "%PROJECT_ROOT%frontend"
echo [3.1] Menjalankan 'npm install' untuk frontend (Expo)...
call npm install
if %errorlevel% neq 0 (
    echo [RALAT] Terdapat masalah semasa memasang modul frontend.
) else (
    echo [3.1] Modul frontend berjaya dipasang!
)

:: Kembali ke direktori root
cd /d "%PROJECT_ROOT%"

echo.
echo ==============================================================================
echo [SELESAI] Semua persediaan projek NeighbourLoop telah berjaya!
echo ==============================================================================
echo.
echo Anda kini boleh menjalankan projek ini dengan:
echo   1. Dwiklik fail 'auto_run_v2.bat' untuk melancarkan semua servis serentak, ATAU
echo   2. Jalankan secara manual:
echo      - Backend:      cd backend ^&^& venv\Scripts\activate ^&^& python main.py
echo      - Admin Web:    cd website ^&^& npm run dev
echo      - Mobile App:   cd frontend ^&^& npx expo start
echo.
pause
