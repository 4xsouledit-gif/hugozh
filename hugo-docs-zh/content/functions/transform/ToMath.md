+++
title = "transform.ToMath"
linkTitle = "ToMath"
description = "返回把用 LaTeX 语言书写的给定数学标记渲染为 HTML 后的结果。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/transform/tomath/"

[params.functions_and_methods]
signatures = ["transform.ToMath INPUT [OPTIONS]"]
returnType = "template.HTML"
+++

## 这一页解决什么问题

内容里要放数学公式。常见的做法是引入 MathJax/KaTeX 的客户端 JavaScript，让浏览器在页面上现场渲染——代价是额外的脚本、闪烁（FOUC）和 SEO 上的空白。`transform.ToMath` 在**构建时**就把 LaTeX 渲染成 HTML/MathML，产物是静态标记，不需要客户端脚本。

## 什么时候用，什么时候别用

**该用**：

- 站点里有零散的公式，想构建期渲染、产物静态化；
- 配合 Goldmark 的[透传扩展][]和[透传渲染钩子][]，把 `\( \)`、`\[ \]` 里的 LaTeX 交给它（上游完整示例给了四步做法）；
- 想自定义渲染选项（`displayMode`、`output`、`macros`、`throwOnError`）。

**别用**：

- 公式很少、且站点已经在用 MathJax → 不必迁移；两套方案不要混用；
- 想把公式当**图片**交给 `alt`/RSS → 本函数输出的是 HTML 标记，不是图片；
- 只想要行内等宽代码 → 用 Markdown 行内代码；
- 想渲染化学式以外的特殊排版排版系统 → 只支持 LaTeX（含 `mhchem` 扩展）。

Hugo 使用 [KaTeX][] 显示引擎的内嵌实例把数学标记渲染为 HTML。你不需要安装 KaTeX 显示引擎。

```go-html-template
{{ transform.ToMath "c = \\pm\\sqrt{a^2 + b^2}" }}
```

Hugo 把结果缓存到磁盘上的 [`misc`][] 文件缓存中，因此用相同参数多次调用该函数不会带来额外开销。

> [!NOTE]
> 默认情况下，Hugo 把数学标记渲染为 [MathML][]，显示结果不需要任何 CSS。
>
> 为兼顾渲染质量与无障碍访问，可按下文所述使用 `htmlAndMathml` 输出选项。这种方式需要外部样式表。

```go-html-template
{{ $opts := dict "output" "htmlAndMathml" }}
{{ transform.ToMath "c = \\pm\\sqrt{a^2 + b^2}" $opts }}
```

## 选项

`transform.ToMath` 函数接受一个选项映射。这些选项是 KaTeX [渲染选项][]的子集。

`displayMode`
: （`bool`）是否以显示模式而不是行内模式渲染。默认 `false`。

`errorColor`
: （`string`）错误信息的颜色，用 RGB [十六进制颜色][]表示。默认 `#cc0000`。

`fleqn`
: （`bool`）是否左对齐渲染，并留出 2em 的左外边距。默认 `false`。

`macros`
: （`map`）数学表达式中使用的宏映射。默认 `{}`。

  ```go-html-template
  {{ $macros := dict
    "\\addBar" "\\bar{#1}"
    "\\bold" "\\mathbf{#1}"
  }}
  {{ $opts := dict "macros" $macros }}
  {{ transform.ToMath "\\addBar{y} + \\bold{H}" $opts }}
  ```

`minRuleThickness`
: （`float`）分数线的最小粗细，单位为 `em`。默认 `0.04`。

`output`
: （`string`）决定输出的标记语言，取 `html`、`mathml` 或 `htmlAndMathml` 之一。默认 `mathml`。

  使用 `html` 与 `htmlAndMathml` 时，必须在 _base_ 模板的 `head` 元素中引入 KaTeX 样式表。

  ```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css" integrity="sha384-u1zONI5gPXUx0UKI62c75/zww972y0v2rSK5ZYlVdS6xEuWDeZWUI66v6t1gvlXJ" crossorigin="anonymous">
  ```

