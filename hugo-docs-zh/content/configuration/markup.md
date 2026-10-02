+++
title = "Markup 配置"
linkTitle = "Markup 配置"
description = "配置 Markdown 渲染器、代码高亮与目录生成参数。"
date = 2026-10-01
weight = 120
source = "https://gohugo.io/configuration/markup/"
+++

## 这一页解决什么问题

`[markup]` 决定「Markdown 能写成什么样」：用哪个渲染器、启用哪些扩展、代码高亮怎么输出、目录收哪几级标题，以及要不要允许内联 HTML。日常改站点时，这是最常动的一类配置——它的共同特点是**改错后页面照样构建成功，只是内容少了一块或者多出一串字面符号**。

**本站现状（实测，Hugo 0.167）**：本站 `hugo.toml` 中开启了 `renderer.unsafe = true`、`parser.attribute.block = true`、`parser.autoDefinitionTermID = true`，把 `highlight.noClasses` 设为 `false`（改用外部样式表），并把 `tableOfContents` 设为 `startLevel = 2`、`endLevel = 3`。下面各节的选项正是这些。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `defaultMarkdownHandler` | 确实需要 AsciiDoc / Org / Pandoc / reStructuredText 的独有能力 | 改了它却没安装对应渲染器、也没放行安全策略 → 构建失败，报错指向外部可执行文件；上游也建议除非有明确需要，否则保持 Goldmark |
| `renderer.unsafe` | 内容里要保留原始 HTML（本站已开启） | 保持默认 `false` 时，Markdown 中的 HTML 被**替换为注释**：构建不报错，标签却消失了 |
| `parser.attribute.block` | 需要在块级元素上写 `{.class}` 属性（本站已开启） | 不开时那一行会被当作普通段落文字，页面上多出可见的 `{.class}` |
| `parser.wrapStandAloneImageWithinParagraph` | 用图片渲染钩子把独立图片包成 `figure` | 保持默认 `true` 时图片被 `<p>` 包裹，钩子里的 `IsBlock` 恒为假，`figure` 分支永不执行（无报错） |
| `extensions.cjk` / `passthrough` / `extras` | 中日韩换行控制 / LaTeX 公式 / 删除线、上下标 | 未启用扩展时对应语法**按字面显示**（例如 `$$…$$` 原样输出），不报错 |
| `renderHooks.image` / `renderHooks.link` 的 `useEmbedded` | 多语言单主机项目的资源地址解析 | `always` 会覆盖你自己写的钩子；`auto` / `fallback` 与自定义钩子的取舍见下文取值说明 |
| `highlight.style` / `noClasses` | 换高亮配色，或改用外部样式表 | `noClasses = false` 时颜色来自外部 CSS，只改 `style` 而不重新生成样式表 → 颜色没变 |
| `tableOfContents.startLevel` / `endLevel` | 目录里不想出现 `h1`，或不想收到 `h4` 以下 | 范围写反（`startLevel` 大于 `endLevel`）→ 目录为空 |
| `extensions.extras.subscript` | 需要下标 | 上游明确：启用下标**必须同时禁用** `strikethrough`；忘了禁用会导致 `~~删除线~~` 不再生效 |

**什么时候别用**：不要为了「支持更多写法」随手打开 `unsafe`——它意味着页面里的任意 HTML 都会被原样输出，只适合内容完全由你掌控的站点；也不要在一个站点里混用多个 Markdown 处理器，模板、短代码与渲染钩子的行为会分成两套。

## 默认处理器

