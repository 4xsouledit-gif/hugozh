from PIL import Image
import glob, os
for f in sorted(glob.glob('hugo-docs-zh/assets/brand/hex-*.png')):
    im = Image.open(f).convert('RGBA'); bb = im.split()[3].getbbox()
    print(f'  {os.path.basename(f):12} {im.size}  内容框 {bb}  四周透明边 {bb[0]},{bb[1]},{im.size[0]-bb[2]},{im.size[1]-bb[3]}')
