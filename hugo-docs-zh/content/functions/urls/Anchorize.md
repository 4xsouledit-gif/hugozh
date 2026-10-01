+++
title = "urls.Anchorize"
linkTitle = "Anchorize"
description = "返回给定字符串，并把它清理为可用于 HTML id 属性的形式。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/urls/anchorize/"

[params.functions_and_methods]
signatures = ["urls.Anchorize INPUT"]
returnType = "string"
aliases = ["anchorize"]
+++

[`anchorize`][] 与 [`urlize`][] 两个函数很相似：

- 用 `anchorize` 函数生成 HTML `id` 属性的值
- 用 `urlize` 函数把字符串清理为可用于 URL 的形式

例如：

```go-html-template
{{ $s := "A B C" }}
{{ $s | anchorize }} → a-b-c
{{ $s | urlize }} → a-b-c

{{ $s := "a b   c" }}
{{ $s | anchorize }} → a-b---c
{{ $s | urlize }} → a-b-c

{{ $s := "< a, b, & c >" }}
{{ $s | anchorize }} → -a-b--c-
{{ $s | urlize }} → a-b-c

{{ $s := "main.go" }}
{{ $s | anchorize }} → maingo
{{ $s | urlize }} → main.go

{{ $s := "Hugö" }}
{{ $s | anchorize }} → hugö
{{ $s | urlize }} → hug%C3%B6
```

`urls.Anchorize` 函数会按项目配置中的 [`autoIDType`][] 设置清理结果字符串。

[`anchorize`]: /functions/urls/anchorize/
[`urlize`]: /functions/urls/urlize/
[`autoIDType`]: /configuration/markup/#parserautoidtype