在默认配置下，Hugo 使用 [Goldmark](https://github.com/yuin/goldmark/) 把 Markdown 渲染为 HTML：

```toml
[markup]
defaultMarkdownHandler = 'goldmark'
```

以 `.md`、`.mdown` 或 `.markdown` 结尾的文件都会按 Markdown 处理，除非你在前置元数据中用 `markup` 字段显式指定了其他格式。

要改用其他渲染器处理 Markdown 文件，可在项目配置中把 `defaultMarkdownHandler` 设为 `asciidocext`、`org`、`pandoc` 或 `rst` 之一：

`defaultMarkdownHandler` | 渲染器
:------------------------|:--------------------
`asciidocext`            | [AsciiDoc](https://asciidoc.org/)
`goldmark`               | [Goldmark](https://github.com/yuin/goldmark/)
`org`                    | [Emacs Org Mode](https://orgmode.org/)
`pandoc`                 | [Pandoc](https://pandoc.org/)
`rst`                    | [reStructuredText](https://docutils.sourceforge.io/rst.html)

要使用 AsciiDoc、Pandoc 或 reStructuredText，必须安装相应的渲染器，并更新安全策略。

> 除非确实需要某种替代 Markdown 处理器独有的能力，否则强烈建议使用默认设置。Goldmark 速度快、维护良好，符合 [CommonMark](https://spec.commonmark.org/current/) 规范，并兼容 [GitHub Flavored Markdown](https://github.github.com/gfm/)（GFM）。

## Goldmark

以下是 Goldmark Markdown 渲染器的默认配置：

```toml
[markup.goldmark]
duplicateResourceFiles = false

[markup.goldmark.extensions]
definitionList = true
footnote = true
linkify = true
linkifyProtocol = 'https'
strikethrough = true
table = true
taskList = true
typographer = true

[markup.goldmark.extensions.cjk]
enable = false
eastAsianLineBreaks = false
eastAsianLineBreaksStyle = 'simple'
escapedSpace = false

[markup.goldmark.extensions.extras]
[markup.goldmark.extensions.extras.delete]
enable = false
[markup.goldmark.extensions.extras.insert]
enable = false
[markup.goldmark.extensions.extras.mark]
enable = false
[markup.goldmark.extensions.extras.subscript]
enable = false
[markup.goldmark.extensions.extras.superscript]
enable = false

[markup.goldmark.extensions.footnote]
enable = true
backlinkHTML = '&#x21a9;&#xfe0e;'
enableAutoIDPrefix = false

[markup.goldmark.extensions.passthrough]
enable = false
[markup.goldmark.extensions.passthrough.delimiters]
block = []
inline = []

[markup.goldmark.extensions.typographer]
disable = false
apostrophe = '&rsquo;'
ellipsis = '&hellip;'
emDash = '&mdash;'
enDash = '&ndash;'
leftAngleQuote = '&laquo;'
leftDoubleQuote = '&ldquo;'
leftSingleQuote = '&lsquo;'
rightAngleQuote = '&raquo;'
rightDoubleQuote = '&rdquo;'
rightSingleQuote = '&rsquo;'

[markup.goldmark.parser]
autoDefinitionTermID = false
autoHeadingID = true
autoIDType = 'github'
wrapStandAloneImageWithinParagraph = true

[markup.goldmark.parser.attribute]
block = false
title = true

[markup.goldmark.renderer]
hardWraps = false
unsafe = false
xhtml = false

[markup.goldmark.renderHooks.image]
enableDefault = false
useEmbedded = 'auto'

[markup.goldmark.renderHooks.link]
enableDefault = false
useEmbedded = 'auto'
```

### 扩展

下表中的扩展，除 Extras 与 Passthrough 外，默认均启用：

扩展 | 文档 | 默认启用
:----------------|:----------------------------------------------|:-----------------:
`cjk`            | Goldmark Extensions: CJK                      | 是
`definitionList` | PHP Markdown Extra: Definition lists          | 是
`extras`         | Hugo Goldmark Extensions: Extras              | 否
`footnote`       | PHP Markdown Extra: Footnotes                 | 是
`linkify`        | GitHub Flavored Markdown: Autolinks           | 是
`passthrough`    | Hugo Goldmark Extensions: Passthrough         | 否
`strikethrough`  | GitHub Flavored Markdown: Strikethrough       | 是
`table`          | GitHub Flavored Markdown: Tables              | 是
`taskList`       | GitHub Flavored Markdown: Task list items     | 是
`typographer`    | Goldmark Extensions: Typographer              | 是

#### Extras

启用 Extras 扩展后，可以在 Markdown 中使用删除文本、插入文本、标记文本、下标与上标元素：

元素 | Markdown | 渲染结果
:-------------|:----------|:------------------
删除文本 | `~~foo~~` | `<del>foo</del>`
插入文本 | `++bar++` | `<ins>bar</ins>`
标记文本 | `==baz==` | `<mark>baz</mark>`
下标 | `H~2~O` | `H<sub>2</sub>O`
上标 | `1^st^` | `1<sup>st</sup>`

为避免冲突[^1]，如果启用 Extras 扩展的「下标」特性，就必须禁用 Strikethrough 扩展：

```toml
[markup.goldmark.extensions]
strikethrough = false

[markup.goldmark.extensions.extras.subscript]
enable = true
```

如果禁用 Strikethrough 扩展后仍需要显示删除文本，可启用 Extras 扩展的「删除文本」特性：

```toml
[markup.goldmark.extensions]
strikethrough = false

[markup.goldmark.extensions.extras.delete]
enable = true
```

使用这份配置后，用双波浪线包裹文本即可表示删除。

#### 脚注

脚注（Footnote）扩展默认启用，用于在 Markdown 中加入脚注：

键名|类型|默认值|说明
:--|:--|:--|:--
`enable`|`bool`|`true`|（自 v0.151.0 起）是否启用脚注扩展。
`backlinkHTML`|`string`|`&#x21a9;&#xfe0e;`|（自 v0.151.0 起）显示在脚注末尾、链接回正文对应引用的 HTML，默认是一个回车箭头符号。
`enableAutoIDPrefix`|`bool`|`false`|（自 v0.151.0 起）是否给脚注 ID 加上唯一前缀，以避免多个文档一起渲染时发生冲突。该前缀对每个逻辑路径唯一，因此在语言等内容维度之间并不唯一。

#### Passthrough

启用 Passthrough 扩展后，可以使用 LaTeX 标记在 Markdown 中书写数学公式与表达式。详见[数学公式](/content-management/mathematics/)。

#### Typographer

Typographer 扩展会把下列字符组合替换为对应的 HTML 实体：

Markdown|替换为|说明
:--|:--|:--
`...`|`&hellip;`|水平省略号
`'`|`&rsquo;`|撇号
`--`|`&ndash;`|短破折号
`---`|`&mdash;`|长破折号
`«`|`&laquo;`|左书名号
`“`|`&ldquo;`|左双引号
`‘`|`&lsquo;`|左单引号
`»`|`&raquo;`|右书名号
`”`|`&rdquo;`|右双引号
`’`|`&rsquo;`|右单引号

### 设置

上面的多数 Goldmark 设置一看即懂，以下几项需要说明。

键名|类型|默认值|说明
:--|:--|:--|:--
`duplicateResourceFiles`|`bool`|`false`|在多语言单主机项目中，是否为每种语言复制共享的页面资源。详见[多语言页面资源](/content-management/page-resources/)。
`parser.wrapStandAloneImageWithinParagraph`|`bool`|`true`|渲染时是否把没有相邻内容的图像元素包进 `p` 元素，这是 Markdown 的默认行为。使用图像渲染钩子把独立图像渲染为 `figure` 元素时，应设为 `false`。
`parser.autoDefinitionTermID`|`bool`|`false`|（自 v0.144.0 起）是否自动为描述列表的术语（即 `dt` 元素）添加 `id` 属性。为 `true` 时，每个 `dt` 元素的 `id` 属性可通过 `Page` 对象上的 `Fragments.Identifiers` 方法访问。
`parser.autoHeadingID`|`bool`|`true`|是否自动为标题（即 `h1` 至 `h6` 元素）添加 `id` 属性。
`parser.autoIDType`|`string`|`github`|自动生成 `id` 属性的策略，可选 `github`、`github-ascii` 或 `blackfriday`。
`parser.attribute.block`|`bool`|`false`|是否为块级元素启用 [Markdown 属性](/content-management/markdown-attributes/)。
`parser.attribute.title`|`bool`|`true`|是否为标题启用 [Markdown 属性](/content-management/markdown-attributes/)。
`renderer.hardWraps`|`bool`|`false`|是否把段落内的换行符替换为 `br` 元素。
`renderer.unsafe`|`bool`|`false`|是否渲染混在 Markdown 中的原始 HTML。除非内容由你掌控，否则这不安全。

> 在多语言单主机项目中，把 `duplicateResourceFiles` 设为 `false` 会启用 Hugo 的[内嵌链接渲染钩子](/render-hooks/links/#内建钩子)与[内嵌图像渲染钩子](/render-hooks/images/#内建钩子)。这是多语言单主机项目的默认配置。

`parser.autoIDType` 的取值含义：

- `github`：生成与 GitHub 兼容的 `id` 属性
- `github-ascii`：在重音归一化之后丢弃所有非 ASCII 字符
- `blackfriday`：生成与 Blackfriday Markdown 渲染器兼容的 `id` 属性

该策略同时也是 `urls.Anchorize` 函数使用的策略。

图像与链接渲染钩子的启用方式：

键名|类型|默认值|说明
:--|:--|:--|:--
`renderHooks.image.enableDefault`|`bool`|`false`|（自 v0.148.0 起弃用）请改用 `renderHooks.image.useEmbedded`。
`renderHooks.image.useEmbedded`|`string`|`auto`|（自 v0.148.0 起）何时使用内置[图像渲染钩子](/render-hooks/images/#内建钩子)，可选 `auto`、`never`、`always` 或 `fallback`。
`renderHooks.link.enableDefault`|`bool`|`false`|（自 v0.148.0 起弃用）请改用 `renderHooks.link.useEmbedded`。
`renderHooks.link.useEmbedded`|`string`|`auto`|何时使用内置[链接渲染钩子](/render-hooks/links/#内建钩子)，可选 `auto`、`never`、`always` 或 `fallback`。

`useEmbedded` 的取值含义：

- `auto`：仅对禁用共享页面资源复制的多语言单主机项目使用内置渲染钩子。如果项目、模块或主题定义了自定义渲染钩子，则改用它们。
- `never`：从不使用内置渲染钩子。如果项目、模块或主题定义了自定义渲染钩子，则改用它们。
- `always`：始终使用内置渲染钩子，即使项目、模块或主题提供了自定义渲染钩子。
- `fallback`：仅当项目、模块或主题未提供自定义渲染钩子时使用内置渲染钩子。

## AsciiDoc

以下是 AsciiDoc 渲染器的默认配置：

```toml
[markup.asciiDocExt]
attributes = {}
backend = 'html5'
extensions = []
failureLevel = 'fatal'
noHeaderOrFooter = true
preserveTOC = false
safeMode = 'unsafe'
sectionNumbers = false
trace = false
verbose = false
workingFolderCurrent = false
```

### 设置

键名|类型|默认值|说明
:--|:--|:--|:--
`attributes`|`map`|空|键值对映射，每项为一个文档属性。
`backend`|`string`|`html5`|后端输出文件格式。
`extensions`|`[]string`|空|启用的扩展数组，例如 `asciidoctor-html5s`、`asciidoctor-bibtex` 或 `asciidoctor-diagram`。
`failureLevel`|`string`|`fatal`|触发非零退出码（失败）的最低日志级别。
`noHeaderOrFooter`|`bool`|`true`|是否输出可嵌入的文档，即排除页眉、页脚以及正文之外的一切内容。
`preserveTOC`|`bool`|`false`|是否保留 Asciidoctor 渲染的目录。默认情况下，为了让目录与现有主题兼容，Hugo 会移除 Asciidoctor 渲染的目录；要渲染目录，请在模板中使用 `Page` 对象的 `TableOfContents` 方法。
`safeMode`|`string`|`unsafe`|安全模式级别，可选 `unsafe`、`safe`、`server` 或 `secure`。
`sectionNumbers`|`bool`|`false`|是否为每个小节编号。
`trace`|`bool`|`false`|出错时是否包含回溯信息。
`verbose`|`bool`|`false`|是否把处理信息与配置文件检查结果详细打印到 stderr。
`workingFolderCurrent`|`bool`|`false`|是否把工作目录设为正在处理的 AsciiDoc 文件所在目录，从而让 include 使用相对路径。要配合 asciidoctor-diagram 扩展渲染图表，需设为 `true`。

> 为降低安全风险，扩展数组中的条目不得包含正斜杠（`/`）、反斜杠（`\`）或句点。受此限制，扩展必须位于 Ruby 的 `$LOAD_PATH` 中。

### 配置示例

```toml
[markup.asciidocExt]
backend = 'html5s'
extensions = ['asciidoctor-html5s','asciidoctor-diagram']
workingFolderCurrent = true
[markup.asciidocExt.attributes]
my-base-url = 'https://example.org/'
my-attribute-name = 'my value'
```

### 语法高亮

按以下步骤启用语法高亮。

**第 1 步：设置 `source-highlighter` 属性**

在项目配置中设置该属性。例如：

```toml
[markup.asciidocExt.attributes]
source-highlighter = 'rouge'
```

**第 2 步：生成高亮样式表**

例如：

```bash
rougify style monokai.sublime > assets/css/highlight.css
```

**第 3 步：在 _base_ 模板中添加指向该 CSS 文件的链接**

```go-html-template {file="layouts/baseof.html"}
<head>
  {{ with resources.Get "css/highlight.css" }}
    <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
  {{ end }}
</head>
```

**第 4 步：在标记中添加要高亮的代码**

```text
[#hello,go]
----
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
----
```

### 故障排查

运行 `hugo build --logLevel debug`，查看 Hugo 调用 `asciidoctor` 可执行文件的方式：

```text
INFO 2019/12/22 09:08:48 Rendering book-as-pdf.adoc with C:\Ruby26-x64\bin\asciidoctor.bat using asciidoc args [--no-header-footer -r asciidoctor-html5s -b html5s -r asciidoctor-diagram --base-dir D:\prototypes\hugo_asciidoc_ddd\docs -a outdir=D:\prototypes\hugo_asciidoc_ddd\build -] ...
```

## reStructuredText

以下是 reStructuredText 渲染器的默认配置：

```toml
[markup.rst]
syntaxHighlight = 'long'
```

### 设置

键名|类型|默认值|说明
:--|:--|:--|:--
`syntaxHighlight`|`string`|`long`|Pygments 解析代码时使用的 token 名称集合，可选 `long`、`short` 或 `none`。

### 语法高亮

按以下步骤启用语法高亮。

**第 1 步：把 `syntaxHighlight` 设为 `short`**

在项目配置中设置：

```toml
[markup.rst]
syntaxHighlight = 'short'
```

**第 2 步：生成高亮样式表**

例如：

```bash
pygmentize -S monokai -f html > assets/css/highlight.css
```

**第 3 步：在 _base_ 模板中添加指向该 CSS 文件的链接**

```go-html-template {file="layouts/baseof.html"}
<head>
  {{ with resources.Get "css/highlight.css" }}
    <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
  {{ end }}
</head>
```

**第 4 步：在标记中添加要高亮的代码**

```text
.. code-block:: go

  package main

  import "fmt"

  func main() {
      fmt.Println("Hello, World!")
  }
```

## 高亮

以下设置适用于 Markdown 中的围栏代码块、内置 `highlight` 短代码、`transform.Highlight` 函数以及 `transform.HighlightCodeBlock` 函数。默认配置如下：

```toml
[markup.highlight]
anchorLineNos = false
codeFences = true
guessSyntax = false
hl_Lines = ''
hl_inline = false
lineAnchors = ''
lineNoStart = 1
lineNos = false
lineNumbersInTable = true
noClasses = true
style = 'monokai'
tabWidth = 4
wrapperClass = 'highlight'
```

键名|类型|默认值|说明
:--|:--|:--|:--
`anchorLineNos`|`bool`|`false`|是否把每个行号渲染为 HTML 锚点元素，即把外层 `span` 元素的 `id` 属性设为行号。`lineNos` 为 `false` 时该项无效。
`codeFences`|`bool`|`true`|是否高亮围栏代码块。
`guessSyntax`|`bool`|`false`|当 `LANG` 参数为空或指向没有对应词法分析器的语言时，是否自动检测语言。无法自动检测时回退到纯文本词法分析器。语法高亮器包含约 300 种语言的词法分析器，但其中只有 5 种实现了自动语言检测。
`hl_Lines`|`string`|空|以空格分隔的行号列表，用于在代码中强调这些行。要强调第 2、3、4、7 行，把该值设为 `2-4 7`。该选项与 `lineNoStart` 相互独立。
`hl_inline`|`bool`|`false`|是否在不加外层容器的情况下渲染高亮代码。
`lineAnchors`|`string`|空|把行号渲染为 HTML 锚点元素时，将该值前置到外层 `span` 元素的 `id` 属性上。当页面包含两个及以上代码块时，这能保证 `id` 属性唯一。`lineNos` 或 `anchorLineNos` 为 `false` 时该项无效。
`lineNoStart`|`int`|`1`|第一行显示的编号。`lineNos` 为 `false` 时该项无效。
`lineNos`|`any`|`false`|控制行号的显示方式。
`lineNumbersInTable`|`bool`|`true`|是否把高亮代码渲染为含两个单元格的 HTML 表格：左格放行号，右格放代码。`lineNos` 为 `false` 时该项无效。
`noClasses`|`bool`|`true`|是否使用内联 CSS 样式而不使用外部 CSS 文件。要使用外部 CSS 文件，把该值设为 `false`，并用 `hugo gen chromastyles` 命令生成样式表。
`style`|`string`|`monokai`|应用于高亮代码的 CSS 样式，大小写不敏感。
`tabWidth`|`int`|`4`|用该数量的空格替换高亮代码中的每个制表符。`noClasses` 为 `false` 时该项无效。
`wrapperClass`|`string`|`highlight`|（自 v0.140.2 起）高亮代码最外层元素使用的类名。

`lineNos` 的取值含义：

- `true`：启用行号，具体形式由 `lineNumbersInTable` 决定
- `false`：禁用行号
- `inline`：启用内联行号（把 `lineNumbersInTable` 设为 `false`）
- `table`：启用基于表格的行号（把 `lineNumbersInTable` 设为 `true`）

使用外部样式表时，先生成 CSS 文件：

```bash
hugo gen chromastyles --style=github > assets/css/highlight.css
```

自 v0.164.0 起，部分样式提供独立的浅色与深色配色。用 `--mode` 标志为指定模式生成样式表，用 `--modeSelector` 标志把每个选择器限定在顶层模式类之下（例如 `.dark .chroma`）：

```bash
hugo gen chromastyles --style=monokai --mode=light > assets/css/highlight.css
hugo gen chromastyles --style=monokai --mode=dark --modeSelector > assets/css/highlight-dark.css
```

在根元素上添加或移除 `dark` 类即可切换深色模式。省略 `--mode` 时，Hugo 使用该样式的默认模式生成样式表。也可以在模板中用 `css.ChromaStyles` 函数生成样式表。

## 目录

以下是目录（table of contents）的默认配置，适用于 Goldmark 与 Asciidoctor：

```toml
[markup.tableOfContents]
endLevel = 3
ordered = false
startLevel = 2
```

键名|类型|默认值|说明
:--|:--|:--|:--
`startLevel`|`int`|`2`|层级低于该值的标题会被排除在目录之外。例如要把 `h1` 元素排除，把该值设为 `2`。
`endLevel`|`int`|`3`|层级高于该值的标题会被排除在目录之外。例如要把 `h4`、`h5`、`h6` 元素排除，把该值设为 `3`。
`ordered`|`bool`|`false`|是否生成有序列表而非无序列表。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| Markdown 里写的 HTML 标签在页面上消失了 | `renderer.unsafe` 默认为 `false`，原始 HTML 被剥离并替换为注释 | 需要保留原始 HTML 时设为 `true`（本站已开启）；只对可信内容开启 |
| 图片渲染钩子的 `figure` 分支从不执行 | `wrapStandAloneImageWithinParagraph` 仍是默认 `true`，`IsBlock` 恒为假 | 设为 `false`；详见[图片渲染钩子](/render-hooks/images/) |
| 表格后独立一行的 `{.class}` 变成可见文字 | 没有开启 `parser.attribute.block` | 设为 `true`（本站已开启） |
| `$$…$$` 公式原样显示 | Passthrough 扩展未启用，或分隔符没有配置 | 见[数学公式](/content-management/mathematics/)；本站启用的分隔符是 `\[…\]`、`$$…$$` 与 `\(…\)` |
| 改了 `highlight.style`，页面配色没变化 | `noClasses = false` 时颜色来自外部样式表，改 `style` 不会自动重新生成 CSS | 重新运行 `hugo gen chromastyles`（见本页「高亮」一节） |
| 目录里缺标题，或多出不该有的标题 | `tableOfContents.startLevel` / `endLevel` 范围不合适 | 默认是 2–3，即 `h1` 与 `h4` 以下都不进目录（本站即为该设置） |
| 脚注编号在多个文档一起渲染时冲突 | 脚注 ID 相同 | 开启 `extensions.footnote.enableAutoIDPrefix`；注意上游说明该前缀对每个逻辑路径唯一，跨语言维度并不唯一 |
| 报错看不懂，且指向外部程序 | 替代处理器（Pandoc、Asciidoctor 等）未安装或未被安全策略放行 | 见[配置安全](/configuration/security/)与[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。

[^1]: 详见 [相关提交说明](https://github.com/gohugoio/hugo-goldmark-extensions/commit/4d4fcd022fe45a9b51483df001c9e5f4e632d5a9)。
