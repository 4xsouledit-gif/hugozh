from PIL import Image
import os
for f in ['hugo-docs-zh/static/apple-touch-icon.png', 'hugo-docs-zh/static/images/icon-64.png']:
    im = Image.open(f).convert('RGBA')
    bb = im.split()[3].getbbox()          # 非透明内容的外接框
    w, h = im.size
    l, t, r, b = bb
    print(f'{os.path.basename(f)}: 画布 {w}x{h}  内容框 {bb}')
    print(f'   左{l} 右{w-r} 上{t} 下{h-b}   左右差 {abs(l-(w-r))}  上下差 {abs(t-(h-b))}')
