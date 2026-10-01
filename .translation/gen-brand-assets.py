# 生成站点图标与社交分享图（纯 Pillow，无外部依赖）。
# 徽标用矩形/线条拼出「中」，不依赖字体；只有文字部分需要系统中文字体。
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC = os.path.join(ROOT, 'hugo-docs-zh', 'static')
IMAGES = os.path.join(STATIC, 'images')
os.makedirs(IMAGES, exist_ok=True)

PINK = (255, 64, 136)
DARK = (201, 23, 126)
BG = (255, 255, 255)
INK = (20, 22, 26)
SOFT = (90, 96, 106)


def gradient(size):
    w, h = size
    img = Image.new('RGB', (w, h))
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = (x / max(1, w - 1) + y / max(1, h - 1)) / 2
            px[x, y] = tuple(int(PINK[i] + (DARK[i] - PINK[i]) * t) for i in range(3))
    return img


def draw_mark(size, radius_ratio=0.22, stroke_ratio=0.062):
    """圆角方块 + 「中」：与 favicon.svg 同一造型。"""
    scale = 4  # 超采样后缩小，边缘更干净
    S = size * scale
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    grad = gradient((S, S)).convert('RGBA')

    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * radius_ratio), fill=255)
    img.paste(grad, (0, 0), mask)

    d = ImageDraw.Draw(img)
    w = int(S * stroke_ratio)
    box = [int(S * 0.335), int(S * 0.352), int(S * 0.665), int(S * 0.648)]
    d.rectangle(box, outline=(255, 255, 255, 255), width=w)
    d.line([(S // 2, int(S * 0.21)), (S // 2, int(S * 0.79))], fill=(255, 255, 255, 255), width=w)
    return img.resize((size, size), Image.LANCZOS)


def font(size, bold=False):
    candidates = [
        r'C:\Windows\Fonts\msyhbd.ttc' if bold else r'C:\Windows\Fonts\msyh.ttc',
        r'C:\Windows\Fonts\msyh.ttc',
        r'C:\Windows\Fonts\simhei.ttf',
        r'C:\Windows\Fonts\simsun.ttc',
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


# 1) apple-touch-icon.png 180×180
draw_mark(180).convert('RGB').save(os.path.join(STATIC, 'apple-touch-icon.png'))

# 2) 站点小图标 PNG（部分平台/旧浏览器用）
draw_mark(64).convert('RGB').save(os.path.join(IMAGES, 'icon-64.png'))

# 3) 社交分享图 og-image.png 1200×630
W, H = 1200, 630
og = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(og)
d.rectangle([0, 0, W, 10], fill=PINK)
mark = draw_mark(140)
og.paste(mark, (86, 96), mark)
d.text((258, 106), 'Hugo 中文文档', font=font(64, bold=True), fill=INK)
d.text((260, 186), 'hugozh.cn', font=font(34), fill=PINK)
d.text((86, 300), 'Hugo 官方文档简体中文翻译', font=font(44, bold=True), fill=INK)
d.text((86, 372), '19 个一级章节 · 948 个文件 · 函数与方法参考、术语表全覆盖', font=font(28), fill=SOFT)
d.text((86, 424), '附英文原文链接，便于对照核实', font=font(28), fill=SOFT)
d.rectangle([86, 500, 1114, 502], fill=(228, 232, 236))
d.text((86, 528), '社区维护 · 非官方翻译 · 以官方英文原文为准', font=font(26), fill=SOFT)
og.save(os.path.join(IMAGES, 'og-image.png'))

print('已生成：static/apple-touch-icon.png、static/images/icon-64.png、static/images/og-image.png')
