# Servidor local do site (o Solo roda este arquivo). Igual ao "python3 -m http.server",
# mas manda "Cache-Control: no-store": o navegador sempre busca CSS e JS novos,
# e uma página nunca mistura arquivos antigos com novos enquanto se edita.
import http.server, sys

class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

porta = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
http.server.ThreadingHTTPServer(("127.0.0.1", porta), SemCache).serve_forever()
