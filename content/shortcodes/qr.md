+++
title = "qr"
linkTitle = "qr"
description = "用 qr 短代码把文本编码为二维码图片并插入正文：参数表、可复制的调用、实测生成的文件名与 img 输出、参数校验报错。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/shortcodes/qr/"

[params.teach]
difficulty = "入门"
time = "10 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0），Hugo 版本为 0.141.0 或更高。",
  "知道构建产物写在 `publishDir`（默认 `public/`），能在里面找文件。",
]
outcomes = [
  "写出把网址、电话或 vCard 变成二维码的调用，并在产物里找到生成的 PNG 文件；",
  "说清 `scale` 与 `level` 各自影响什么，以及它们的合法取值；",
  "在 `public/` 里核对 `img` 的 `src`、`width`、`height` 与透传属性。",
]
next = ["/shortcodes/instagram/", "/functions/images/qr/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `qr` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

## 这一页解决什么问题

把一段文本变成手机能扫的二维码，通常要依赖外部服务（在线生成器、第三方 API）或前端 JavaScript。`qr` 短代码在**构建时**用 Hugo 自带的编码器把文本生成 PNG，产物直接写进发布目录，页面上只是一个平平无奇的 `img` 元素——**离线可用、不依赖第三方、不需要 JavaScript**。

`qr` 短代码按指定选项把给定的文本编码为[二维码][]，并渲染出对应的图片。自 Hugo 0.141.0 起可用。生成的图片会写入发布目录（`publishDir`）下的子目录，正文中得到的是一个引用该图片的 `img` 元素，因此二维码可以用于网址、电话号码或名片等需要被手机扫描的场景。

短代码在内部调用 `images.QR` 函数，涉及图片资源的生成规则与处理方式可参阅[图像处理](/content-management/image-processing/)。

## 示例

用自闭合写法把文本作为参数传入：

```md
{{</* qr text="https://gohugo.io" /*/>}}
```

也可以把文本写在开闭标记之间（这种写法要用成对定界符，不能用自闭合）：

```md
{{</* qr */>}}
https://gohugo.io
{{</* /qr */>}}
```

两种写法生成的二维码内容相同。

为电话号码生成二维码：

```md
{{</* qr text="tel:+12065550101" /*/>}}
```

下面的例子用较低的纠错级别、较大的模块尺寸，为 [vCard][] 格式的联系人信息生成二维码：

```md
{{</* qr level="low" scale=2 alt="QR code of vCard for John Smith" */>}}
BEGIN:VCARD
VERSION:2.1
N;CHARSET=UTF-8:Smith;John;R.;Dr.;PhD
FN;CHARSET=UTF-8:Dr. John R. Smith, PhD.
ORG;CHARSET=UTF-8:ABC Widgets
TITLE;CHARSET=UTF-8:Vice President Engineering
TEL;TYPE=WORK:+12065550101
EMAIL;TYPE=WORK:jsmith@example.org
END:VCARD
{{</* /qr */>}}
```

### 实测：生成的图片与 HTML

以 `{{</* qr text="https://gohugo.io" /*/>}}` 为例（Hugo 0.167）：

产物里多出一个 PNG 文件，文件名带 Hugo 计算的哈希：

```text
public/qr_924bf7d80a564b23.png
```

页面里则是一个指向该文件的 `img`：

```html
<img src="/qr_924bf7d80a564b23.png" width="132" height="132">
```

加了 `targetDir="qr"` 后文件会落到子目录里：

```text
public/qr/qr_58718d1d271e3984.png
```

```html
<img src="/qr/qr_58718d1d271e3984.png" width="66" height="66" alt="QR code alt" class="qr-class" id="qr-id" title="qr title" loading="lazy">
```

两点要记住：

- **`src` 里的哈希由 Hugo 生成**，不要手写、也不要指望它在改动文本后保持稳定；
- `width` / `height` 是**图片真实的像素边长**，随内容长度与 `scale` 一起变化（上例分别是 132×132 与 66×66），不是你可以随便指定的值。

### 本站实际渲染效果

下面三个二维码都是本站**构建时**由 `qr` 短代码生成的 PNG（文件名里的哈希由 Hugo 按内容算出，与你自己站点上的不会相同）：

{{< demo label="只给 text：默认纠错级别与模块尺寸" >}}
{{< qr text="https://hugozh.cn/shortcodes/" alt="本站短代码章节的二维码" />}}
{{< /demo >}}

{{< demo label="text、level 与 scale：纠错级别更高、模块更大" >}}
{{< qr text="https://hugozh.cn/shortcodes/qr/" level="high" scale=6 alt="qr 一页的二维码" />}}
{{< /demo >}}

{{< demo label="电话号码" >}}
{{< qr text="tel:+8613800138000" scale=5 alt="电话号码的二维码" />}}
{{< /demo >}}

**你可以自己验证**：用手机相机扫第一个，应当打开本站的短代码总览页；扫第三个，手机会问你要不要拨号。构建产物里则同时多出三个 `qr_<哈希>.png` 文件——它们和页面上的 `img` 是同一份内容，所以**断网也能扫**，这与「调用某个在线二维码 API」有本质区别。

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | 要编码的文本；未提供时取开闭标记之间的文本。 |
| `level` | `string` | 编码文本时使用的纠错级别，取值为 `low`、`medium`、`quartile` 或 `high` 之一。默认值为 `medium`。 |
| `scale` | `int` | 每个二维码模块对应的图片像素数。必须大于或等于 2。默认值为 `4`。 |
| `targetDir` | `string` | 发布目录（`publishDir`）下用于存放所生成图片的子目录。 |
| `alt` | `string` | `img` 元素的 `alt` 属性。 |
| `class` | `string` | `img` 元素的 `class` 属性。 |
| `id` | `string` | `img` 元素的 `id` 属性。 |
| `loading` | `string` | `img` 元素的 `loading` 属性，取值为 `eager` 或 `lazy`。 |
| `title` | `string` | `img` 元素的 `title` 属性。 |

纠错级别越高，二维码在被遮挡或污损时越容易被识别，但同样内容所需的模块也越多。`scale` 控制最终图片的边长，数值越大图片越清晰，文件也越大。

**实测（Hugo 0.167）——参数写错时会直接报错，而不是静默降级**：

| 调用 | 构建结果 |
| --- | --- |
| `scale=1` | `ERROR The "scale" argument passed to the "qr" shortcode must be an integer greater than or equal to 2.` |
| `level="bogus"` | `ERROR The "level" argument passed to the "qr" shortcode must be one of low, medium, quartile, or high.` |
| 自闭合但没给 `text`（`{{</* qr /*/>}}`） | `ERROR The "qr" shortcode requires a "text" argument.` |
| 只给位置参数（`{{</* qr "https://example.org" /*/>}}`） | 同上：`requires a "text" argument`——**文本必须用 `text=` 命名参数**，或写成开闭标记之间的内容 |

三条报错都带 `文件:行:列`。这是本页最值得记住的一点：`qr` 的参数错误**会让构建失败**，不会给你一张奇怪的图片。

## 什么时候用，什么时候别用

**该用**：

- 正文里给出网址、电话、vCard 联系人，方便手机直接扫；
- 希望二维码**离线生成**，不依赖第三方服务、不需要 JavaScript；
- 想把二维码当作普通图片参与构建（可以放进页面包、被 CDN 缓存）。

**别用**：

- 需要**动态**内容（按访问者实时生成）→ 短代码在构建时定型，做不到实时；
- 需要自定义配色、嵌入 Logo、圆点样式 → `images.QR` 只生成标准黑白二维码，这类外观要自己后处理；
- 只是把二维码当作**图片**使用（已有现成 PNG）→ 直接用 Markdown 图片或 [figure](/shortcodes/figure/)；
- 内容不需要给机器读 → 别为了装饰放二维码。

## 验证方法

1. 在内容里写一次调用：

   ```md {file="content/example.md"}
   {{</* qr text="https://example.org" targetDir="images/qr" alt="示例站点二维码" /*/>}}
   ```

2. 构建：

   ```bash
   hugo
   ```

3. 到产物里找两样东西：

   ```bash
   ls public/images/qr/          # 生成的 PNG
   ```

   再打开 `public/example/index.html`，搜索 `images/qr`。

**你应当看到什么**：

- `public/images/qr/` 下出现一个 `qr_<哈希>.png`；
- 页面里出现 `<img src="/images/qr/qr_<哈希>.png" width="…" height="…" alt="示例站点二维码">`。

用手机扫一下产物里的那张 PNG，应当打开 `https://example.org`——这是最直接的端到端验证。

- 图片没生成 → 看构建日志里有没有上面那三条 `ERROR`；
- `img` 有、文件没有 → 检查 `targetDir` 与 `publishDir` 的相对关系，文件在 `public/<targetDir>/` 下；
- 扫出来是乱码 → `text` 里混入了换行或前后空格（用成对写法时尤其常见，内容会包含首尾换行）。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `must be an integer greater than or equal to 2` | `scale` 写了 `1` 或非整数 | 改成 `2` 及以上的整数；默认值是 `4` |
| 报错看不懂 | `must be one of low, medium, quartile, or high` | `level` 拼错（如 `mid`、`medium-high`） | 用四个合法取值之一 |
| 报错看不懂 | `requires a "text" argument` | 自闭合写法没写 `text=`，或用了位置参数 | 写 `text="…"`，或改成开闭标记之间写内容 |
| 报错看不懂 | 报错指向别的页面 | 短代码占位符相关错误常被归因到其它页面 | 用 `hugo --ignoreCache` 复现 |
| 没报错但结果不对 | 页面上的二维码扫不出正确内容 | 成对写法时开闭标记之间多了空行/缩进 | `text=` 写法最稳；用成对写法时让内容紧贴标记 |
| 没报错但结果不对 | 换了文本但图片没变 | 浏览器或 CDN 缓存了旧文件名；或本地看了旧的 `public/` | 重新构建（`hugo --ignoreCache`），强制刷新 |
| 没报错但结果不对 | 重新构建后图片路径变了，外链失效 | 路径里的哈希由 Hugo 生成，不保证稳定 | 不要手写或对外承诺该路径；需要稳定路径时自己在模板层处理 |

更多排查入口见[故障排查](/troubleshooting/)。

[二维码]: https://en.wikipedia.org/wiki/QR_code
[vCard]: https://en.wikipedia.org/wiki/VCard
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/qr.html
