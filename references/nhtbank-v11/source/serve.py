"""Serve only demo assets, never repository files. Python 3 standard library."""
import argparse
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ASSETS = {'/': ('index.html', 'text/html'), '/index.html': ('index.html', 'text/html'),
          '/styles.css': ('styles.css', 'text/css'), '/app.js': ('app.js', 'text/javascript'),
          '/bank-model.js': ('bank-model.js', 'text/javascript')}

for name in ('vendor/qrcode.js','vendor/jsqr.js'):
    ASSETS['/'+name] = (name,'text/javascript')
for name in ('BeVietnamPro-Regular.ttf','BeVietnamPro-SemiBold.ttf','BeVietnamPro-Bold.ttf'):
    ASSETS['/fonts/'+name] = ('fonts/'+name,'font/ttf')

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        asset = ASSETS.get(self.path.split('?')[0])
        if not asset:
            self.send_error(404)
            return
        data = (ROOT / asset[0]).read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', asset[1] + '; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(data)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8080)
    args = parser.parse_args()
    print(f'NhTBank DEMO: http://{args.host}:{args.port}', flush=True)
    HTTPServer((args.host, args.port), Handler).serve_forever()
