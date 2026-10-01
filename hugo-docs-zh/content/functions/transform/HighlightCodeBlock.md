+++
title = "transform.HighlightCodeBlock"
linkTitle = "HighlightCodeBlock"
description = "返回代码块渲染钩子上下文中收到的、已高亮的代码。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/transform/highlightcodeblock/"

[params.functions_and_methods]
signatures = ["transform.HighlightCodeBlock CONTEXT [OPTIONS]"]
returnType = "highlight.HighlightResult"
+++

`transform.HighlightCodeBlock` 函数使用 [`alecthomas/chroma`][] 包，为代码块渲染钩子（render hook）上下文中收到的代码生成带语法高亮的 HTML。该函数只在代码块渲染钩子内有意义。

## 参数

CONTEXT
: 传入代码块渲染钩子的[上下文][]。

OPTIONS
: （`map`）键值对映射。参见下文[选项](#选项)。键名大小写不敏感。

## 返回值

`transform.HighlightCodeBlock` 返回一个 `HighlightResult` 对象，它有两个方法。

`Wrapped`
: （`template.HTML`）返回用 `<div>`、`<pre>`、`<code>` 元素包裹的高亮代码。它与 `transform.Highlight` 函数返回的值完全相同。

`Inner`
: （`template.HTML`）返回不带任何包裹元素的高亮代码，便于你自行包裹。

## 示例

```go-html-template
{{ $result := transform.HighlightCodeBlock . }}
{{ $result.Wrapped }}
```

要覆盖默认选项：

```go-html-template
{{ $opts := merge .Options (dict "lineNos" true) }}
{{ $result := transform.HighlightCodeBlock . $opts }}
{{ $result.Wrapped }}
```

当高亮器不支持该语言时退回纯文本：

```go-html-template
{{ $opts := dict }}
{{ if not (transform.CanHighlight .Type) }}
  {{ $opts = dict "type" "text" }}
{{ end }}
{{ $result := transform.HighlightCodeBlock . $opts }}
{{ $result.Wrapped }}
```

## 选项

`transform.HighlightCodeBlock` 函数接受一个选项映射。

`anchorLineNos`
: （`bool`）是否把每个行号渲染为 HTML 锚点元素，即把外层 `span` 元素的 `id` 属性设为行号。`lineNos` 为 `false` 时无意义。默认 `false`。

`codeFences`
: （`bool`）是否高亮围栏代码块。默认 `true`。

`guessSyntax`
: （`bool`）当 `LANG` 参数留空，或设为一个没有对应词法分析器（lexer）的语言时，是否自动识别语言。无法自动识别语言时回退为纯文本词法分析器。默认 `false`。

  > [!NOTE]
  > 语法高亮器内置约 300 种语言的词法分析器，但其中只有 5 种实现了自动语言识别。

`hl_Lines`
: （`string`）要高亮代码中需要强调的行，以空格分隔。要强调第 2、3、4、7 行，把该值设为 `2-4 7`。该选项与 `lineNoStart` 选项相互独立。

`hl_inline`
: （`bool`）是否渲染不带外层容器的高亮代码。默认 `false`。

`lineAnchors`
: （`string`）把行号渲染为 HTML 锚点元素时，将该值加在外层 `span` 元素的 `id` 属性之前。当一个页面包含两个或更多代码块时，这样可以得到唯一的 `id` 属性。`lineNos` 或 `anchorLineNos` 为 `false` 时无意义。

`lineNoStart`
: （`int`）第一行开头显示的行号。`lineNos` 为 `false` 时无意义。默认 `1`。

`lineNos`
: （`any`）控制行号的显示方式。默认 `false`。

  - `true`：启用行号，具体形式由 `lineNumbersInTable` 决定。
  - `false`：关闭行号。
  - `inline`：启用行内行号（把 `lineNumbersInTable` 设为 `false`）。
  - `table`：启用表格形式的行号（把 `lineNumbersInTable` 设为 `true`）。

`lineNumbersInTable`
: （`bool`）是否把高亮代码渲染为含两个单元格的 HTML 表格：左单元格放行号，右单元格放代码。`lineNos` 为 `false` 时无意义。默认 `true`。

`noClasses`
: （`bool`）是否使用内联 CSS 样式，而不使用外部 CSS 文件。默认 `true`。要使用外部 CSS 文件，请把该值设为 `false`，并用 [`hugo gen chromastyles`][] 命令生成 CSS 文件：

  ```sh
  hugo gen chromastyles --style=github > assets/css/highlight.css
  ```

  （0.164.0 新增）

  有些配色方案分别提供浅色与深色两套调色板。用 `--mode` 参数为指定模式生成样式表，用 `--modeSelector` 参数把每个选择器收拢到顶层模式类之下（例如 `.dark .chroma`）：

  ```sh
  hugo gen chromastyles --style=monokai --mode=light > assets/css/highlight.css
  hugo gen chromastyles --style=monokai --mode=dark --modeSelector > assets/css/highlight-dark.css
  ```

  在根元素上添加或移除 `dark` 类即可切换深色模式。省略 `--mode` 时，Hugo 按配色方案自身的默认模式生成样式表。

  也可以在模板中使用 [`css.ChromaStyles`][] 函数生成样式表。

`style`
: （`string`）应用到高亮代码上的 CSS 样式。该值大小写不敏感。默认 `monokai`。参见[语法高亮配色方案][]。

`tabWidth`
: （`int`）把高亮代码中的每个制表符替换为这么多个空格。`noClasses` 为 `false` 时无意义。默认 `4`。

`wrapperClass`
: （0.140.2 新增）
: （`string`）高亮代码最外层元素使用的类或类名列表。默认 `highlight`。

`code`
: （0.162.0 新增）
: （`string`）覆盖从代码块上下文收到的代码。

`type`
: （0.162.0 新增）
: （`string`）覆盖从代码块上下文收到的语言。

[`alecthomas/chroma`]: https://github.com/alecthomas/chroma
[`css.ChromaStyles`]: /functions/css/chromastyles/
[`hugo gen chromastyles`]: /commands/hugo-gen-chromastyles/
[上下文]: /render-hooks/code-blocks/#上下文
[语法高亮配色方案]: /quick-reference/syntax-highlighting-styles/
