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

:: 1. Semak & Sediakan Backend venv jika belum wujud
if not exist "%~dp0backend\venv\Scripts\activate.bat" (
    echo [AMARAN] venv tidak dijumpai dalam folder backend. Sedang membina venv...
    cd /d "%~dp0backend"
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    pip install "qrcode[pil]" --quiet
    cd /d "%~dp0"
)

:: Pastikan pustaka qrcode sedia ada
call "%~dp0backend\venv\Scripts\activate.bat"
python -c "import qrcode" >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Memasang sokongan kod QR...
    pip install "qrcode[pil]" --quiet
)

:: 2. Kesan IP LAN Aktif (mengelakkan VMware virtual adapter mengelirukan Expo Go)
for /f "tokens=*" %%i in ('python -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2^>nul') do set HOST_IP=%%i
if not defined HOST_IP set HOST_IP=192.168.100.129
echo [INFO] IP Rangkaian Dikesan untuk Expo Go: %HOST_IP%

echo Membuka kesemua 4 panel servis bersebelahan dalam satu tetingkap...

:: 3. Lancarkan keempat-empat panel dalam satu tetingkap Windows Terminal:
::    - Panel 1: Backend (FastAPI)
::    - Panel 2: Frontend (Expo Go)
::    - Panel 3: Admin Website (Vite)
::    - Panel 4: Web QR (Cloudflare Tunnel + QR Code untuk Telefon)
start "" wt -M ^
  new-tab --title "Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && echo ======================================== && echo  NeighbourLoop Backend (FastAPI) is Running! && echo  - API Base URL: http://127.0.0.1:8000 && echo  - LAN URL:      http://%HOST_IP%:8000 && echo  - Swagger Docs: http://127.0.0.1:8000/docs && echo ======================================== && echo. && uvicorn main:app --reload --host 0.0.0.0 --port 8000" ; ^
  split-pane -V --size 0.66 --title "Frontend (Expo)" cmd /k "timeout /t 2 /nobreak >nul && cd /d "%~dp0frontend" && set REACT_NATIVE_PACKAGER_HOSTNAME=%HOST_IP% && echo ======================================== && echo  NeighbourLoop Frontend (Expo) is Starting... && echo  - Host IP: %HOST_IP%:8081 && echo  - Imbas Kod QR dengan aplikasi Expo Go && echo ======================================== && echo. && npx expo start -c" ; ^
  split-pane -V --size 0.50 --title "Admin Website" cmd /k "timeout /t 4 /nobreak >nul && cd /d "%~dp0website" && echo ======================================== && echo  NeighbourLoop Admin Website (Vite) is Starting... && echo  - URL: http://localhost:5173 && echo ======================================== && echo. && npm run dev -- --host" ; ^
  split-pane -H --title "Web QR (Cloudflare)" cmd /k "timeout /t 5 /nobreak >nul && chcp 65001 >nul && cd /d "%~dp0" && call "%~dp0backend\venv\Scripts\activate.bat" && python "%~dp0share_web.py""

echo.
echo ==============================================================================
echo [BERJAYA] Keempat-empat servis telah dibuka dalam satu tetingkap bersebelahan!
echo ==============================================================================
echo.
echo  * Backend API:       http://127.0.0.1:8000
echo  * Swagger Docs:      http://127.0.0.1:8000/docs
echo  * Frontend Expo:     Lihat tetingkap Expo untuk kod QR Expo Go
echo  * Admin Website:     http://localhost:5173
echo  * Web QR Cloudflare: Lihat tetingkap Web QR / imbas qr_web.png dari telefon
echo.
pause