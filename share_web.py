"""
NeighbourLoop - Cloudflare Free Tunnel & QR Code Generator
Exposes Expo Web and Backend through Cloudflare Free Tunnel and generates a scannable QR Code.
"""

import sys
import os
import re
import time
import subprocess
import threading
import socket
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.error

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_WEB_URL = "http://127.0.0.1:8081"
GATEWAY_PORT = 8088
LOG_FILE = os.path.abspath("cloudflared.log")

BACKEND_API_EXACT_PREFIXES = (
    '/auth/',
    '/admin/',
    '/users/',
    '/notices',
    '/listings',
    '/recycle/donations',
    '/recycle/centers',
    '/chat/conversations',
    '/chat/messages',
    '/chat/send',
    '/chat/read',
    '/health',
    '/docs',
    '/openapi.json'
)

FRONTEND_PAGES = (
    '/login',
    '/register',
    '/chat',
    '/explorer',
    '/profile',
    '/marketplace',
    '/recycle',
    '/help',
    '/modal'
)

class ThreadingHTTPServerWithQuietErrors(ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address):
        exc_type, exc_val, _ = sys.exc_info()
        if exc_type in (ConnectionAbortedError, BrokenPipeError, ConnectionResetError, socket.error):
            return  # Suppress normal client disconnection noise
        super().handle_error(request, client_address)

