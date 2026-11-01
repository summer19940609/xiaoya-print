# 小芽印坊

给孩子制作可打印、可裁剪的数字方格。纯 HTML、CSS、JavaScript，静态部署到 Cloudflare Pages。

## 使用

- 选择数字格子、描红格子或算术题卡。
- 支持 1–10、11–20、1–20，及每个数字 1、2、3 份。
- 自定义数字：选“自定义数字…”，用逗号或空格分隔，也可以写 `5-8` 这样的范围，例如 `1, 3, 5-8, 12`，最多 100 个，自动去重。
- 算术题卡：10 或 20 以内的加法、减法与加减混合，按格子数自动出题，同页尽量不重复；每题等号后留一条作答横线。
- 打乱顺序：随机排列每一页的格子，适合抽认和随堂练习。
- 空白书写格：在每个数字后加一格空格，先看数字再照着写。
- 中文数字：在数字下方标注“十一”这样的中文读法（0–99）。
- 数量提示：可选圆点或十宫格，直观表示 1–20 的数量；描红模式下变为空心，可以涂色。
- 复制设置链接：把当前版式存进网址，发给另一位家长或老师即可还原同样的练习纸。
- 支持 A4 四等分（2 列 × 2 行，每格 105 × 148.5 毫米）、八等分（2 列 × 4 行，每格 105 × 74.25 毫米），以及边长 4、5、6 厘米的正方形，自动分页。
- 打印纸固定只保留数字、题目和裁剪线，不含标题、标志、说明和页码。
- 默认黑白省墨，也可选择红、橙、黄、绿、青、蓝、紫七色循环。
- 点击打印预览右上角的“打印练习纸”，可以发送到打印机或在浏览器窗口中另存为 PDF。

打印时选择 A4、纵向、100% 实际大小，关闭浏览器页眉页脚，避免选择“适合页面”。沿虚线裁剪。实体尺寸取决于打印窗口是否使用 100% 缩放。

## 数字字体

使用成熟开源字体，内置 0–9 的 WOFF2 子集，手机和电脑无需安装字体，也无需连接外部字体服务：

- 默认思源黑体数字（Noto Sans SC）：清晰印刷字形。
- 霞鹜文楷数字（LXGW WenKai）：自然书写字形。
- 思源宋体数字（Noto Serif SC）：衬线印刷字形。

以上不是人教社原版字库，不使用“人教版字体”名称。中文教材的汉字用字规范与阿拉伯数字字形是不同问题，不能把中文字体符合规范等同于它的数字就是教材原版。

同类项目参考：[口算生成器源码使用宋体](https://github.com/hldgaofeng/oralcalc/blob/master/index.js)、[字帖生成器内置霞鹜文楷](https://github.com/bmalob/zitie#字体)。

字体来源与许可：

- [Noto Sans SC 官方仓库](https://github.com/google/fonts/tree/main/ofl/notosanssc)。
- [Noto Serif SC 官方仓库](https://github.com/google/fonts/tree/main/ofl/notoserifsc)。
- [霞鹜文楷官方仓库](https://github.com/lxgw/LxgwWenKai)。

三款字体均保留原始 SIL OFL 授权，文件位于 `public/fonts/*-OFL.txt`，授权文件保留原文。字体未重画字形，仅提取数字并转为网页字体。重建脚本为 `scripts/build-digits.py`，仅重建时需要 Python 的 fonttools、brotli 与网络；运行网站无需这些依赖。

## 本地运行

需要 Python 3：

```sh
npm run dev
```

打开 http://localhost:4173。

## 部署到 Cloudflare Pages

项目名：`xiaoya-print`。静态发布目录：`public`，无构建步骤。

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

也可以通过 Cloudflare 控制台选择 Pages 直接上传，上传 `public` 文件夹。部署依据：[Cloudflare Pages 直接上传文档](https://developers.cloudflare.com/pages/get-started/direct-upload/)。

## 数据

页面无需登录，没有后端或数据上传。所有版式设置只影响当前页面。