`strict`
: （0.147.6 新增）
: （`string`）控制 KaTeX 如何处理那些用起来方便、但并未正式支持的 LaTeX 特性，取 `error`、`ignore` 或 `warn` 之一。默认 `error`。

  - `error`：遇到方便但不受支持的 LaTeX 特性时抛出错误。
  - `ignore`：允许使用方便但不受支持的 LaTeX 特性，不给出任何反馈。
  - `warn`：（0.147.7 新增）遇到方便但不受支持的 LaTeX 特性时发出警告。

  `newLineInDisplayMode` 错误码用于标记在数组或表格环境之外的显示模式中使用了 `\\` 或 `\newline`；尽管这种行为值得商榷，它被有意设计为不抛出错误。

`throwOnError`
: （`bool`）KaTeX 遇到不支持的命令或非法 LaTeX 时是否抛出 `ParseError`。默认 `true`。

## 错误处理

处理错误有三种方式：

1. 让 KaTeX 抛出错误并导致构建失败。这是默认行为。
1. 把 `throwOnError` 选项设为 `false`，让 KaTeX 把表达式渲染为错误提示，而不是抛出错误。参见[选项](#选项)。
1. 在模板中自行处理错误。

下面的示例演示了在模板中处理错误。

## 示例

与其用 MathJax 或 KaTeX 在客户端用 JavaScript 渲染数学标记，不如创建一个透传渲染钩子（passthrough render hook）来调用 `transform.ToMath` 函数。

Step 1
: 在项目配置中启用并配置 Goldmark 的[透传扩展][]。透传扩展会保留定界文本片段中的原始 Markdown，包括定界符本身。

  ```toml
  [markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
  block = [['\[', '\]'], ['$$', '$$']]
  inline = [['\(', '\)']]
  ```

  > [!NOTE]
  > 上面的配置排除了用 `$...$` 这对定界符书写行内公式的可能。虽然可以把这对定界符加进配置，但此后在数学环境之外使用 `$` 符号时必须双重转义，以免产生意料之外的排版。

Step 2
: 创建一个[透传渲染钩子][]，用来捕获并渲染 LaTeX 标记。

  ```go-html-template {file="layouts/_markup/render-passthrough.html" copy=true}
  {{- $opts := dict "output" "htmlAndMathml" "displayMode" (eq .Type "block") }}
  {{- with try (transform.ToMath .Inner $opts) }}
    {{- with .Err }}
      {{- errorf "Unable to render mathematical markup to HTML using the transform.ToMath function. The KaTeX display engine threw the following error: %s: see %s." . $.Position }}
    {{- else }}
      {{- .Value }}
      {{- $.Page.Store.Set "hasMath" true }}
    {{- end }}
  {{- end -}}
  ```

Step 3
: 在 _base_ 模板中按条件把 KaTeX CSS 引入 head 元素。

  ```go-html-template {file="layouts/baseof.html" copy=true}
  <head>
    {{ $noop := .WordCount }}
    {{ if .Page.Store.Get "hasMath" }}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css" integrity="sha384-u1zONI5gPXUx0UKI62c75/zww972y0v2rSK5ZYlVdS6xEuWDeZWUI66v6t1gvlXJ" crossorigin="anonymous">
    {{ end }}
  </head>
  ```

  上面用到了一个 noop 语句，用于在通过 `Store.Get` 方法检查 `hasMath` 的值之前强制渲染内容。

  > [!NOTE]
  > 这种按条件引入的方式只能识别当前页面上的数学公式。当一个页面的内容被嵌入另一个页面时，数学表达式将无法正确显示。例如，如果列表页在遍历页面集合时调用了 [`Content`][] 或 [`Summary`][] 方法，该列表页就不会加载 KaTeX CSS。
  >
  > 如果这会影响你的站点，请改用下面的条件判断：
  >
  > ```go-html-template {file="layouts/baseof.html" copy=true}
  > {{ $noop := .WordCount }}
  > {{ if or (.Page.Store.Get "hasMath") .IsNode }}
  >   <link rel="stylesheet" href="...">
  > {{ end }}
  > ```

Step 4
: 在内容中加入一些数学标记，然后测试。

  ```md {file="content/example.md"}
  This is an inline \(a^*=x-b^*\) equation.

  These are block equations:

  \[a^*=x-b^*\]

  $$a^*=x-b^*$$
  ```

## 化学式

（0.144.0 新增）

你还可以用 `transform.ToMath` 函数渲染化学方程式，它利用了 [`mhchem`][] 包中的 `\ce` 与 `\pu` 函数。

```md
$$C_p[\ce{H2O(l)}] = \pu{75.3 J // mol K}$$
```

$$C_p[\ce{H2O(l)}] = \pu{75.3 J // mol K}$$

## 完整示例：构建期渲染一个行内公式

```go-html-template {file="layouts/_partials/math.html"}
{{ transform.ToMath "x" }}
{{ transform.ToMath "E = mc^2" (dict "displayMode" true) }}
```

Hugo 渲染为（默认 `output = mathml`，两行输出之间只差一个 `display="block"` 属性）：

```html
<span class="katex"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span>
<span class="katex"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">E = mc^2</annotation></semantics></math></span>
```

**你应当看到什么**：默认输出是 **MathML**（纯标记，不需要 CSS）；`displayMode = true` 只是给 `<math>` 加上 `display="block"`。换成 `output = "html"` 时，输出变成 `<span class="katex-html" aria-hidden="true">…` 这类依赖 KaTeX 样式表的标记——**必须**在 `<head>` 里引入 KaTeX CSS（上游已给出 CDN 链接）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 调用 | 结果 | 是否报错 |
| --- | --- | --- |
| `transform.ToMath "x"` | `<span class="katex"><math …><mrow><mi>x</mi></mrow>…` | 否 |
| `(dict "displayMode" true)` | 同上，`<math>` 增加 `display="block"` | 否 |
| `(dict "output" "html")` | `<span class="katex"><span class="katex-html" aria-hidden="true">…`（需要 KaTeX CSS） | 否 |
| 空字符串 `""` | 仍然输出完整的空公式结构（`<mrow></mrow>`） | 否 |
| 非法 LaTeX（如 `"\\frac{1}{"`） | —— | 是：`error calling ToMath: KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: \frac{1}{` |
| 同一非法输入 + `(dict "throwOnError" false)` | 渲染为错误提示：`<span class="katex-error" title="ParseError: …" style="color:#cc0000">\frac{1}{</span>` | 否 |
| 返回类型 | `template.HTML` | 否 |

> [!TIP]
> 在模板里想「拿到错误而不是让构建失败」，用上游示例推荐的写法：`{{ with try (transform.ToMath .Inner $opts) }}`，再检查 `.Err`。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建失败 | `KaTeX parse error: …` 让整站构建中断 | `throwOnError` 默认 `true` | 修好 LaTeX；或设 `throwOnError = false`；或在模板里用 `try` 捕获（见上游示例） |
| 没报错但结果不对 | 用 `output = "html"` 时公式显示异常 | 该模式依赖 KaTeX 样式表 | 按上游 Step 3 在 `head` 里引入 KaTeX CSS |
| 没报错但结果不对 | 列表页里公式正常、详情页里样式缺失（或反之） | 条件引入 CSS 时只识别当前页面（上游 NOTE 已说明） | 用上游给出的 `.Page.Store.Get "hasMath"` 加 `.IsNode` 的写法 |
| 没报错但结果不对 | 行内 `$...$` 不生效 | 透传扩展需要配置定界符，默认不含 `$...$` | 按上游 Step 1 配置 `markup.goldmark.extensions.passthrough` |
| 报错看不懂 | 错误里出现 `\frac`、`\ce` 等命令名 | KaTeX 不认识该命令或参数不完整 | 对照 KaTeX 支持的命令；化学式需要 `\ce`/`\pu`（0.144.0 起支持） |

更多排查入口见[故障排查](/troubleshooting/)。

[KaTeX]: https://katex.org/
[MathML]: https://developer.mozilla.org/en-US/docs/Web/MathML
[`Content`]: /methods/page/content/
[`Summary`]: /methods/page/summary/
[`mhchem`]: https://mhchem.github.io/MathJax-mhchem/
[`misc`]: /configuration/caches/#键
[十六进制颜色]: https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
[透传扩展]: /configuration/markup/#passthrough
[透传渲染钩子]: /render-hooks/passthrough/
[渲染选项]: https://katex.org/docs/options.html
