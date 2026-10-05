@echo off
setlocal
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
:: LANGKAH 1: Backend (Python Virtual Environment & Requirements)
:: -----------------------------------------------------------------------------
echo ------------------------------------------------------------------------------
echo [LANGKAH 1/3] Menyediakan Backend (FastAPI dan Python venv)
echo ------------------------------------------------------------------------------
cd /d "%PROJECT_ROOT%backend"

if exist "%PROJECT_ROOT%backend\venv\Scripts\activate.bat" goto VENV_FOUND

echo [1.1] Membina virtual environment baharu venv...
python -m venv venv
if %errorlevel% neq 0 (
    echo [AMARAN] Mencuba dengan perintah 'py -m venv venv'...
    py -m venv venv
)

if not exist "%PROJECT_ROOT%backend\venv\Scripts\activate.bat" (
    echo [RALAT] Gagal membina venv! Sila pastikan Python dipasang dengan betul.
    pause
    exit /b 1
)
echo [1.1] Virtual environment berjaya dibina!
goto VENV_DONE

:VENV_FOUND
echo [1.1] Virtual environment venv sedia ada dikesan.

:VENV_DONE
echo.
echo [1.2] Mengaktifkan venv dan memasang pustaka backend...
call "%PROJECT_ROOT%backend\venv\Scripts\activate.bat"
python -m pip install --upgrade pip --quiet
pip install -r "%PROJECT_ROOT%backend\requirements.txt"
if %errorlevel% neq 0 (
    echo [AMARAN] Pemasangan pakej backend mempunyai amaran atau ralat separa.
) else (
    echo [1.2] Pustaka backend berjaya dipasang!
)

:: -----------------------------------------------------------------------------
:: LANGKAH 2: Admin Website (React Vite)
:: -----------------------------------------------------------------------------
echo.
echo ------------------------------------------------------------------------------
echo [LANGKAH 2/3] Menyediakan Laman Web Pentadbir (Website)...
echo ------------------------------------------------------------------------------
cd /d "%PROJECT_ROOT%website"
echo [2.1] Menjalankan 'npm install' untuk website...
call npm install
if %errorlevel% neq 0 (
    echo [AMARAN] Semak log npm di atas untuk perincian modul website.
) else (
    echo [2.1] Modul website berjaya dipasang!
)

:: -----------------------------------------------------------------------------
:: LANGKAH 3: Frontend (React Native Expo App)
:: -----------------------------------------------------------------------------
echo.
echo ------------------------------------------------------------------------------
echo [LANGKAH 3/3] Menyediakan Aplikasi Mudah Alih (Frontend Expo)...
echo ------------------------------------------------------------------------------
cd /d "%PROJECT_ROOT%frontend"
echo [3.1] Menjalankan 'npm install' untuk frontend Expo...
call npm install
if %errorlevel% neq 0 (
    echo [AMARAN] Semak log npm di atas untuk perincian modul frontend.
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
echo   2. Jalankan secara manual mengikut panduan README.md
echo.
pause
