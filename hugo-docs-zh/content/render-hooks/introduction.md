+++
title = "简介"
linkTitle = "简介"
description = "渲染钩子的共同机制：模板放在哪里、怎么命名、Hugo 按什么顺序查找、钩子输出什么，以及配错时的典型报错。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/render-hooks/introduction/"

[params.teach]
difficulty = "进阶"
time = "15–25 分钟"
prereq = [
  "能运行 `hugo server` 并看到自己的站点，知道项目根目录在哪里。",
  "知道 `layouts/` 是放模板的目录；读过[目录结构](/getting-started/directory-structure/)会更容易理解本章。",
  "会做「在浏览器里查看网页源代码」这个操作——验证钩子是否生效靠的就是它。",
]
outcomes = [
  "说清渲染钩子（render hook）与短代码（shortcode）的分工，知道什么需求该用哪一类；",
  "把钩子模板放到正确位置，并按 `render-<元素>[-<限定>][.<输出格式>].<后缀>` 的规则命名；",
  "判断某个元素当前走的是 Hugo 默认渲染、主题提供的钩子，还是你自己写的钩子；",
  "分清钩子输出的三种值类型，知道什么时候必须补 `safeURL` 或 `safeHTMLAttr`；",
  "遇到「钩子明明写了却没生效」时，按报错或现象在两分钟内定位原因。",
]
next = ["/render-hooks/links/", "/render-hooks/code-blocks/", "/troubleshooting/"]

+++

这一页解决的是「知道有渲染钩子这个功能，却不知道它到底在哪里生效」的问题。渲染钩子（render hook）的模板只有一个存放位置、一套命名规则；把这两件事做对，后面每个元素类型无非是换个字段名而已。**本章最容易配错的也正是这两件事**，所以配置位置、命名规则、输出值类型与典型报错集中在本页讲清，后面各页不再重复。

## 默认渲染与自定义渲染

把 Markdown 渲染为 HTML 时，渲染钩子会覆盖这一转换过程。每个钩子都是一个模板，受支持的元素类型各对应一个模板：

- [引用块](/render-hooks/blockquotes/)
- [代码块](/render-hooks/code-blocks/)
- [标题](/render-hooks/headings/)
- [图片](/render-hooks/images/)
- [链接](/render-hooks/links/)
- [原样透传元素](/render-hooks/passthrough/)
- [表格](/render-hooks/tables/)

> [!NOTE]
> Hugo 支持多种[内容格式](/content-management/content-formats/)，包括 Markdown、HTML、AsciiDoc、Emacs Org Mode、Pandoc 与 reStructuredText。
>
> 渲染钩子的能力仅限于 Markdown，无法为其他内容格式创建渲染钩子。

**这一段在解决什么问题：** Hugo 默认的 Markdown 转换是「一刀切」的——所有站外链接长得一样，所有独立图片都塞在 `<p>` 里，代码块永远用默认配色。项目一旦有了统一要求（站外链接要带 `rel="external"`、独立图片要包 `figure`、代码块要显示文件名），逐页手写 HTML 既不现实也无法维护。钩子的价值就是**把这类规则从内容里抽出来，变成一份模板，对全站生效**。

由此也能判断该不该用钩子：需求只跟**元素种类**有关、跟具体哪一页无关时，用钩子；需求只针对**某一处内容**时，用短代码（shortcode）或直接写 HTML 更简单。两者的分工见[短代码](/shortcodes/)。

例如下面这段 Markdown：

```md
[Hugo](https://gohugo.io)

![kitten](kitten.jpg)
```

在没有链接钩子与图片钩子时，它被渲染为：

```html
<p><a href="https://gohugo.io">Hugo</a></p>
<p><img alt="kitten" src="kitten.jpg"></p>
```

创建链接与图片渲染钩子之后，就可以改变这段 Markdown 到 HTML 的转换结果。例如：

```html
<p><a href="https://gohugo.io" rel="external">Hugo</a></p>
<p><img alt="kitten" src="kitten.jpg" width="600" height="400"></p>
```

对比两段输出可以看到钩子的作用点：**只换了 `<a>` 与 `<img>` 两个标签的写法，Markdown 原文一个字都没改**。

## 钩子模板的位置与命名

### 位置：`layouts/_markup/`

