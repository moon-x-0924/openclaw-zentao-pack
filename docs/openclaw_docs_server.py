#!/usr/bin/env python3
import html
import mimetypes
import os
import posixpath
import sys
import urllib.parse
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

DOCS_ROOT = Path('/root/.openclaw/workspace/skills/openclaw-zentao-pack/docs').resolve()

mimetypes.add_type('text/markdown; charset=utf-8', '.md')
mimetypes.add_type('text/html; charset=utf-8', '.html')
mimetypes.add_type('text/css; charset=utf-8', '.css')
mimetypes.add_type('application/javascript; charset=utf-8', '.js')

HTML_TEMPLATE = '''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>
    :root {{
      --bg:#f4f7fb;
      --panel:#ffffff;
      --line:#d8e1ec;
      --text:#1f2937;
      --muted:#667085;
      --accent:#155eef;
      --accent-2:#0f766e;
      --code:#0f172a;
      --code-bg:#f8fafc;
    }}
    *{{box-sizing:border-box}}
    body{{margin:0;background:linear-gradient(180deg,#eef6ff 0,#f4f7fb 220px,#f4f7fb 100%);color:var(--text);font-family:"PingFang SC","Microsoft YaHei",sans-serif}}
    .wrap{{max-width:1100px;margin:0 auto;padding:28px 20px 60px}}
    .top{{background:linear-gradient(135deg,var(--accent-2),var(--accent));color:#fff;border-radius:24px;padding:24px 28px;box-shadow:0 18px 50px rgba(21,94,239,.16)}}
    .top h1{{margin:8px 0 10px;font-size:32px;line-height:1.25;word-break:break-all}}
    .top p{{margin:0;color:rgba(255,255,255,.92)}}
    .crumbs{{font-size:14px;opacity:.92;word-break:break-all}}
    .actions{{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}}
    .actions a{{display:inline-block;text-decoration:none;color:#fff;padding:10px 14px;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(255,255,255,.12)}}
    .actions a:hover{{background:rgba(255,255,255,.2)}}
    .doc{{margin-top:20px;background:var(--panel);border:1px solid var(--line);border-radius:22px;padding:28px 32px;box-shadow:0 12px 34px rgba(15,23,42,.06)}}
    #content{{min-height:240px}}
    #content h1,#content h2,#content h3,#content h4{{line-height:1.35;margin-top:1.6em;margin-bottom:.6em}}
    #content h1{{font-size:32px;border-bottom:1px solid var(--line);padding-bottom:.35em}}
    #content h2{{font-size:26px}}
    #content h3{{font-size:22px}}
    #content h4{{font-size:18px}}
    #content p,#content li{{line-height:1.85}}
    #content ul,#content ol{{padding-left:1.5em}}
    #content code{{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--code-bg);padding:.16em .38em;border-radius:6px;color:var(--code)}}
    #content pre{{background:#0f172a;color:#e2e8f0;padding:16px 18px;border-radius:14px;overflow:auto}}
    #content pre code{{background:transparent;color:inherit;padding:0}}
    #content blockquote{{margin:1em 0;padding:.2em 1em;border-left:4px solid #93c5fd;background:#f8fbff;color:#334155}}
    #content table{{width:100%;border-collapse:collapse;margin:18px 0;font-size:14px}}
    #content th,#content td{{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}}
    #content thead th{{background:#f8fbff}}
    #content a{{color:var(--accent);text-decoration:none}}
    #content a:hover{{text-decoration:underline}}
    .loading,.error{{color:var(--muted);padding:12px 0}}
  </style>
</head>
<body>
  <div class="wrap">
    <section class="top">
      <div class="crumbs">Markdown 预览 / {path_label}</div>
      <h1>{title}</h1>
      <p>当前页面为服务器端文档预览视图，默认 UTF-8 编码。</p>
      <div class="actions">
        <a href="/">返回文档首页</a>
        <a href="{raw_href}">查看原始 Markdown</a>
        <a href="{dir_href}">打开所在目录</a>
      </div>
    </section>
    <article class="doc">
      <div id="content" class="loading">正在加载文档预览...</div>
    </article>
  </div>
  <script src="/_assets/marked.min.js"></script>
  <script>
    (async function() {{
      const target = {raw_json};
      const el = document.getElementById('content');
      try {{
        const res = await fetch(target, {{ cache: 'no-store' }});
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const md = await res.text();
        marked.setOptions({{ gfm: true, breaks: false, headerIds: true, mangle: false }});
        el.className = '';
        el.innerHTML = marked.parse(md);
      }} catch (err) {{
        el.className = 'error';
        el.textContent = '文档预览加载失败：' + err.message;
      }}
    }})();
  </script>
</body>
</html>
'''

class DocsHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=str(DOCS_ROOT), **kwargs)

    def guess_type(self, path):
        _, ext = posixpath.splitext(path)
        ext = ext.lower()
        if ext == '.md':
            return 'text/plain; charset=utf-8' if self._is_raw_request() else 'text/html; charset=utf-8'
        if ext in {'.html', '.htm'}:
            return 'text/html; charset=utf-8'
        if ext == '.css':
            return 'text/css; charset=utf-8'
        if ext == '.js':
            return 'application/javascript; charset=utf-8'
        guess = super().guess_type(path)
        if guess.startswith('text/') and 'charset=' not in guess:
            return guess + '; charset=utf-8'
        return guess

    def do_GET(self):
        self._handle_request(send_body=True)

    def do_HEAD(self):
        self._handle_request(send_body=False)

    def _is_raw_request(self, query=None):
        if query is None:
            query = urllib.parse.urlsplit(self.path).query
        params = urllib.parse.parse_qs(query)
        return params.get('raw', ['0'])[0] in {'1', 'true', 'yes'}

    def _handle_request(self, send_body):
        parsed = urllib.parse.urlsplit(self.path)
        clean_path = parsed.path
        local_path = Path(self.translate_path(clean_path))
        if local_path.is_file() and local_path.suffix.lower() == '.md' and not self._is_raw_request(parsed.query):
            self._serve_markdown_preview(local_path, clean_path, send_body)
            return
        self.path = clean_path + (('?' + parsed.query) if parsed.query else '')
        if send_body:
            super().do_GET()
        else:
            super().do_HEAD()

    def _serve_markdown_preview(self, file_path: Path, request_path: str, send_body: bool):
        title = file_path.name
        raw_href = request_path + ('&' if '?' in request_path else '?') + 'raw=1'
        dir_href = posixpath.dirname(request_path.rstrip('/')) or '/'
        html_body = HTML_TEMPLATE.format(
            title=html.escape(title),
            path_label=html.escape(request_path.lstrip('/') or file_path.name),
            raw_href=html.escape(raw_href, quote=True),
            dir_href=html.escape(dir_href, quote=True),
            raw_json=repr(raw_href),
        ).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(html_body)))
        self.end_headers()
        if send_body:
            self.wfile.write(html_body)

    def list_directory(self, path):
        try:
            entries = sorted(os.listdir(path), key=str.lower)
        except OSError:
            self.send_error(404, 'No permission to list directory')
            return
        rel = os.path.relpath(path, str(DOCS_ROOT))
        rel_label = '.' if rel == '.' else rel
        rows = []
        current = Path(path).resolve()
        if current != DOCS_ROOT:
            parent = posixpath.dirname(self.path.rstrip('/')) or '/'
            rows.append(f'<a href="{html.escape(parent, quote=True)}">.. / 返回上级</a>')
        for name in entries:
            full = Path(path) / name
            display = name + ('/' if full.is_dir() else '')
            href = urllib.parse.quote(name)
            rows.append(f'<a href="{href}">{html.escape(display)}</a>')
        body = f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>目录浏览 - {html.escape(rel_label)}</title>
<style>
body{{margin:0;background:#f5f7fb;color:#1f2937;font-family:"PingFang SC","Microsoft YaHei",sans-serif}}
.wrap{{max-width:960px;margin:0 auto;padding:28px 20px 56px}}
.panel{{background:#fff;border:1px solid #dbe2ea;border-radius:20px;padding:22px 24px;box-shadow:0 10px 28px rgba(15,23,42,.06)}}
h1{{margin:0 0 8px}} p{{color:#667085}} .list a{{display:block;text-decoration:none;color:#1f2937;background:#fff;border:1px solid #dbe2ea;border-radius:12px;padding:12px 14px;margin:10px 0}}
.list a:hover{{background:#eef6ff;color:#155eef}}
</style></head><body><div class="wrap"><div class="panel"><h1>目录浏览</h1><p>{html.escape(rel_label)}</p><div class="list">{''.join(rows)}</div></div></div></body></html>'''
        encoded = body.encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(encoded)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(encoded)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 18086
    handler = partial(DocsHandler, directory=str(DOCS_ROOT))
    httpd = ThreadingHTTPServer(('0.0.0.0', port), handler)
    print(f'OpenClaw docs server listening on {port}, root={DOCS_ROOT}', flush=True)
    httpd.serve_forever()

if __name__ == '__main__':
    main()
