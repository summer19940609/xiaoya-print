# 小芽印坊

给孩子制作可打印、可裁剪的数字方格和数学题卡。基于 React、Tailwind CSS 和 Vite，构建后静态部署到 Cloudflare Pages。

## 使用

- 选择数字格子、描红格子或算术题卡。
- 支持 0–10、1–10、11–20、1–20、1–50、1–100（百数格），及每个数字 1、2、3 份。
- 自定义数字：选“自定义数字…”，用逗号或空格分隔，也可以写 `5-8` 这样的范围，例如 `1, 3, 5-8, 12`，最多 100 个，自动去重。
- 题卡：支持 10 或 20 以内的加法、减法、加减混合、算式填空、数的分与合、比大小、数列填空、相邻数和看图点数，按格子数自动出题；计算题在等号后留作答横线，启蒙与填空题留方格作答。
- 打乱顺序：随机排列每一页的格子，适合抽认和随堂练习。
- 空白书写格：在每个数字后加一格空格，先看数字再照着写。
- 中文数字与单双数：在数字下方标注“十一”这样的中文读法（0–99）或“单数 / 双数”奇偶概念。
- 田字辅助线：在数字格、描红格和空白书写格中显示十字虚线，帮助把握数字占格比例。
- 数量提示：可选圆点、十宫格、计数小棒（每 5 根一组）或数位积木（十位长条与个位方块），直观表示 1–20 的数量与十进位概念；描红模式下变为空心，可以涂色。
- 复制设置链接：把当前版式存进网址，发给另一位家长或老师即可还原同样的练习纸。
- 支持 A4 四等分（2 列 × 2 行，每格 105 × 148.5 毫米）、八等分（2 列 × 4 行，每格 105 × 74.25 毫米，支持数字纵横设置：可选择字随长边旋转 90° 裁剪为 74 × 105 毫米竖版卡片，或正常直立），以及边长 4、5、6 厘米的正方形，自动分页。
- 打印纸只保留数字、题目、必要的作答提示和裁剪线，不含页面标题、标志和页码。
- 默认黑白省墨，也可选择红、橙、黄、绿、青、蓝、紫七色循环。
- 点击打印预览右上角的“打印练习纸”，可以发送到打印机或在浏览器窗口中另存为 PDF。

打印时选择 A4、纵向、100% 实际大小，关闭浏览器页眉页脚，避免选择“适合页面”。沿虚线裁剪。实体尺寸取决于打印窗口是否使用 100% 缩放。

## 数字字体与字形设置

使用成熟开源字体，内置 `0–9` 与 `+ - = < >` 算术符号的 WOFF2 子集，手机和电脑无需安装字体，也无需连接外部字体服务：

- 默认绘本印刷体（Andika 少儿读物专用变体）：无底座横线的 `1`、顶部开口的 `4`、直斜柄 `6/9`，贴合引进绘本与少儿读物印刷规范。
- 思源黑体（Noto Sans SC）：清晰无衬线印刷字形。
- 绘本童书体（Short Stack）：单竖无钩无底座的 `1`（“1像铅笔”）、顶部开口的 `4`，圆润童书手写风格。
- 幼教铅笔体（Xiaoya Digits）：斜单竖 `1`、开口 `4`、直柄 `6/9`，对照幼儿园田字格运笔示范。
- 启蒙圆体（Fredoka）：圆头圆尾饱满字形，适合低龄宝宝认数闪卡。
- 霞鹜文楷（LXGW WenKai）：自然楷书书写字形。
- 悠哉手写（Yozai Font）：圆润铅笔手写字形。
- 思源宋体（Noto Serif SC）：传统衬线印刷字形。
- 点阵虚线（Codystar）：均匀圆点虚线字形，适合幼儿连点控笔描红。
- 导入本地字体：支持直接选择电脑或手机上的 `.ttf` / `.otf` / `.woff` / `.woff2` 字体文件（如田英章楷书、庞中华、幼圆等），浏览器本地即时加载并用于打印，不上传服务器。

