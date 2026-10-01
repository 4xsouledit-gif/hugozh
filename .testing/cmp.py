from PIL import Image, ImageChops
import os
d = os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else os.getcwd()
a = Image.open('official-badge.png').convert('RGBA')
b = Image.open('our-mark.png').convert('RGBA')
print('官方徽标尺寸', a.size, ' 本站标记尺寸', b.size)
B = (512, a.size[1])
a = a.resize(B, Image.LANCZOS); b = b.resize(B, Image.LANCZOS)
# 对齐：把两者裁到各自可见内容的外接框后比较
def bbox(im):
    return im.split()[3].getbbox()
print('官方内容框', bbox(a), ' 本站内容框', bbox(b))
diff = ImageChops.difference(a.convert('RGB'), b.convert('RGB'))
px = list(diff.getdata())
mean = sum(sum(p) for p in px) / (len(px) * 3)
mx = max(max(p) for p in px)
print(f'平均通道差 {mean:.2f}/255   最大通道差 {mx}')
# 并排图：左官方、右本站、中间留白
w, h = a.size
comp = Image.new('RGB', (w * 2 + 40, h), (255, 255, 255))
comp.paste(a.convert('RGB'), (0, 0)); comp.paste(b.convert('RGB'), (w + 40, 0))
comp.save('logo-side-by-side.png')
print('已输出 logo-side-by-side.png（左=官方提取区，右=本站 favicon）')
