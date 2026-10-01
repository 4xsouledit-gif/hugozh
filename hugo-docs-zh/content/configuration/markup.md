+++
title = "Markup 配置"
linkTitle = "Markup 配置"
description = "配置 Markdown 渲染器、代码高亮与目录生成参数。"
date = 2026-10-01
weight = 120
source = "https://gohugo.io/configuration/markup/"
+++

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

[^1]: 详见 [相关提交说明](https://github.com/gohugoio/hugo-goldmark-extensions/commit/4d4fcd022fe45a9b51483df001c9e5f4e632d5a9)。
