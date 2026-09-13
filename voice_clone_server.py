#!/usr/bin/env python3
"""
Method 3: Open-Source AI Voice Cloning Backend Server & Committee Mobile Real-Time Sync Engine
Supports zero-shot neural voice cloning, Edge-TTS High-Definition Neural Voice, and real-time committee sync.
"""

import http.server
import socketserver
import json
import os
import sys
import base64
import re
import socket
import time
import urllib.request
import urllib.parse
from io import BytesIO

PORT = 5005
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
DONORS_FILE = os.path.join(DATA_DIR, "shared_donors.json")
MATTERS_FILE = os.path.join(DATA_DIR, "shared_matters.json")

# Try importing Coqui TTS if installed in the environment
HAS_COQUI = False
try:
    from TTS.api import TTS
    HAS_COQUI = True
    print(" [Method 3 AI Server] Coqui XTTS v2 is available for local GPU/CPU voice cloning!")
except ImportError:
    print(" [Method 3 AI Server] Coqui TTS package not installed locally. Operating in High-Quality Neural Proxy Mode.")

def get_local_ip():
    """Detects local network IP (Wi-Fi/LAN) for phone access"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

def load_json_file(filepath, default_val):
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Error loading {filepath}: {e}")
    return default_val

def save_json_file(filepath, data):
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"❌ Error saving {filepath}: {e}")
        return False

# In-memory data store initialized from JSON files
SHARED_DONORS = load_json_file(DONORS_FILE, [])
SHARED_MATTERS = load_json_file(MATTERS_FILE, [])
LAST_UPDATE_TIME = time.time()

class VoiceCloneRequestHandler(http.server.BaseHTTPRequestHandler):

    def _set_cors_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', content_type)
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(200)

    def do_GET(self):
        global SHARED_DONORS, SHARED_MATTERS, LAST_UPDATE_TIME
        parsed_path = urllib.parse.urlparse(self.path)
        local_ip = get_local_ip()

        if parsed_path.path == '/api/health':
            self._set_cors_headers(200, "application/json")
            status_data = {
                "status": "online",
                "method": 3,
                "engine": "coqui_xtts_v2" if HAS_COQUI else "neural_proxy",
                "message": "Open-Source AI Voice Server & Mobile Sync Ready! 🤖📱",
                "supportedProfiles": ["telugu_male", "telugu_female"],
                "localIp": local_ip,
                "mobileSyncUrl": f"http://{local_ip}:8085"
            }
            self.wfile.write(json.dumps(status_data).encode('utf-8'))

        elif parsed_path.path in ['/api/sync/data', '/api/sync/status']:
            self._set_cors_headers(200, "application/json")
            response = {
                "status": "success",
                "timestamp": LAST_UPDATE_TIME,
                "donors": SHARED_DONORS,
                "matters": SHARED_MATTERS,
                "localIp": local_ip,
                "mobileSyncUrl": f"http://{local_ip}:8085",
                "serverPort": PORT
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

        elif parsed_path.path == '/api/sync/info':
            self._set_cors_headers(200, "application/json")
            info = {
                "localIp": local_ip,
                "webPort": 8085,
                "syncPort": PORT,
                "mobileSyncUrl": f"http://{local_ip}:8085",
                "donorCount": len(SHARED_DONORS),
                "matterCount": len(SHARED_MATTERS),
                "timestamp": LAST_UPDATE_TIME
            }
            self.wfile.write(json.dumps(info).encode('utf-8'))

        else:
            self._set_cors_headers(404, "application/json")
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        global SHARED_DONORS, SHARED_MATTERS, LAST_UPDATE_TIME
        parsed_path = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            data = json.loads(post_data.decode('utf-8')) if post_data else {}
        except Exception:
            data = {}

        if parsed_path.path in ['/api/generate-voice', '/api/generate-celebrity-voice']:
            try:
                text = data.get('text', '').strip()
                profile = data.get('profile', 'telugu_male')
                sample_base64 = data.get('audioSampleBase64', None)

                if not text:
                    self._set_cors_headers(400, "application/json")
                    self.wfile.write(json.dumps({"error": "Text payload is empty"}).encode('utf-8'))
                    return

                print(f"🎙️ [Method 3 Request] Generating Voice for profile: '{profile}', text: '{text[:40]}...'")
                audio_bytes = self.generate_voice_audio(text, profile, sample_base64)
                
                if audio_bytes:
                    self._set_cors_headers(200, "audio/mpeg")
                    self.wfile.write(audio_bytes)
                else:
                    self._set_cors_headers(500, "application/json")
                    self.wfile.write(json.dumps({"error": "Failed to synthesize voice"}).encode('utf-8'))

            except Exception as e:
                print(f"❌ Error processing request: {e}")
                self._set_cors_headers(500, "application/json")
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        elif parsed_path.path == '/api/sync/donor':
            action = data.get('action', 'save')
            if action == 'delete':
                donor_id = data.get('id')
                SHARED_DONORS = [d for d in SHARED_DONORS if d.get('id') != donor_id]
            else:
                donor = data.get('donor')
                if donor and 'id' in donor:
                    # Update existing or prepend
                    existing_idx = next((i for i, d in enumerate(SHARED_DONORS) if d.get('id') == donor['id']), -1)
                    if existing_idx >= 0:
                        SHARED_DONORS[existing_idx] = donor
                    else:
                        SHARED_DONORS.insert(0, donor)

            save_json_file(DONORS_FILE, SHARED_DONORS)
            LAST_UPDATE_TIME = time.time()
            self._set_cors_headers(200, "application/json")
            self.wfile.write(json.dumps({"status": "success", "donors": SHARED_DONORS, "timestamp": LAST_UPDATE_TIME}).encode('utf-8'))

        elif parsed_path.path == '/api/sync/bulk_donors':
            new_donors = data.get('donors', [])
            if isinstance(new_donors, list):
                # Merge new donors avoid duplicates by id
                existing_ids = {d.get('id') for d in SHARED_DONORS if 'id' in d}
                for nd in new_donors:
                    if nd.get('id') not in existing_ids:
                        SHARED_DONORS.insert(0, nd)
                        existing_ids.add(nd.get('id'))

                save_json_file(DONORS_FILE, SHARED_DONORS)
                LAST_UPDATE_TIME = time.time()

            self._set_cors_headers(200, "application/json")
            self.wfile.write(json.dumps({"status": "success", "donors": SHARED_DONORS, "timestamp": LAST_UPDATE_TIME}).encode('utf-8'))

        elif parsed_path.path == '/api/sync/matter':
            action = data.get('action', 'save')
            if action == 'delete':
                matter_id = data.get('id')
                SHARED_MATTERS = [m for m in SHARED_MATTERS if m.get('id') != matter_id]
            else:
                matter = data.get('matter')
                if matter and 'id' in matter:
                    existing_idx = next((i for i, m in enumerate(SHARED_MATTERS) if m.get('id') == matter['id']), -1)
                    if existing_idx >= 0:
                        SHARED_MATTERS[existing_idx] = matter
                    else:
                        SHARED_MATTERS.insert(0, matter)

        elif parsed_path.path == '/api/sync/bulk_matters':
            new_matters = data.get('matters', [])
            if isinstance(new_matters, list):
                existing_ids = {m.get('id') for m in SHARED_MATTERS if 'id' in m}
                for nm in new_matters:
                    if nm.get('id') not in existing_ids:
                        SHARED_MATTERS.insert(0, nm)
                        existing_ids.add(nm.get('id'))

                save_json_file(MATTERS_FILE, SHARED_MATTERS)
                LAST_UPDATE_TIME = time.time()

            self._set_cors_headers(200, "application/json")
            self.wfile.write(json.dumps({"status": "success", "matters": SHARED_MATTERS, "timestamp": LAST_UPDATE_TIME}).encode('utf-8'))

        else:
            self._set_cors_headers(404, "application/json")
            self.wfile.write(json.dumps({"error": "Invalid API endpoint"}).encode('utf-8'))

    def generate_voice_audio(self, text, profile, sample_base64):
        """
        Synthesizes audio using Coqui XTTS v2, Edge-TTS High-Definition Neural Voice, or fallback
        """
        # 1. If Coqui TTS is available, run zero-shot voice clone
        if HAS_COQUI and sample_base64:
            try:
                sample_filename = f"temp_sample_{profile}.wav"
                out_filename = f"temp_output_{profile}.wav"
                
                with open(sample_filename, "wb") as f:
                    f.write(base64.b64decode(sample_base64.split(",")[-1]))
                
                tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
                tts.tts_to_file(text=text, speaker_wav=sample_filename, language="te", file_path=out_filename)
                
                with open(out_filename, "rb") as f:
                    audio_data = f.read()
                
                if os.path.exists(sample_filename): os.remove(sample_filename)
                if os.path.exists(out_filename): os.remove(out_filename)
                return audio_data
            except Exception as ex:
                print(f"⚠️ Coqui XTTS synthesis error: {ex}. Falling back to Edge Neural TTS.")

        # 2. High-Definition Neural Voice Synthesis via Edge-TTS (Telugu Native Neural)
        try:
            import asyncio
            import edge_tts
            
            profile_configs = {
                'telugu_male': {'voice': 'te-IN-MohanNeural', 'pitch': '-1Hz', 'rate': '-2%'},
                'telugu_female': {'voice': 'te-IN-ShrutiNeural', 'pitch': '+1Hz', 'rate': '+0%'},
                'male': {'voice': 'te-IN-MohanNeural', 'pitch': '-1Hz', 'rate': '-2%'},
                'female': {'voice': 'te-IN-ShrutiNeural', 'pitch': '+1Hz', 'rate': '+0%'}
            }
            
            cfg = profile_configs.get(profile, {'voice': 'te-IN-MohanNeural', 'pitch': '+0Hz', 'rate': '+0%'})
            out_file = f"temp_edge_{profile}_{os.getpid()}.mp3"
            
            # Format text for realistic natural human prosody & micro-pauses
            formatted_text = text.replace("గారు", "గారు, ").replace("గారూ", "గారూ, ")
            formatted_text = formatted_text.replace("రూపాయలు", "రూపాయలు. ").replace("రూపాయల", "రూపాయల, ")
            formatted_text = formatted_text.replace("కానుకగా", "కానుకగా, ").replace("సమర్పించారు", "సమర్పించారు! ")
            formatted_text = re.sub(r'(\.|\!|\,)\s*', r'\1 ', formatted_text)

            async def _async_gen():
                communicate = edge_tts.Communicate(formatted_text, cfg['voice'], pitch=cfg['pitch'], rate=cfg['rate'])
                await communicate.save(out_file)
                
            asyncio.run(_async_gen())
            
            if os.path.exists(out_file):
                with open(out_file, 'rb') as f:
                    audio_data = f.read()
                os.remove(out_file)
                print(f"✅ Generated High-Definition Neural Audio ({len(audio_data)} bytes) for {profile}")
                return audio_data

        except Exception as e:
            print(f"⚠️ Edge-TTS synthesis warning: {e}. Falling back to standard gTTS.")

        # 3. Standard Fallback using Google Neural TTS via gTTS API
        try:
            encoded_text = urllib.parse.quote(text)
            tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded_text}&tl=te&client=tw-ob"
            
            req = urllib.request.Request(
                tts_url,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            )
            with urllib.request.urlopen(req) as response:
                return response.read()
        except Exception as err:
            print(f"❌ Audio synthesis fallback error: {err}")
            return None

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    local_ip = get_local_ip()
    with socketserver.TCPServer(("", PORT), VoiceCloneRequestHandler) as httpd:
        print(f"🚀 [Method 3 AI Voice & Mobile Sync Server] Running at http://localhost:{PORT}")
        print(f"🌐 Local Wi-Fi Mobile Sync IP: http://{local_ip}:{PORT}")
        print(f"📱 Committee Mobile App Link: http://{local_ip}:8085")
        print(f"📡 API Health Endpoint: http://localhost:{PORT}/api/health")
        print(f"🎙️ API Synthesis Endpoint: http://localhost:{PORT}/api/generate-voice")
        print(f"🔄 Real-time Mobile Sync Endpoint: http://localhost:{PORT}/api/sync/data")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down AI Voice Clone & Mobile Sync Server.")

if __name__ == '__main__':
    run_server()