钩子模板放在 `layouts/_markup/` 目录中，文件名与元素类型一一对应：

```tree
layouts/
  └── _markup/
      ├── render-blockquote.html
      ├── render-codeblock.html
      ├── render-heading.html
      ├── render-image.html
      ├── render-link.html
      ├── render-passthrough.html
      └── render-table.html
```

Hugo 找模板的顺序是「项目 → 主题」（多主题时按 `theme` 数组从左到右），所以同一个文件名可以同时存在于两个地方：

| 文件放在哪 | 作用范围 | 优先级 |
| --- | --- | --- |
| 项目 `layouts/_markup/` | 只在你自己的站点生效 | 高，覆盖主题的同名文件 |
| 主题 `themes/<主题名>/layouts/_markup/` | 由主题提供，使用该主题的站点共享 | 低 |

**这决定了改主题钩子的正确做法**：不要直接改 `themes/` 里的文件（主题一升级就被覆盖），而是在项目里放一个同名文件，把主题的实现复制过来再改。项目里的那个会赢。

实测（Hugo 0.167，本站）：项目 `layouts/` 下只有 `_default/baseof.html`，没有任何 `_markup/` 目录；而站上的钩子全部来自主题 `hugo-docs-theme`，它提供了 `render-blockquote.html`、`render-codeblock.html`、`render-link.html` 三个。也就是说，**「项目里没有 `_markup/`」不等于「站上没有钩子」**，排查时两个位置都要看。

