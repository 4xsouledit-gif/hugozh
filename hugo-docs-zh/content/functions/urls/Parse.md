+++
title = "urls.Parse"
linkTitle = "Parse"
description = "解析给定 URL，返回一个 URL 结构体。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/urls/parse/"

[params.functions_and_methods]
signatures = ["urls.Parse URL"]
returnType = "url.URL"
+++

`urls.Parse` 函数把 URL 解析为一个 [URL 结构体][URL structure]。URL 可以是相对形式（一条路径，没有主机名），也可以是绝对形式（以[方案][scheme]开头）。解析无效 URL 时 Hugo 会抛出错误。

```go-html-template
{{ $url := "https://example.org:123/foo?a=6&b=7#bar" }}
{{ $u := urls.Parse $url }}

{{ $u.String }} → https://example.org:123/foo?a=6&b=7#bar
{{ $u.IsAbs }} → true
{{ $u.Scheme }} → https
{{ $u.Host }} → example.org:123
{{ $u.Hostname }} → example.org
{{ $u.RequestURI }} → /foo?a=6&b=7
{{ $u.Path }} → /foo
{{ $u.RawQuery }} → a=6&b=7
{{ $u.Query }} → map[a:[6] b:[7]]
{{ $u.Query.a }} → [6]
{{ $u.Query.Get "a" }} → 6
{{ $u.Query.Has "b" }} → true
{{ $u.Fragment }} → bar
```

[URL structure]: https://godoc.org/net/url#URL
[scheme]: https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml#uri-schemes-1
