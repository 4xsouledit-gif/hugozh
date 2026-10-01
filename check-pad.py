from PIL import Image
for f in ['hugo-docs-zh/static/apple-touch-icon.png', 'hugo-docs-zh/static/images/icon-64.png', 'hugo-docs-zh/static/images/icon-512.png']:
    im = Image.open(f).convert('RGBA'); bb = im.split()[3].getbbox(); w, h = im.size
    l, t, r, b = bb
    print(f'{f.split("/")[-1]:22} canvas {w}x{h}  margins L{l} R{w-r} T{t} B{h-b}   (L-R diff {abs(l-(w-r))}, T-B diff {abs(t-(h-b))})')
