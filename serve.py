#!/usr/bin/env python3
import http.server, socketserver, os

PORT = int(os.environ.get('PORT', 8080))

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))
with socketserver.TCPServer(('', PORT), NoCacheHandler) as s:
    print(f'Serving on http://localhost:{PORT} (no-cache)')
    s.serve_forever()
