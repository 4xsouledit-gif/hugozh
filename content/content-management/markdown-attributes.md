+++
title = "Markdown 属性"
linkTitle = "Markdown 属性"
description = "在 Markdown 元素后追加属性块，为标题、段落、图片等设置 HTML 属性；含必须打开的配置项与验证方法。"
date = 2026-10-01
weight = 140
source = "https://gohugo.io/content-management/markdown-attributes/"

[params.teach]
difficulty = "进阶"
time = "15–20 分钟"
prereq = [
  "会写 Markdown 与围栏代码块，知道项目配置 `hugo.toml` 在哪。",
  "有一个能查看产物 HTML 的构建环境。",
]
outcomes = [
  "在标题、段落、引用块、围栏代码块上正确放置属性块，并知道它写在哪一侧；",
  "解释「属性块没生效、反而出现在正文里」的原因，并知道要开哪一项配置；",
  "在渲染钩子里用 `.Attributes` 读到这些属性，把它们写进最终 HTML；",
  "判断独立图片的属性该不该用属性块来做。",
]
next = ["/configuration/markup/", "/render-hooks/introduction/", "/content-management/page-resources/"]

+++

## 这一页解决什么问题

Hugo 支持在图片，以及引用块（blockquote）、围栏代码块（fenced code block）、标题、水平分隔线、列表、段落、表格等块级元素上使用 Markdown 属性（Markdown attributes）。

这个功能「写起来一行就够了」，但有两个前提条件经常被忽略，导致属性块**不生效、反而被当成正文显示出来**：

1. **块级元素的属性需要在项目配置里显式开启**（`[markup.goldmark.parser.attribute] block = true`）；标题的属性默认就开。
2. **独立图片的属性要看 Goldmark 是否把图片包进了 `<p>`**——包着的话，属性会落到那个段落上，而不是图片上。

所以本页的阅读重点是「配置在哪、怎么验证」：改完一处配置，用产物 HTML 里的标签确认，而不是靠肉眼猜。

**验证属性是否生效的标准做法**：写一段带属性块的 Markdown，构建后查看产物 HTML。

```bash
hugo
```

**你应当看到什么**（**实测：Hugo 0.167**）：

- 标题属性块 `## Heading with attributes {#custom-id}` 会渲染成 `<h2 id="custom-id">Heading with attributes</h2>`——**不需要**额外配置，`title` 默认为 `true`。
- 段落下方的属性块 `{.lead}`：在**没有**开 `block = true` 的站点上，它会被当作正文，渲染出字面的 `<p>{.lead}</p>`；开了之后这一行被吃掉、变成前一个段落的属性。**这是本页最容易误判的地方**——看到 `{.lead}` 出现在页面上，就是配置没开。

## 概述

Hugo 支持在图片，以及引用块（blockquote）、围栏代码块（fenced code block）、标题、水平分隔线、列表、段落、表格等块级元素上使用 Markdown 属性（Markdown attributes）。

例如：

```md
这是一个段落。
{class="foo bar" id="baz"}
```

对于 `class` 与 `id`，还可以使用简写形式：

```md
这是一个段落。
{.foo .bar #baz}
```

两种写法都会被 Hugo 渲染为：

```html
<p class="foo bar" id="baz">这是一个段落。</p>
```

无论使用长形式还是简写形式，`class` 与 `id` 的最终取值都会通过 `Attributes` 方法暴露给[渲染钩子模板](/render-hooks/)。例如：

```go-html-template
{{ .Attributes.class }}
{{ .Attributes.id }}
```

在上面的示例中，两个取值分别是 `foo bar` 与 `baz`。

## 块级元素

块级元素的属性默认不生效，需要在项目配置中显式开启：

```toml
[markup.goldmark.parser.attribute]
  title = true # 默认值为 true
  block = true # 默认值为 false
```

其中 `title` 控制标题，`block` 控制其他块级元素，二者的默认值并不相同。

**配置写在哪**：项目配置根目录下的 `hugo.toml`（多环境时为 `config/_default/hugo.toml`），键的完整路径是 `markup.goldmark.parser.attribute`。本站在[站点配置](/configuration/)里已经打开了 `block = true`；`wrapStandAloneImageWithinParagraph` **没有**设置，保持默认 `true`（**实测：Hugo 0.167，本站**）。

**你应当看到什么**：改完配置后执行 `hugo config`，输出里能看到 `attribute` 表下的这两个值。注意 TOML 的表头作用域——`[markup.goldmark.parser.attribute]` 之后不能再写其他裸键，否则会被并进这张表。

## 独立图片

