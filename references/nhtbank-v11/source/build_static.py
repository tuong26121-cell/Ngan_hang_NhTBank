"""Build the offline NhTBank demo and its single-file HTML distribution."""
import base64
from pathlib import Path
ROOT = Path(__file__).resolve().parent
SCRIPTS = ('vendor/qrcode.js', 'vendor/jsqr.js', 'bank-model.js', 'app.js')
FONTS = ('fonts/BeVietnamPro-Regular.ttf', 'fonts/BeVietnamPro-SemiBold.ttf', 'fonts/BeVietnamPro-Bold.ttf')
FILES = ('index.html', 'styles.css') + SCRIPTS + FONTS + ('fonts/OFL.txt', 'vendor/qrcode-LICENSE', 'vendor/jsqr-LICENSE')

def build(output=None):
    output = Path(output) if output is not None else ROOT / 'dist'
    output.mkdir(parents=True, exist_ok=True)
    for old in ('sandbox.js','sandbox-model.js'):
        (output / old).unlink(missing_ok=True)
    for name in FILES:
        target = output / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((ROOT / name).read_bytes())
    css = '/* Be Vietnam Pro: '+(ROOT/'fonts/OFL.txt').read_text().replace('*/','* /')+' */\n'+(ROOT / 'styles.css').read_text()
    for name in FONTS:
        css = css.replace(name, 'data:font/ttf;base64,' + base64.b64encode((ROOT / name).read_bytes()).decode())
    standalone = (ROOT / 'index.html').read_text().replace('<link rel="stylesheet" href="styles.css">', '<style>' + css + '</style>')
    for name in SCRIPTS:
        script = (ROOT / name).read_text()
        license_name = {'vendor/qrcode.js':'vendor/qrcode-LICENSE','vendor/jsqr.js':'vendor/jsqr-LICENSE'}.get(name)
        if license_name:
            script = '/* '+(ROOT/license_name).read_text().replace('*/','* /')+' */\n'+script
        script = script.replace('</script', r'<\/script')
        standalone = standalone.replace(f'<script src="{name}" defer></script>', '')
        standalone = standalone.replace('</body>', '<script>' + script + '</script></body>')
    (output / 'NhTBank.html').write_text(standalone)
    return output

if __name__ == '__main__':
    print(build())
