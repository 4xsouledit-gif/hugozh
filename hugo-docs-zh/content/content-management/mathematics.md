+++
title = "数学公式"
linkTitle = "数学公式"
description = "介绍在内容中排布数学公式的常见方案、配置与注意事项。"
date = 2026-10-01
weight = 200
source = "https://gohugo.io/content-management/mathematics/"
+++

## 概览

用 LaTeX 标记书写的数学公式在学术与科技内容中很常见，浏览器通常借助 MathJax 或 KaTeX 这类开源 JavaScript 排版引擎把它渲染出来。例如下面这段 LaTeX 标记：

```markdown
\[
\begin{aligned}
KL(\hat{y} || y) &= \sum_{c=1}^{M}\hat{y}_c \log{\frac{\hat{y}_c}{y_c}} \\
JS(\hat{y} || y) &= \frac{1}{2}(KL(y||\frac{y+\hat{y}}{2}) + KL(\hat{y}||\frac{y+\hat{y}}{2}))
\end{aligned}
\]
```

公式可以与正文同行显示（行内公式），也可以独占一块（块级公式，即 display 模式）。究竟按哪种方式呈现，取决于包裹标记的定界符（delimiter）。定界符成对出现，一对由开定界符与闭定界符组成，两者可以相同，也可以不同。

除了在客户端渲染，也可以选择在构建站点时用 `transform.ToMath` 函数把标记渲染成数学标记；本文介绍的是前一种做法。

## 配置 passthrough（原样透传）

第一步，在项目配置中启用并配置 Goldmark 的原样透传（passthrough）扩展。该扩展会在被定界符包住的片段中保留原始 Markdown，连定界符本身也一并保留：

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]

[params]
  math = true
```

上面的配置会让每个页面都渲染数学标记，除非在某页的前置元数据（front matter）中把 `math` 参数显式设为 `false`。若希望按页启用，则把项目配置里的 `math` 设为 `false`，只在需要公式的页面把前置元数据中的 `math` 设为 `true`，模板中的用法见下一步。

只保留块级公式、不要行内透传时，把 `inline` 一行删掉即可；也可以自定义成对的定界符，前提是与下一步 JavaScript 中的设置保持一致，例如块级用 `@@`、行内用 `@`。

需要注意：上面的配置排除了 `$...$` 这对行内定界符。虽然可以把它加进配置与 JavaScript，但此后在数学环境之外使用 `$` 符号时必须双重转义，否则会产生意料之外的排版，详见[行内定界符](#行内定界符)。

## 引入渲染脚本

第二步，创建一个局部模板（partial）来加载 MathJax 或 KaTeX。下面的例子加载 MathJax，保存为 `layouts/partials/math.html`：

```go-html-template
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js"></script>

<script>
  MathJax = {
    tex: {
      displayMath: [['\\[', '\\]'], ['$$', '$$']],  // 块级
      inlineMath: [['\\(', '\\)']]                  // 行内
    },
    loader: {
      load: ['ui/safe']
    },
  };
</script>
```

这里的定界符必须与项目配置中的一致。

## 按页加载脚本

第三步，在基础模板（base template）中按条件调用该局部模板：

```go-html-template
<head>
  {{ if .Param "math" }}
    {{ partialCached "math.html" . }}
  {{ end }}
</head>
```

页面在前置元数据中把 `math` 设为 `true` 时脚本才会加载；没有设置时，条件会回退到项目配置中的 `math` 参数。因此第四步是：若项目配置里把 `math` 设为 `false`，就必须在需要公式的页面前置元数据中把它设回 `true`：

```toml
title = '数学示例'
date = 2024-01-24T18:09:49-08:00

[params]
  math = true
```

## 书写公式

第五步，按声明的定界符书写公式。行内公式与块级公式分别写作：

```markdown
这是一个行内公式 \(a^*=x-b^*\)。

下面是块级公式：

\[a^*=x-b^*\]

$$a^*=x-b^*$$
```

块级公式独占一行，前后留出空行更稳妥。定界符之间不要混入其他 Markdown 结构。

## 行内定界符

上面的配置、JavaScript 与示例都用 `\(...\)` 作为行内定界符。`$...$` 是常见的替代写法，但在数学环境之外使用 `$` 符号时容易产生意料之外的排版。若确实要加入 `$...$`，在数学环境之外使用 `$` 时必须双重转义：

```markdown
只要你能解出 $y = x^2$，我就给你 \\$2。
```

此外，若使用了 `$...$` 又偶尔在数学环境之外写 `$`，必须选 MathJax 而不是 KaTeX，以避开 KaTeX 的[这一限制](https://github.com/KaTeX/KaTeX/issues/437)导致的错误排版。

## 排版引擎

MathJax 与 KaTeX 都是开源的 JavaScript 排版引擎，两者都能渲染本文的公式。要改用 KaTeX，把第二步的局部模板换成加载 KaTeX 的样式表与脚本（可以从库的 CDN 或发行包取得），并在 DOM 就绪后调用 `renderMathInElement` 渲染正文：

```go-html-template
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">

<script defer src="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex/dist/contrib/auto-render.min.js"
        onload="renderMathInElement(document.body);"></script>
```

自动渲染时传入的 `delimiters` 列表要与项目配置一致，并保留 `throwOnError: false` 之类的容错设置。若要使用 Markdown 写就的化学公式，MathJax 无需额外配置即可支持；KaTeX 需要按官方文档启用 mhchem 扩展：

```markdown
$$C_p[\ce{H2O(l)}] = \pu{75.3 J // mol K}$$
```

## 常见问题

- 开启透传后仍要确认前端库确实被加载，否则页面上只会显示公式源码。
- 使用 `$...$` 行内定界符时，数学环境之外的 `$` 必须双重转义；`$...$` 与 KaTeX 同时使用时排版容易出错，建议改用 MathJax。
- 项目配置与 JavaScript 中的定界符必须完全一致，改了一处就要同步另一处。
- 公式中出现 `{{` 之类的双花括号序列时，可能会与短代码（shortcode）定界符冲突，需要改写或在短代码中包裹处理，写法见[短代码](/shortcodes/)。
- 若公式在列表、表格或引用块中显示异常，先检查该处的定界符是否被 Markdown 结构拆开。

## 相关主题

- [内容管理](/content-management/)
- [配置 Hugo](/configuration/)
- [短代码](/shortcodes/)
