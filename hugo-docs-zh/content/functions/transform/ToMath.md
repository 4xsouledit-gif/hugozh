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