同时提供贴合字帖与数学启蒙习惯的字形调节项：

- 字号大小（占格比例）：支持紧凑留白（84%）、标准适中（100%）、饱满大字（114%）。
- 笔画粗细：支持标准笔画与加粗醒目。
- 描红样式与深浅（描红格子模式）：支持空心双线、浅灰实心（单线范字，避免描双边）、点阵虚线三种描红方式，以及浅淡省墨、适中清晰、加深醒目三档打印灰度。

以上不是人教社原版字库，不使用“人教版字体”名称。中文教材的汉字用字规范与阿拉伯数字字形是不同问题，不能把中文字体符合规范等同于它的数字就是教材原版。

同类项目参考：[kidsmath 使用悠哉圆体与思源黑体](https://github.com/HuberttFox/kidsmath)、[字帖生成器内置霞鹜文楷与字占格比例](https://github.com/bmalob/zitie#字体)、[calligraphy-sheet-generator 支持本地字体上传与描红深浅调节](https://github.com/lcfactorization/calligraphy-sheet-generator)。

字体来源与许可：

- [Noto Sans SC 官方仓库](https://github.com/google/fonts/tree/main/ofl/notosanssc)。
- [Andika 官方仓库](https://github.com/google/fonts/tree/main/ofl/andika)。
- [Short Stack 官方仓库](https://github.com/google/fonts/tree/main/ofl/shortstack)。
- [Noto Serif SC 官方仓库](https://github.com/google/fonts/tree/main/ofl/notoserifsc)。
- [霞鹜文楷官方仓库](https://github.com/lxgw/LxgwWenKai)。
- [悠哉字体官方仓库](https://github.com/lxgw/yozai-font)。
- [Fredoka 官方仓库](https://github.com/google/fonts/tree/main/ofl/fredoka)。
- [Codystar 官方仓库](https://github.com/google/fonts/tree/main/ofl/codystar)。

内置开源字体均保留原始 SIL OFL 授权，文件位于 `public/fonts/*-OFL.txt`，授权文件保留原文。重建脚本为 `scripts/build-digits.py`，仅重建时需要 Python 的 fonttools、brotli 与网络；运行网站无需这些依赖。
## 本地运行

需要 Node.js 22.12 或更新版本；项目在 `.node-version` 中固定了 Node.js 22.16.0，供 Cloudflare Pages 构建使用：

```sh
npm install
npm run dev
```

运行 `npm run build` 构建生产版本，`npm run preview` 可预览构建结果，`npm test` 运行单元测试。

打开 http://localhost:4173。

## 部署到 Cloudflare Pages

项目名：`xiaoya-print`。Git 自动部署时，在 Cloudflare Pages 项目设置中填写构建命令 `npm run build`；发布目录为 `dist`，由 `wrangler.jsonc` 指定。构建环境通过 `.node-version` 使用 Node.js 22.16.0。`public` 中的字体、图标和 `_headers` 会自动复制到 `dist`。

首次在新电脑上部署：

```sh
npm install
npx wrangler login
npm run deploy
```

当前 Cloudflare 账号中已创建同名 Pages 项目，后续直接运行 `npm run deploy` 更新。

如果换用其他账号，需要先创建项目。当前 Wrangler 首次创建时使用以下命令可直接创建 Pages 项目，跳过向 Workers 的自动转向；项目创建后，后续部署不需要 `--force`：

```sh
npx wrangler pages project create xiaoya-print --production-branch main --force
```

也可以先运行 `npm run build`，再通过 Cloudflare 控制台选择 Pages 直接上传 `dist` 文件夹。部署依据：[Cloudflare Pages 直接上传文档](https://developers.cloudflare.com/pages/get-started/direct-upload/)。

## 数据

页面无需登录，没有后端或数据上传。所有版式设置只影响当前页面。
