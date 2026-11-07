"""下载开源字库的数字子集，并保留原始授权文本。"""
from pathlib import Path
from urllib.request import Request, urlopen
from io import BytesIO
import re
from fontTools.ttLib import TTFont
from fontTools import subset

output = Path(__file__).resolve().parent.parent / 'public/fonts'
subset_chars = '0123456789+-=<>'
fonts = [
    ('andika', 'Andika', 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/andika/Andika-Regular.ttf', 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/andika/OFL.txt'),
    ('short-stack', 'Short Stack', None, 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/shortstack/OFL.txt'),
    ('noto-sans-sc', 'Noto Sans SC', None, 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt'),
    ('noto-serif-sc', 'Noto Serif SC', None, 'https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/OFL.txt'),
    ('lxgw-wenkai', 'LXGW WenKai', 'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/fonts/TTF/LXGWWenKai-Regular.ttf', 'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/OFL.txt'),
    ('yozai', 'Yozai', 'https://raw.githubusercontent.com/HuberttFox/kidsmath/main/src/mathgen/static/fonts/yozai-400.ttf', 'https://raw.githubusercontent.com/lxgw/yozai-font/master/OFL.txt'),
    ('fredoka', 'Fredoka', None, 'https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/OFL.txt'),
    ('codystar', 'Codystar', None, 'https://raw.githubusercontent.com/google/fonts/main/ofl/codystar/OFL.txt'),
]
for slug, family, direct_url, license_url in fonts:
    if direct_url:
        source_url = direct_url
    else:
        weight = '500' if slug == 'fredoka' else '400'
        css_url = f"https://fonts.googleapis.com/css2?family={family.replace(' ', '+')}:wght@{weight}&text=0123456789%2B-%3D%3C%3E&display=block"
        css = urlopen(Request(css_url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})).read().decode()
        source_url = re.search(r'url\(([^)]+)\)', css).group(1)
    font = TTFont(BytesIO(urlopen(source_url).read()))
    if slug == 'andika':
        # 启用少儿绘本与启蒙读物专用字形变体：无底座 1、开口 4、直柄 6 与 9
        for table in font['cmap'].tables:
            if table.isUnicode():
                table.cmap[ord('1')] = 'one.NoBase'
                table.cmap[ord('4')] = 'four.Open'
                table.cmap[ord('6')] = 'six.Diag'
                table.cmap[ord('9')] = 'nine.Diag'
    options = subset.Options()
    options.name_IDs = ['*']
    options.name_legacy = True
    options.name_languages = ['*']
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=subset_chars)
    subsetter.subset(font)
    font.flavor = 'woff2'
    destination = output / (slug + '-digits.woff2')
    font.save(destination)
    (output / (slug + '-OFL.txt')).write_bytes(urlopen(license_url).read())
    print(f'{family}：{destination.stat().st_size} 字节')
