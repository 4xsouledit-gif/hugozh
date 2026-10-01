+++
title = "原样透传"
linkTitle = "原样透传"
description = "创建透传渲染钩子，处理 Goldmark 透传扩展捕获的文本片段，例如在构建时渲染公式。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/render-hooks/passthrough/"
+++

## 概述

Hugo 使用 [Goldmark](https://github.com/yuin/goldmark) 把 Markdown 渲染为 HTML。Goldmark 支持通过自定义扩展来扩展核心功能。[Passthrough](https://gohugo.io/configuration/markup/) 扩展会捕获并保留被定界符包围的原始 Markdown 文本片段，连定界符本身也一并保留。这类片段称为**透传元素**（passthrough element）。

取决于所选用的定界符，Hugo 会把透传元素归类为**块级**（block）或**行内**（inline）。看下面这个刻意构造的例子：

```md
This is a

\[block\]

passthrough element with opening and closing block delimiters.

This is an \(inline\) passthrough element with opening and closing inline delimiters.
```

需要在项目配置中启用 Passthrough 扩展，并为每种透传元素类型（`block` 或 `inline`）定义起始与结束定界符。例如：

```toml
[markup.goldmark.extensions.passthrough]
enable = true
[markup.goldmark.extensions.passthrough.delimiters]
block = [['\[', '\]'], ['$$', '$$']]
inline = [['\(', '\)']]
```

上例为 `block` 定义了两组定界符，在 Markdown 中使用其中任意一组都可以。

Passthrough 扩展常与 MathJax 或 KaTeX 显示引擎搭配使用，用来渲染以 LaTeX 标记语言书写的[数学表达式](/content-management/mathematics/)。

要启用透传元素的自定义渲染，需创建透传渲染钩子。

## 上下文

透传**渲染钩子**模板接收以下上下文：

`Attributes`
: （`map`）[Markdown 属性](/content-management/markdown-attributes/)，需要按下面的方式配置站点后才可用：

  ```toml
  [markup.goldmark.parser.attribute]
  block = true
  ```

  Hugo 只为**块级**透传元素填充 `Attributes` 映射；Markdown 属性不适用于**行内**元素。

`Inner`
: （`string`）透传元素的内层内容，不含定界符。

`Ordinal`
: （`int`）透传元素在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`Position`
: （`string`）透传元素在页面内容中的位置。

`Type`
: （`string`）透传元素类型，取值为 `block` 或 `inline`。

## 示例

与其在浏览器端用 MathJax 或 KaTeX 通过 JavaScript 渲染数学标记，不如创建一个透传渲染钩子，在构建时调用 `transform.ToMath` 函数完成渲染：

```go-html-template
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

随后在**基础**模板中，按条件在 `head` 元素内引入 KaTeX 的 CSS：

```go-html-template
<head>
  {{ $noop := .WordCount }}
  {{ if .Page.Store.Get "hasMath" }}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css" integrity="sha384-u1zONI5gPXUx0UKI62c75/zww972y0v2rSK5ZYlVdS6xEuWDeZWUI66v6t1gvlXJ" crossorigin="anonymous">
  {{ end }}
</head>
```

上面的写法用了一个空操作（noop）语句，强制先完成内容渲染，再用 `Store.Get` 方法检查 `hasMath` 的值。

尽管可以像上面那样用一个模板加条件逻辑处理，也可以为每种透传元素 `Type` 创建单独的模板：

```tree
layouts/
  └── _markup/
      ├── render-passthrough-block.html
      └── render-passthrough-inline.html
```

## PageInner details

`PageInner` 的主要用途是相对于被包含的页面来解析链接与页面资源。例如可以创建一个「包含」短代码，用多个内容文件拼装一个页面，同时为脚注与目录保留全局上下文：先用位置参数取出要包含的页面逻辑路径，再调用该页面的 `RenderShortcodes` 方法，取不到页面时用 `errorf` 报错。

然后在 Markdown 中用 Markdown 记法调用这个短代码，被包含页面的路径写在位置参数里。渲染 `/posts/post-2` 时触发的任何渲染钩子，调用 `Page` 会得到 `/posts/post-1`，调用 `PageInner` 则会得到 `/posts/post-2`。

`PageInner` 在不适用时会回退为 `Page` 的值，并且始终有返回值。它只对调用 `RenderShortcodes` 方法的短代码有意义，并且必须以 Markdown 记法调用该短代码。
