+++
title = "safe.JSStr"
linkTitle = "JSStr"
description = "返回被声明为安全 JavaScript 字符串的给定字符串。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/safe/jsstr/"

[params.functions_and_methods]
signatures = ["safe.JSStr INPUT"]
returnType = "template.JSStr"
aliases = ["safeJSStr"]
+++

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.JSStr` 函数封装一段字符序列，用于嵌入 JavaScript 表达式中的引号之间。

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ $title := "Lilo & Stitch" }}
<script>
  const a = "Title: " + {{ $title }};
</script>
```

Hugo 将上述代码渲染为：

```html
<script>
  const a = "Title: " + "Lilo \u0026 Stitch";
</script>
```

要把该字符串声明为安全：

```go-html-template
{{ $title := "Lilo & Stitch" }}
<script>
  const a = "Title: " + {{ $title | safeJSStr }};
</script>
```

Hugo 将上述代码渲染为：

```html
<script>
  const a = "Title: " + "Lilo & Stitch";
</script>
```

[Go documentation]: https://pkg.go.dev/html/template#JSStr