class ReverseProxyHandler(BaseHTTPRequestHandler):
    def is_api_request(self):
        clean_path = self.path.split('?')[0]

        # 1. Page navigation and HTML requests MUST go to Expo Web
        accept = self.headers.get('Accept', '')
        dest = self.headers.get('Sec-Fetch-Dest', '')
        if ('text/html' in accept) or (dest == 'document'):
            return False

        # 2. Static web assets MUST go to Expo Web
        if clean_path == '/openapi.json':
            return True

        if clean_path.startswith(('/_expo', '/assets', '/favicon', '/node_modules', '/@fs', '/src')) or any(
            clean_path.endswith(ext) for ext in ('.js', '.map', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.ttf', '.woff', '.woff2', '.json', '.web.js', '.ts', '.tsx')
        ):
            return False

        # 3. Frontend page routes
        if clean_path in FRONTEND_PAGES or clean_path == '/':
            if self.command == 'GET' and 'application/json' not in accept and 'application/json' not in self.headers.get('Content-Type', ''):
                return False

        # 4. Backend API routes
        if any(clean_path.startswith(p) for p in BACKEND_API_EXACT_PREFIXES):
            return True

        # 5. /marketplace or /help data fetches from app
        if clean_path in ('/marketplace', '/help') and ('application/json' in accept or 'application/json' in self.headers.get('Content-Type', '') or self.command != 'GET'):
            return True

        # 6. Any other mutative request (POST, PUT, DELETE, PATCH)
        if self.command in ('POST', 'PUT', 'DELETE', 'PATCH'):
            return True

        return False

    def log_message(self, format, *args):
        # Silence static asset requests, only show API routes in console
        if self.is_api_request():
            sys.stdout.write(f"[API Proxy] {self.command} {self.path}\n")
            sys.stdout.flush()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Content-Length', '0')
        self.end_headers()

    def handle_proxy(self):
        clean_path = self.path.split('?')[0]
        upgrade = self.headers.get('Upgrade', '').lower()
        connection = self.headers.get('Connection', '').lower()
        
        # Intercept WebSocket & HMR requests immediately to prevent long-poll / urllib hangs
        if upgrade == 'websocket' or 'upgrade' in connection or clean_path.startswith(('/_expo/hmr', '/hot', '/events', '/message', '/__webpack_hmr', '/_metro/hmr')):
            try:
                self.send_response(204)
                self.send_header('Connection', 'close')
                self.end_headers()
            except Exception:
                pass
            return

        is_api = self.is_api_request()
        target_base = BACKEND_URL if is_api else FRONTEND_WEB_URL
        target_url = f"{target_base}{self.path}"

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        req_headers = {}
        for key, val in self.headers.items():
            k_lower = key.lower()
            # Omit host, connection, and accept-encoding so upstream servers don't return gzip compressed bytes
            if k_lower not in ('host', 'content-length', 'connection', 'accept-encoding'):
                req_headers[key] = val
        req_headers['Connection'] = 'close'

        # Ensure upstream dev servers (Expo & FastAPI) see local host/origin
        if is_api:
            req_headers['Host'] = '127.0.0.1:8000'
        else:
            req_headers['Host'] = '127.0.0.1:8081'
            for h in list(req_headers.keys()):
                if h.lower() == 'origin':
                    req_headers[h] = 'http://127.0.0.1:8081'
                elif h.lower() == 'referer':
                    req_headers[h] = 'http://127.0.0.1:8081/'

        req = urllib.request.Request(target_url, data=body, headers=req_headers, method=self.command)

        # Timeout 60s to allow Metro compilation on cold start or GAS operations
        timeout_sec = 60
        try:
            with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
                data = resp.read()
                self.send_response(resp.status)
                for header_key, header_val in resp.headers.items():
                    k_lower = header_key.lower()
                    if k_lower not in ('transfer-encoding', 'content-encoding', 'access-control-allow-origin', 'connection', 'content-length'):
                        self.send_header(header_key, header_val)
                self.send_header('Content-Length', str(len(data)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Connection', 'close')
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            try:
                err_data = e.read()
                self.send_response(e.code)
                for header_key, header_val in e.headers.items():
                    k_lower = header_key.lower()
                    if k_lower not in ('transfer-encoding', 'content-encoding', 'access-control-allow-origin', 'connection', 'content-length'):
                        self.send_header(header_key, header_val)
                self.send_header('Content-Length', str(len(err_data)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Connection', 'close')
                self.end_headers()
                self.wfile.write(err_data)
            except (ConnectionAbortedError, BrokenPipeError, ConnectionResetError, socket.error):
                pass
        except (ConnectionAbortedError, BrokenPipeError, ConnectionResetError, socket.error):
            pass
        except Exception as err:
            try:
                msg = f"Gateway Proxy Error: {err}".encode('utf-8')
                self.send_response(502)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.send_header('Content-Length', str(len(msg)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Connection', 'close')
                self.end_headers()
                self.wfile.write(msg)
            except (ConnectionAbortedError, BrokenPipeError, ConnectionResetError, socket.error):
                pass

    do_GET = handle_proxy
    do_POST = handle_proxy
    do_PUT = handle_proxy
    do_DELETE = handle_proxy
    do_PATCH = handle_proxy

def start_gateway():
    server = ThreadingHTTPServerWithQuietErrors(('127.0.0.1', GATEWAY_PORT), ReverseProxyHandler)
    server.daemon_threads = True
    server.serve_forever()

def find_cloudflared_path():
    locations = [
        r"C:\Program Files (x86)\cloudflared\cloudflared.exe",
        r"C:\Program Files\cloudflared\cloudflared.exe",
        "cloudflared.exe",
        "cloudflared"
    ]
    for loc in locations:
        if os.path.exists(loc):
            return loc
    return "cloudflared"

def generate_qr(url):
    qr_file_path = os.path.abspath("qr_web.png")
    qr_saved = False
    qr_obj = None

    try:
        import qrcode
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        qr_obj = qr

        # Try saving to qr_web.png, or fallback to timestamped file if Windows locked it
        candidates = ["qr_web.png", f"qr_web_{int(time.time())}.png"]
        for p in candidates:
            try:
                full_p = os.path.abspath(p)
                img.save(full_p)
                qr_file_path = full_p
                qr_saved = True
                break
            except Exception:
                continue
    except Exception:
        pass

    # Online API Fallback if local PIL/qrcode fails
    if not qr_saved:
        try:
            import urllib.parse
            encoded = urllib.parse.quote(url)
            fallback_url = f"https://api.qrserver.com/v1/create-qr-code/?size=400x400&data={encoded}"
            req = urllib.request.Request(fallback_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
                for p in ["qr_web.png", f"qr_web_{int(time.time())}.png"]:
                    try:
                        full_p = os.path.abspath(p)
                        with open(full_p, 'wb') as f:
                            f.write(data)
                        qr_file_path = full_p
                        qr_saved = True
                        break
                    except Exception:
                        continue
        except Exception as e:
            print(f"[AMARAN] Gagal membina imej QR kod: {e}")

    if qr_saved:
        print(f"\n[INFO] Imej Kod QR berjaya disimpan di: {qr_file_path}")
        # Copy to artifact folder for IDE view if available
        try:
            import shutil
            artifact_dir = r"C:\Users\ismai\.gemini\antigravity\brain\b8805a51-fcf9-48a4-a88a-997cd4e7ceac"
            if os.path.isdir(artifact_dir):
                shutil.copy2(qr_file_path, os.path.join(artifact_dir, "qr_web.png"))
        except Exception:
            pass

        try:
            os.startfile(qr_file_path)
        except Exception:
            pass

    if qr_obj:
        try:
            print("\n" + "=" * 65)
            print("  IMBAS KOD QR INI DENGAN KAMERA TELEFON / APLIKASI BROWSER")
            print("=" * 65 + "\n")
            qr_obj.print_ascii(invert=True)
        except Exception:
            pass

def wait_for_services():
    print("\n      Memeriksa ketersediaan servis...")
    for name, port in [("Backend (FastAPI)", 8000), ("Frontend (Expo Web)", 8081)]:
        sys.stdout.write(f"      - Menunggu {name} di port {port}...")
        sys.stdout.flush()
        ready = False
        for _ in range(25):
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(1)
                s.connect(('127.0.0.1', port))
                s.close()
                ready = True
                break
            except Exception:
                time.sleep(1)
        if ready:
            print(" [SEDIA]")
        else:
            print(" [AMARAN: Belum sedia, meneruskan...]")

def cleanup_port(port):
    try:
        current_pid = os.getpid()
        out = subprocess.check_output(f'netstat -ano | findstr ":{port} "', shell=True, text=True, stderr=subprocess.DEVNULL)
        for line in out.strip().splitlines():
            parts = line.split()
            if len(parts) >= 5 and 'LISTENING' in parts:
                pid = int(parts[-1])
                if pid != current_pid and pid > 0:
                    subprocess.call(f'taskkill /F /PID {pid}', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

def main():
    # Ensure stdout flushes immediately and supports UTF-8
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

    print("======================================================================")
    print("      NEIGHBOURLOOP - CLOUDFLARE FREE TUNNEL & QR CODE GENERATOR")
    print("======================================================================")
    
    # Ensure port 8088 is clean
    cleanup_port(GATEWAY_PORT)

    print(f"\n[1/3] Memulakan Local Gateway Proxy pada http://127.0.0.1:{GATEWAY_PORT}...")
    print("      - Frontend Web: http://127.0.0.1:8081")
    print("      - Backend API:  http://127.0.0.1:8000")

    gateway_thread = threading.Thread(target=start_gateway, daemon=True)
    gateway_thread.start()
    time.sleep(1)

    # Wait for Backend and Expo Web to be responsive
    wait_for_services()

    cloudflared_bin = find_cloudflared_path()
    print(f"\n[2/3] Menyambungkan ke Cloudflare Free Tunnel ({cloudflared_bin})...")

    # Clear previous log file if exists
    if os.path.exists(LOG_FILE):
        try:
            os.remove(LOG_FILE)
        except Exception:
            pass

    cmd = [
        cloudflared_bin,
        "tunnel",
        "--url", f"http://127.0.0.1:{GATEWAY_PORT}",
        "--logfile", LOG_FILE
    ]

    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception as e:
        print(f"[RALAT] Gagal melancarkan cloudflared: {e}")
        return

    tunnel_url = None
    url_pattern = re.compile(r"https://[a-zA-Z0-9\-]+\.trycloudflare\.com")

    # Poll log file for generated URL (up to 30 seconds)
    print("      Menunggu URL Cloudflare dijana...")
    start_time = time.time()
    while time.time() - start_time < 30:
        if os.path.exists(LOG_FILE):
            try:
                with open(LOG_FILE, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    match = url_pattern.search(content)
                    if match:
                        tunnel_url = match.group(0)
                        break
            except Exception:
                pass
        time.sleep(0.5)

    if not tunnel_url:
        print("[RALAT] Masa tamat: Tidak dapat mengesan URL trycloudflare.")
        proc.terminate()
        return

    print("\n" + "=" * 70)
    print(" [BERJAYA] CLOUDFLARE TUNNEL AKTIF!")
    print(f" URL Laman Web: {tunnel_url}")
    print("=" * 70)

    print("\n[3/3] Menjana Kod QR...")
    generate_qr(tunnel_url)

    print("\n" + "-" * 70)
    print(f"  Pautan Pantas: {tunnel_url}")
    print("  Status: Siap! Sesiapa sahaja boleh imbas QR atau buka pautan ini.")
    print("  Tekan Ctrl+C bila selesai untuk menutup Cloudflare Tunnel.")
    print("-" * 70 + "\n")

    try:
        while proc.poll() is None:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nMenamatkan Cloudflare Tunnel...")
        proc.terminate()
        print("Selesai.")

if __name__ == "__main__":
    main()