默认情况下，当 [Goldmark](https://github.com/yuin/goldmark) Markdown 渲染器遇到独立图片元素（同一行上没有其他元素或文字）时，会按照 [CommonMark](https://spec.commonmark.org/current/) 规范把它包裹在 `<p>` 元素中。

因此，如果在图片元素下方写属性块，Hugo 会把属性应用到外层的段落上，而不是图片本身。

要让属性作用于独立图片元素，必须关闭这一默认包裹行为：

```toml
[markup.goldmark.parser]
  wrapStandAloneImageWithinParagraph = false # 默认值为 true
```

## 用法

属性块中可以写[全局 HTML 属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes)，也可以写当前元素类型特有的 HTML 属性。出于内容安全模型的考虑，Hugo 会移除 `onclick`、`onmouseover` 这类 HTML 事件属性。

> [!NOTE]
> 在围栏代码块中，`style` 属性会被 Hugo 当作语法高亮选项处理，而不是全局 HTML 属性。

属性块由一个或多个键值对组成，键值对之间用空格或逗号分隔，整体用花括号包裹。包含空格的字符串值必须加引号。与 HTML 不同，布尔属性必须同时写出键与值。

例如：

```md
> 这是一段引用。
{class="foo bar" hidden=hidden}
```

Hugo 会把它渲染为：

```html
<blockquote class="foo bar" hidden="hidden">
  <p>这是一段引用。</p>
</blockquote>
```

多数情况下，属性块写在 Markdown 元素的下方；标题与围栏代码块则写在右侧：

| 元素 | 属性块位置 |
| --- | --- |
| 引用块 | 下方 |
| 围栏代码块 | 右侧 |
| 标题 | 右侧 |
| 水平分隔线 | 下方 |
| 图片 | 下方 |
| 列表 | 下方 |
| 段落 | 下方 |
| 表格 | 下方 |

例如：

````md
## 第一节 {class=foo}

```sh {class=foo linenos=inline}
declare a=1
echo "${a}"
```

这是一个段落。
{class=foo}
````

如上所示，围栏代码块的属性块并不局限于 HTML 属性，还可以传入语法高亮选项来调整渲染效果。

## 与渲染钩子配合

属性块中声明的属性会以 `.Attributes` 的形式传给渲染钩子（render hook），由钩子模板决定如何把它们写入最终输出。例如标题钩子可以读取 `.Anchor`，并输出带有自定义锚点的标题：

```go-html-template
<h{{ .Level }} id="{{ .Anchor }}" {{- with .Attributes.class }} class="{{ . }}" {{- end }}>
  {{ .Text }}
  <a href="#{{ .Anchor }}">#</a>
</h{{ .Level }}>
```

需要注意，标题的属性块必须在配置中开启 `title = true` 才会生效，否则钩子拿到的 `.Attributes` 中不会包含这些取值。渲染钩子的完整用法见 [渲染钩子](/render-hooks/)。

**你应当看到什么**：在钩子模板里临时加一行 `{{ warnf "attrs=%v" .Attributes }}` 然后构建，终端会打印该元素收到的属性映射（例如 `map[class:foo bar id:baz]`）。这是确认「属性到底有没有传到钩子」最直接的方法——比盯着产物 HTML 猜快得多。

## 什么时候用属性块、什么时候别用

**该用**：

- 给某个标题加固定锚点（`{#custom-id}`），让站外可以稳定链接过去；
- 给个别段落、引用块加类名，交给 CSS 做特殊排版；
- 在围栏代码块上直接写高亮选项（`{class=foo linenos=inline}`），就地覆盖默认高亮设置。

**别用**：

- **想给全站统一加样式**——那是主题 CSS 与渲染钩子的事，不要在每篇内容里手写类名；
- **想给所有图片加属性**——独立图片的属性受 `wrapStandAloneImageWithinParagraph` 影响，行为容易随配置变化；统一处理应交给[图片渲染钩子](/render-hooks/images/)；
- **想写事件属性**（`onclick` 等）——Hugo 出于内容安全模型会直接移除，写了也没用；
- **在围栏代码块里写 `style` 当 HTML 属性**——它会被当作语法高亮选项，见本页开头的说明。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上直接显示 `{.lead}` 这样的字面文本 | 该元素属于块级元素，而配置里没开 `block = true`（实测：Hugo 0.167） | 在项目配置的 `[markup.goldmark.parser.attribute]` 里设 `block = true`，重新构建 |
| 没报错但结果不对 | 独立图片下方的属性落到了外层 `<p>` 上 | Goldmark 默认把独立图片包进 `<p>`（`wrapStandAloneImageWithinParagraph = true`） | 设 `wrapStandAloneImageWithinParagraph = false`，或用图片渲染钩子统一处理 |
| 没报错但结果不对 | 属性写对了，但页面上什么也没改变 | 属性只是「交给渲染钩子」，如果站点没有自定义钩子，属性会由 Goldmark 默认输出到标签上；若连标签也没变，说明配置没生效 | 用 `hugo config` 核对配置；在钩子里 `warnf` 打印 `.Attributes` 确认有没有传进去 |
| 没报错但结果不对 | 标题属性块写了却拿不到 | 配置里的 `title` 被设成了 `false`（默认是 `true`） | 去掉该项或显式设 `title = true` |
| 没报错但结果不对 | 属性块位置写错，属性跑到了别的元素上 | 各元素要求的位置不同：标题与围栏代码块写在**右侧**，其余写在**下方** | 对照[元素位置表](#用法)调整；写完用产物 HTML 确认属性挂在哪个标签上 |
| 报错看不懂 | 构建报 TOML 解析错误，指向配置文件 | `[markup.goldmark.parser.attribute]` 表头之后写了不属于该表的裸键 | 把顶层标量键移到所有表头之前；属性相关键保持在 `attribute` 表内 |

更多排查入口见[故障排查](/troubleshooting/)。
