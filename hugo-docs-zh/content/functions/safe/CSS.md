+++
title = "safe.CSS"
linkTitle = "CSS"
description = "返回被声明为安全 CSS 的给定字符串。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/safe/css/"

[params.functions_and_methods]
signatures = ["safe.CSS INPUT"]
returnType = "template.CSS"
aliases = ["safeCSS"]
+++

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.CSS` 函数封装已知安全、且符合以下任一项的内容：

1. CSS3 样式表产生式（stylesheet production），例如 `p { color: purple }`。
1. CSS3 规则产生式（rule production），例如 `a[href=~"https:"].foo#bar`。
1. CSS3 声明产生式（declaration production），例如 `color: red; margin: 2px`。
1. CSS3 值产生式（value production），例如 `rgba(0, 0, 255, 127)`。

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ $style := "color: red;" }}
<p style="{{ $style }}">foo</p>
```

Hugo 将上述代码渲染为：

```html
<p style="ZgotmplZ">foo</p>
```

> [!NOTE]
> `ZgotmplZ` 是一个特殊值，表示运行时有不安全的内容进入了 CSS 或 URL 上下文。

要把该字符串声明为安全：

```go-html-template
{{ $style := "color: red;" }}
<p style="{{ $style | safeCSS }}">foo</p>
```

Hugo 将上述代码渲染为：

```html
<p style="color: red;">foo</p>
```

[Go documentation]: https://pkg.go.dev/html/template#CSS
