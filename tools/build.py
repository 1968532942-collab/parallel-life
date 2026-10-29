"""把多文件项目打包成一个可直接分享/双击打开的单文件 HTML（dist/index.html）。
用法：python3 tools/build.py
"""
import os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
src = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()

def css(m):
    return '<style>\n' + open(os.path.join(ROOT, m.group(1)), encoding='utf-8').read() + '\n</style>'
def js(m):
    code = open(os.path.join(ROOT, m.group(1)), encoding='utf-8').read().replace('</script', '<\\/script')
    return '<script>\n' + code + '\n</script>'

out = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, src)
out = re.sub(r'<script src="([^"]+)"></script>', js, out)
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
dst = os.path.join(ROOT, 'dist', 'index.html')
open(dst, 'w', encoding='utf-8').write(out)
import shutil
for d in ('music', 'art'):
    if os.path.isdir(os.path.join(ROOT, d)):
        shutil.copytree(os.path.join(ROOT, d), os.path.join(ROOT, 'dist', d), dirs_exist_ok=True)
print('built', dst, round(len(out.encode()) / 1024), 'KB（插画在 dist/art/，配乐在 dist/music/，需与 index.html 放在一起）')
