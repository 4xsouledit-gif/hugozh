+++
title = "urls.JoinPath"
linkTitle = "JoinPath"
description = "把给定的元素拼接成一个 URL 字符串，并清理结果中的 ./ 与 ../ 元素；参数列表为空时返回空字符串。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/urls/joinpath/"

[params.functions_and_methods]
signatures = ["urls.JoinPath ELEMENT..."]
returnType = "string"
+++

```go-html-template
{{ urls.JoinPath }} → "" (empty string)
{{ urls.JoinPath "" }} → /
{{ urls.JoinPath "a" }} → a
{{ urls.JoinPath "a" "b" }} → a/b
{{ urls.JoinPath "/a" "b" }} → /a/b
{{ urls.JoinPath "https://example.org" "b" }} → https://example.org/b

{{ urls.JoinPath (slice "a" "b") }} → a/b
```

与 [`path.Join`][] 函数不同，`urls.JoinPath` 会保留开头连续的斜杠。

[`path.Join`]: /functions/path/join/
