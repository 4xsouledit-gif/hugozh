+++
title = "safe.HTMLAttr"
linkTitle = "HTMLAttr"
description = "返回被声明为安全 HTML 属性的给定键值对。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/safe/htmlattr/"

[params.functions_and_methods]
signatures = ["safe.HTMLAttr INPUT"]
returnType = "template.HTMLAttr"
aliases = ["safeHTMLAttr"]
+++

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.HTMLAttr` 函数封装来自可信来源的 HTML 属性。

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ with .Date }}
  {{ $humanDate := time.Format "2 Jan 2006" . }}
  {{ $machineDate := time.Format "2006-01-02T15:04:05-07:00" . }}
  <time datetime="{{ $machineDate }}">{{ $humanDate }}</time>
{{ end }}
```

Hugo 将上述代码渲染为：

```html
<time datetime="2024-05-26T07:19:55&#43;02:00">26 May 2024</time>
```

要把该键值对声明为安全：

```go-html-template
{{ with .Date }}
  {{ $humanDate := time.Format "2 Jan 2006" . }}
  {{ $machineDate := time.Format "2006-01-02T15:04:05-07:00" . }}
  <time {{ printf "datetime=%q" $machineDate | safeHTMLAttr }}>{{ $humanDate }}</time>
{{ end }}
```

Hugo 将上述代码渲染为：

```html
<time datetime="2024-05-26T07:19:55+02:00">26 May 2024</time>
```

[Go documentation]: https://pkg.go.dev/html/template#HTMLAttr
