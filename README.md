# NeighbourLoop - Platform Komuniti Lestari (Sustainable Community Platform)

Platform komuniti kejiranan serba lengkap untuk jual beli barangan terpakai (Marketplace), sumbangan & kitar semula pintar (Smart Recycling & Donation), bantuan setempat (Help Nearby), perbualan (In-app Chat), dan notis pengumuman komuniti (Community Notices).

---

## 🏗️ Seni Bina Sistem (Architecture)

Projek ini mengandungi 3 komponen utama yang berhubung dengan pangkalan data Google Apps Script (GAS) & Google Drive:

1. **Backend API (`/backend`)**: Dibina menggunakan **FastAPI (Python)**, menyokong autentikasi, penyulitan kata laluan (bcrypt), perhubungan Google Apps Script, caching pantas, dan dokumentasi interaktif Swagger.
2. **Aplikasi Mudah Alih (`/frontend`)**: Dibina menggunakan **React Native (Expo Router v4)** dengan sokongan penuh Android & iOS melalui aplikasi **Expo Go**.
3. **Portal Pentadbir (`/website`)**: Dibina menggunakan **React + Vite + Tailwind CSS** untuk pengurusan komuniti, semakan aduan barangan, statistik kitar semula, tapisan notis komuniti, dan kelulusan siaran.

---

## 📋 Keperluan Sistem (Prerequisites)

Sebelum memulakan, pastikan komputer anda telah dipasang:
* **Python 3.10+**: [Muat Turun Python](https://www.python.org/downloads/) *(Pastikan pilihan "Add python.exe to PATH" ditandakan)*
* **Node.js LTS (18+ / 20+)**: [Muat Turun Node.js](https://nodejs.org/)
* **Git**: [Muat Turun Git](https://git-scm.com/)
* *(Pilihan Digalakkan)* **Windows Terminal**: Untuk membuka kesemua 3 konsol servis secara bersebelahan.

---

## ⚡ Panduan Pantas Permulaan (Quick Start)

### Langkah 1: Klon Repositori (Clone Repository)
```bash
git clone https://github.com/<username>/neighbourloop.git
cd neighbourloop
```

### Langkah 2: Pemasangan Automatik (1-Click Setup)
Jalankan skrip persediaan automatik untuk memasang kesemua pustaka Python & Node.js:
```bash
setup.bat
```
Skrip ini akan secara automatik:
1. Membina virtual environment Python (`backend/venv`).
2. Memasang semua modul Python daripada `backend/requirements.txt`.
3. Memasang modul Node.js portal pentadbir (`website/node_modules`).
4. Memasang modul Node.js aplikasi mudah alih (`frontend/node_modules`).

---

## 🚀 Menjalankan Projek (Running the App)

### Kaedah A: Pelancaran Pantas Serentak (Disyorkan)
Dwiklik fail:
```bash
auto_run_v2.bat
```
Skrip ini akan membuka **Windows Terminal** dengan 3 panel serentak:
1. **Panel 1 - Backend API**: `http://127.0.0.1:8000` (Dokumentasi API: `http://127.0.0.1:8000/docs`)
2. **Panel 2 - Frontend Expo**: Menjana kod QR untuk diimbas terus menggunakan aplikasi **Expo Go** pada telefon pintar anda.
3. **Panel 3 - Admin Website**: `http://localhost:5173`

---

### Kaedah B: Pelancaran Manual (Manual Commands)

Sekiranya anda ingin menjalankan setiap servis secara berasingan:

#### 1. Backend (FastAPI)
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Laman Pentadbir (Website Vite)
```bash
cd website
npm run dev -- --host
```

#### 3. Aplikasi Mudah Alih (Expo)
```bash
cd frontend
npx expo start -c
```

---

## 📱 Cara Menguji di Telefon Pintar (Expo Go)

1. Sambungkan telefon dan komputer ke rangkaian Wi-Fi yang sama (atau Mobile Hotspot yang sama).
2. Buka aplikasi **Expo Go** di telefon (Android atau iPhone).
3. Imbas kod QR yang terpapar di konsol **Frontend Expo** (atau taip URL Metro bundler). Aplikasi akan terus dimuatkan secara langsung!

---

## 🛠️ Pustaka & Dependencies Utama

### Backend (`requirements.txt`)
* `fastapi` & `uvicorn`: Kerangka API berkelajuan tinggi.
* `pydantic`: Validasi skema data permintaan & respons.
* `requests` & `httpx`: Integrasi HTTP dengan Google Apps Script Webhooks.
* `bcrypt` & `passlib`: Keselamatan kata laluan & penyulitan hash selamat.
* `qrcode[pil]` & `pillow`: Penjana kod QR beresolusi tinggi automatik.
* `python-dotenv` & `python-multipart`: Pengendalian fail & pembolehubah persekitaran.

### Frontend (`frontend/package.json`)
* `expo` (SDK 52/57) & `expo-router`: Navigasi berasaskan fail (File-based routing).
* `react-native`: Enjin aplikasi mudah alih lintas platform.
* `nativewind` & `tailwindcss`: Penggayaan utiliti responsif.
* `lucide-react-native`: Ikon vektor moden & konsisten.
* `zustand`: Pengurusan status global (Global State Management) untuk pengguna, chat, marketplace, dan kitar semula.

### Website (`website/package.json`)
* `react` & `react-dom`
* `vite`: Pembina frontend ultra-pantas.
* `tailwindcss`: Reka bentuk papan pemuka pentadbir moden.
* `lucide-react`: Pakej ikon antara muka pengguna.

---

## 🔒 Lesen & Hak Cipta
Hak Cipta Terpelihara © 2026 NeighbourLoop Team (Projek Tahun Akhir / FYP).
