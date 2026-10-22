"""Run after npm run build. Embed local assets; preserve original online Alkan media."""
from pathlib import Path
import base64, mimetypes, re, zipfile
root=Path('dist')
def data(path):
 return 'data:'+(mimetypes.guess_type(path.name)[0] or 'application/octet-stream')+';base64,'+base64.b64encode(path.read_bytes()).decode()
html=(root/'index.html').read_text()
cssfile=next((root/'assets').glob('index-*.css'))
def font(match):
 value=match.group(1).strip('\"\'')
 path=root/value.lstrip('/') if value.startswith('/') else cssfile.parent/value
 return 'url("'+data(path)+'")' if path.exists() else match.group(0)
css=re.sub(r'url\(([^)]+)\)',font,cssfile.read_text())
js=next((root/'assets').glob('index-*.js')).read_text()
for path in (root/'assets/site').glob('*'):
 embedded=data(path)
 js=js.replace('/assets/site/'+path.name,embedded)
 html=html.replace('/assets/site/'+path.name,embedded)
html=re.sub(r'<script type="module"[^>]*src="[^"]+"[^>]*></script>','',html)
html=re.sub(r'<link rel="stylesheet"[^>]*href="[^"]+"[^>]*>',lambda match:'<style>'+css+'</style>',html)
html=html.replace('</body>','<script type="module">'+js.replace('</script','<\\/script')+'</script></body>')
folder=Path('deliverables');folder.mkdir(exist_ok=True)
file=folder/'Alkan-Business-Consult.html';file.write_text(html)
archive=file.with_suffix('.zip')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as zipped:
 zipped.write(file,arcname=file.name)
 zipped.writestr('READ-ME.txt','Open Alkan-Business-Consult.html in a modern browser.\n\nThe core website, fonts, original logo fallback and book images are embedded.\nThe original introduction video and gallery photos/videos stream unchanged from alkanbiz.com and REQUIRE INTERNET ACCESS and source-host availability. They are not included offline in this ZIP.\n\nWhatsApp/email checkout prepares an order for you to review and send. Alkan confirms pricing, availability, payment and digital/physical fulfilment.\n')
encoded=base64.b64encode(archive.read_bytes()).decode()
size=f'{archive.stat().st_size/1024/1024:.1f} MB'
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Download Alkan website</title><style>body{margin:0;background:#f7f7ef;color:#223c32;font:16px/1.7 Arial,sans-serif;display:grid;place-items:center;min-height:100vh}main{max-width:540px;padding:35px}h1{line-height:1.2}button{background:#223c32;color:white;border:0;padding:17px 25px;font-size:16px;border-radius:5px;cursor:pointer}a{color:#223c32}small{display:block;margin-top:20px}</style><main><a href="./">← Back to website</a><h1>Your Alkan website,<br>ready to take with you.</h1><p>The ZIP contains the HTML website with fonts, book covers and an original logo fallback embedded.</p><p><strong>Internet access is required for the original intro video and gallery media, which stream from alkanbiz.com.</strong></p><button id="download">Download website ZIP (SIZE)</button><p id="status" role="status"></p><small>Extract the ZIP and open <b>Alkan-Business-Consult.html</b> in your browser. Read the included READ-ME.txt for details.</small></main><script>const encoded="ENCODED";document.getElementById('download').onclick=()=>{const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'application/zip'}));const a=document.createElement('a');a.href=url;a.download='Alkan-Business-Consult.zip';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);document.getElementById('status').textContent='Download requested. Check your browser’s downloads.';};</script></html>'''.replace('ENCODED',encoded).replace('SIZE',size)
for folder in [Path('public'),root]:
 (folder/'download.html').write_text(page)
 (folder/'downloads').mkdir(exist_ok=True)
 (folder/'downloads'/archive.name).write_bytes(archive.read_bytes())
print(f'Updated HTML, ZIP ({size}), and authenticated preview download page.')
