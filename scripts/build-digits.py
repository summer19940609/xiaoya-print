"""下载开源字库的数字子集，并保留原始授权文本。"""
from pathlib import Path
from urllib.request import Request, urlopen
from io import BytesIO
import re
from fontTools.ttLib import TTFont
from fontTools import subset

output = Path(__file__).resolve().parent.parent / 'public/fonts'
fonts = [
    ('noto-sans-sc', 'Noto Sans SC', 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt'),
    ('noto-serif-sc', 'Noto Serif SC', 'https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/OFL.txt'),
    ('lxgw-wenkai', 'LXGW WenKai', 'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/OFL.txt'),
]
for slug, family, license_url in fonts:
    if slug == 'lxgw-wenkai':
        source_url = 'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/fonts/TTF/LXGWWenKai-Regular.ttf'
    else:
        css_url = 'https://fonts.googleapis.com/css2?family=' + family.replace(' ', '+') + ':wght@400&text=0123456789&display=block'
        css = urlopen(Request(css_url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode()
        source_url = re.search(r'url\(([^)]+)\)', css).group(1)
    font = TTFont(BytesIO(urlopen(source_url).read()))
    options = subset.Options()
    options.name_IDs = ['*']
    options.name_legacy = True
    options.name_languages = ['*']
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text='0123456789')
    subsetter.subset(font)
    font.flavor = 'woff2'
    destination = output / (slug + '-digits.woff2')
    font.save(destination)
    (output / (slug + '-OFL.txt')).write_bytes(urlopen(license_url).read())
    print(f'{family}：{destination.stat().st_size} 字节')
