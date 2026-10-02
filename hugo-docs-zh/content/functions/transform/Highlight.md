+++
title = "transform.Highlight"
linkTitle = "Highlight"
description = "返回用语法高亮器渲染后的给定代码。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/transform/highlight/"

[params.functions_and_methods]
signatures = ["transform.Highlight CODE [LANG] [OPTIONS]"]
returnType = "template.HTML"
aliases = ["highlight"]
+++

## 这一页解决什么问题

模板里有一段**字符串形式的代码**（来自数据文件、短代码参数、`.Content` 的片段，或你自己拼的示例），要在页面上以带语法高亮、带等宽字体的代码块呈现。Hugo 内置的 Chroma 高亮器就是干这个的，`transform.Highlight` 是它的模板入口。

`highlight` 与 `transform.Highlight` 是同一个函数：前者是别名（注意它在全局命名空间里，写法是 `{{ highlight ... }}`）。

## 什么时候用，什么时候别用

**该用**：

- 代码来自变量/数据文件，不是页面里的围栏代码块；
- 需要控制行号、配色、行内高亮等选项；
- 想在短代码里包装高亮逻辑。

**别用**：

- 页面 **Markdown 里的围栏代码块** → Hugo 会自动高亮，不需要手动调用（想要自定义渲染才写[代码块渲染钩子](/render-hooks/code-blocks/)，那里面用 [`transform.HighlightCodeBlock`](/functions/transform/highlightcodeblock/)）；
- 想先确认语言认不认识 → 用 [`transform.CanHighlight`](/functions/transform/canhighlight/)；
- 想把 Markdown 渲染成 HTML → 用 [`transform.Markdownify`](/functions/transform/markdownify/)；
- 需要「高亮 + 文件名标题 + 复制按钮」这类结构 → 用渲染钩子或短代码包装，而不是每次手写一堆选项。

`transform.Highlight` 函数使用 [`alecthomas/chroma`][] 包，根据传入的代码、[语言][]与[选项](#选项)生成带语法高亮的 HTML。

## 参数

`CODE`
: （`string`）要高亮的代码。

`LANG`
: （`string`）要高亮的代码的[语言][]。该值大小写不敏感。可选；也可以用 OPTIONS 中的 `type` 键设置语言。（0.162.0 新增）

`OPTIONS`
: （`map` 或 `string`）一个映射，或包在引号里的逗号分隔键值对。参见下文[选项](#选项)；可以为每个选项在[项目配置][]中设置默认值。键名大小写不敏感。

## 示例

```go-html-template
{{ $input := `fmt.Println("Hello World!")` }}
{{ transform.Highlight $input "go" }}

{{ $input := `console.log('Hello World!');` }}
{{ $lang := "js" }}
{{ transform.Highlight $input $lang "lineNos=table, style=api" }}

{{ $input := `echo "Hello World!"` }}
{{ $lang := "bash" }}
{{ $opts := dict "lineNos" "table" "style" "dracula" }}
{{ transform.Highlight $input $lang $opts }}

{{ $input := `print("Hello World!")` }}
{{ $opts := dict "type" "python" "style" "dracula" }}
{{ transform.Highlight $input $opts }}
```

## 选项

`transform.Highlight` 函数接受一个选项映射。

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

## 完整示例：高亮一段字符串代码

```go-html-template {file="layouts/_partials/hl.html"}
{{ $code := "x = 1" }}
{{ transform.Highlight $code "python" }}
```

Hugo 渲染为（默认 `noClasses = true`，样式内联；为便于阅读这里按原样给出，未换行）：

```html
<div class="highlight"><pre tabindex="0" style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-text-size-adjust:none;"><code class="language-python" data-lang="python"><span style="display:flex;"><span>x <span style="color:#f92672">=</span> <span style="color:#ae81ff">1</span></span></span></code></pre></div>
```

**你应当看到什么**：外层是 `<div class="highlight">`（类名可用 `wrapperClass` 改），里面是 `<pre><code class="language-python" data-lang="python">`，关键字与数字被包进带内联颜色的 `<span>`。**默认输出自带颜色**（`noClasses` 默认 `true`），不需要额外 CSS；反过来，想用自己的 CSS 就要设 `noClasses = false` 并用 `hugo gen chromastyles` 生成样式表。

**语言不认识时不会报错**：实测 `transform.Highlight "x = 1" "klingon"` 退化为

```html
<pre tabindex="0"><code class="language-klingon" data-lang="klingon">x = 1</code></pre>
```

——没有 `<div class="highlight">` 包裹、也没有任何颜色，只是普通的 `<pre><code>`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows，默认高亮配置（`style = monokai`、`noClasses = true`）。

| 调用 | 结果 | 是否报错 |
| --- | --- | --- |
| `transform.Highlight "x = 1" "python"` | `<div class="highlight">…<code class="language-python" data-lang="python">…` | 否 |
| 语言名不认识（`"klingon"`） | 退化为 `<pre tabindex="0"><code class="language-klingon" …>`，无高亮、无外层 `div` | 否 |
| 空代码（`""`） | 仍输出完整包裹，`<code>` 内容为空 | 否 |
| 用 OPTIONS 代替 LANG（`(dict "type" "python")`） | 与显式传 `"python"` 相同 | 否 |
| 字符串形式的选项（`"lineNos=false, style=github"`） | 生效，输出改用对应配色 | 否 |
| 返回类型 | `template.HTML`（不会再被 HTML 转义） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上代码是黑白的，没有高亮 | 语言名拼错（实测会静默退化为纯 `<pre><code>`） | 用 [`transform.CanHighlight`](/functions/transform/canhighlight/) 先判断，必要时退回 `text` |
| 没报错但结果不对 | 想用自己的配色，但样式没生效 | `noClasses` 默认 `true`，颜色是内联的 | 设 `noClasses = false` 并用 [`hugo gen chromastyles`](/commands/hugo-gen-chromastyles/) 生成 CSS |
| 没报错但结果不对 | 行号没有出现 | `lineNos` 默认 `false` | 传 `lineNos=table`（或 `true`、`inline`） |
| 没报错但结果不对 | 输出里出现 `{{` 字面量 | 代码字符串本身含模板定界符，而它经过了模板解析 | 用短代码或数据文件传入，别把代码直接写进模板 |
| 报错看不懂 | 选项名拼错后无任何提示 | 未知选项被忽略（实测） | 对照本页「选项」一节核对键名 |

更多排查入口见[故障排查](/troubleshooting/)。

[`alecthomas/chroma`]: https://github.com/alecthomas/chroma
[`css.ChromaStyles`]: /functions/css/chromastyles/
[`hugo gen chromastyles`]: /commands/hugo-gen-chromastyles/
[项目配置]: /configuration/markup/#高亮
[语法高亮配色方案]: /quick-reference/syntax-highlighting-styles/
[语言]: /content-management/syntax-highlighting/#支持的语言