`_markup` 目录还能放在更深的层级：任何不以 `_` 开头的目录都代表一条页面路径的根，`layouts/<页面路径>/_markup/render-link.html` 只对这条路径及其下级生效，并且**匹配得越深、越具体，优先级越高**。规则详见[新版模板系统概览](/templates/new-templatesystem-overview/#查找顺序的变化)与[模板查找顺序](/templates/lookup-order/)。

### 文件名的三段结构

钩子模板的文件名由三段拼成，后两段可以省略：

```text
render-<元素>[-<限定>][.<输出格式>].<后缀>
     必填      可选        可选
```

| 段 | 是否必填 | 作用 | 示例 |
| --- | --- | --- | --- |
| `render-<元素>` | 必填 | 决定这个模板处理哪种 Markdown 元素 | `render-link.html`、`render-table.html` |
| `-<限定>` | 可选 | 把同一元素再细分：代码块按语言、引用块按子类型、透传元素按类型 | `render-codeblock-mermaid.html`、`render-blockquote-alert.html`、`render-passthrough-inline.html` |
| `.<输出格式>.<后缀>` | 可选 | 只为某种输出格式准备钩子 | `render-link.rss.xml` |

三段里可用的名字都不是自己发明的：元素名就是本章的七个页面；限定名由 Hugo 给定（代码块用语言名，引用块用 `alert`/`regular`，透传元素用 `block`/`inline`）；输出格式名来自站点配置（`html`、`rss` 等），后缀是媒体类型的后缀（`html`、`xml` 等）。

**多个模板都能匹配时**，Hugo 从最具体到最通用依次查找：先找 `render-codeblock-mermaid.html`，没有再退回 `render-codeblock.html`。所以「为 Mermaid 单独写一个模板」和「在一个模板里写条件判断」是等价的两条路，前者更好维护，后者少一个文件。

带限定名的模板如果没有写对，后果是**静默回退**：`render-codeblock-mermiad.html`（拼错）不会报错，只会让那份模板永远不被使用，mermaid 代码块照旧走通用模板。

## 查找顺序

模板查找顺序允许你为不同的页面类型（type）、页面种类（kind）、语言与输出格式分别创建不同的渲染钩子。例如：

```tree
layouts/
├── _markup/
│   ├── render-link.html
│   └── render-link.rss.xml
├── books/
│   └── _markup/
│       ├── render-link.html
│       └── render-link.rss.xml
└── films/
    └── _markup/
        ├── render-link.html
        └── render-link.rss.xml
```

上例在项目根级 `_markup` 目录中定义了默认的链接钩子，又为 `books`、`films` 两种页面类型各自定义了不同的链接钩子，并为 RSS 输出格式准备了单独的模板。代码块钩子还可以按语言细化命名，例如 `render-codeblock-mermaid.html` 只处理 `mermaid` 代码块。

**为什么要分这么多维度：** 同一篇 Markdown 在不同场景下的正确输出并不一样。网页里的链接可以带 `target="_blank"`，RSS 里不能；`books` 分区的标题要编号，`films` 分区不要。把这些差异写在同一个模板里会变成层层嵌套的 `if`，拆成多个文件反而更清楚。

钩子模板就是普通模板，可以调用局部模板、函数与页面方法，也可以与其他模板共享同一套渲染代码。

## 钩子模板输出的三种值类型

钩子模板写出来的内容会被**原样插入** HTML。因此「这个值是可信 HTML，还是需要转义的字符串」决定了你要不要额外处理——这是渲染钩子最容易写出「没报错但结果不对」的地方：

| 类型 | 从哪来 | 输出时要注意什么 |
| --- | --- | --- |
| `template.HTML`：可信 HTML | 上下文字段里的 `.Text`；`transform.HighlightCodeBlock` 返回的 `.Wrapped` 与 `.Inner`；`transform.Emojify` 的结果 | 直接写 `{{ .Text }}` 输出即可，Hugo 不会再转义 |
| `string`：普通字符串 | `.Destination`、`.Title`、`.PlainText`、`.Type`、`.Anchor` 等 | 作为正文输出会被自动转义（这是对的）；放进 `href`、`src` 这类 URL 属性时要套 `safeURL` |
| `template.HTMLAttr`：属性片段 | 用 `printf "%s=%q"` 拼出来的 `class=`、`style=` 等 | 必须套 `safeHTMLAttr`，否则引号会被转义成 `&#34;`，属性在浏览器里直接失效 |

判断方法很机械：**先看上下文字段表里标注的类型**（每个钩子页面的「上下文」小节都有），再看这个值是当正文用还是当属性用。当 URL 属性用 → `safeURL`；当属性片段用 → `safeHTMLAttr`；当正文用 → 什么都不用加。

> [!NOTE]
> 「三种值类型」是本站为了便于排查而做的归纳，依据是各钩子页面示例中的 `safeURL`、`safeHTMLAttr` 写法，以及上下文字段表里标注的 `string` 与 `template.HTML`。Hugo 官方文档没有「三种返回值类型」这样的提法，遇到与官方表述不一致时以官方为准。

## 怎么确认钩子真的生效

写完钩子最忌讳的是「看起来差不多」。给钩子输出加一个**独一无二的记号**，再去产出的 HTML 里搜它——能被搜到才算生效：

```go-html-template {file="layouts/_markup/render-link.html"}
<a class="hook-check" href="{{ .Destination | safeURL }}">{{ .Text }}</a>
```

```bash
hugo --ignoreCache --destination tmp-out
```

```bash
# Linux / macOS
grep -rn "hook-check" tmp-out/ | head
```

```powershell
# Windows PowerShell
Select-String -Path tmp-out\**\*.html -Pattern "hook-check" | Select-Object -First 10
```

- **搜得到**：钩子生效了，接下来再把它改回真正的实现；
- **搜不到**：说明这个模板根本没被使用，按下一节的表逐条排查。

验证完请删掉临时输出目录 `tmp-out/`。不想额外建目录的话，也可以用 `hugo server` 打开页面，右键选「查看网页源代码」，在里面搜同一个记号。

## 配错时的典型报错与常见坑

三类问题分开看，定位最快。每一类里「先看什么」比「改什么」更重要。

### 第一类：钩子「找不到」——完全没有报错

最坑的一类，因为 Hugo 不会提示你。现象是：模板写得没问题，构建也成功，页面就是没有变化。

| 可能原因 | 怎么确认 |
| --- | --- |
| 文件不在 `layouts/_markup/`，而是放进了 `layouts/`、`layouts/_partials/` 或 `layouts/_default/` | 核对文件路径；`_markup` 是固定目录名，不能改名 |
| 文件名不是 `render-<元素>.html`（写成 `link.html`、`render-hook-link.html`、`render-link.tmpl` 等） | 对照上文的命名表与七个元素名逐一核对 |
| `-<限定>` 拼错（`render-codeblock-mermiad.html`），于是永远不匹配 | 删掉限定段，先用通用的 `render-codeblock.html` 确认能被触发 |
| 项目里想改的其实是主题钩子，但自己在项目里放的文件名与主题里的并不一致 | 同时看项目与主题两处 `_markup/` 目录 |

修完必须重新走一次构建；`hugo server` 会自动重建，一次性构建则要重跑命令。

### 第二类：没报错，但结果不对

| 现象 | 原因 | 怎么修 |
| --- | --- | --- |
| HTML 里出现了 `&#34;`、属性值被引号包围成可见文本 | 属性片段没套 `safeHTMLAttr` | 按上文「三种值类型」对照，给拼接属性的表达式补 `safeHTMLAttr` |
| 链接地址被改成了相对路径或直接失效 | `.Destination` 是 `string`，放进 `href` 时没套 `safeURL` | 用 `{{ .Destination | safeURL }}` |
| 独立图片没有变成 `figure`，`IsBlock` 永远是假 | 站点没有把 `wrapStandAloneImageWithinParagraph` 设为 `false`（默认是 `true`） | 见[图片](/render-hooks/images/) |
| 标题没有 `id`，目录与锚点链接全部失灵 | 标题钩子漏输出了 `Anchor` | 见[标题](/render-hooks/headings/) |
| 表格结构不完整，表头或表体整体消失 | 表格钩子只遍历了 `THead` 或只遍历了 `TBody` | 见[表格](/render-hooks/tables/) |
| 页面上直接显示 `\[ ... \]`、`$$ ... $$` 这类定界符 | 透传元素没有被渲染 | 见[原样透传](/render-hooks/passthrough/) |

### 第三类：报错看不懂

| 报错里出现什么 | 含义 | 怎么修 |
| --- | --- | --- |
| 钩子模板的文件名与行号，措辞含 `unexpected EOF`、`unexpected "end"` 之类 | 模板里的 `{{ if }}`、`{{ range }}`、`{{ with }}` 没有配平，或多写/少写了 `{{ end }}` | 从报出的行号往上找最近的 `if`／`range`／`with`，补上 `{{ end }}`；编辑器开启括号匹配能省很多时间 |
| `can't evaluate field ...` 之类的求值失败 | 用了别的钩子才提供的字段，例如在链接钩子里写 `.Inner`、在代码块钩子里写 `.Anchor` | 回到对应页面的「上下文」小节核对字段清单 |
| 一条纯中文/纯英文的自定义消息 | 这是钩子模板里自己写的 `errorf` 在报错，不是 Hugo 的内置报错 | 按消息里给出的位置信息回源文件对照修正 |

还有一条与报错无关但同样常见的坑：**不要给钩子模板使用 `templates.Defer`**，官方文档明确指出在短代码或渲染钩子模板里使用它可能导致结果不可预测。

更系统的排查方法见[故障排查](/troubleshooting/)；只看新用户最常遇到的问题，可以直接跳[常见问题](/troubleshooting/faq/)。

## 各页内容

本章其余各页逐一介绍每种渲染钩子，包括示例以及每个模板可以接收的上下文变量。除了共有的 `Page`（当前页面）与 `PageInner`（通过 `RenderShortcodes` 方法嵌套的页面）之外，各钩子提供的字段并不相同，具体见对应页面：[链接](/render-hooks/links/)、[图片](/render-hooks/images/)、[标题](/render-hooks/headings/)、[代码块](/render-hooks/code-blocks/)、[引用块](/render-hooks/blockquotes/)、[表格](/render-hooks/tables/)、[原样透传](/render-hooks/passthrough/)。

按用途挑，不必按顺序读：

- 想让**站外链接**带上标记、想统一处理链接地址 → [链接](/render-hooks/links/)；
- 想给**图片**加题注、包 `figure`，或需要 `alt` 行为可控 → [图片](/render-hooks/images/)；
- 想给**标题**加锚点链接、统一 `id` 命名 → [标题](/render-hooks/headings/)；
- 想改**代码块**外观、渲染 Mermaid 图、显示文件名 → [代码块](/render-hooks/code-blocks/)；
- 想让 `> [!NOTE]` 之类**警示块**变成带样式的提示框 → [引用块](/render-hooks/blockquotes/)；
- 想给**表格**加样式、加 `scope` 属性 → [表格](/render-hooks/tables/)；
- 想在构建时渲染 **LaTeX 公式** → [原样透传](/render-hooks/passthrough/)。
