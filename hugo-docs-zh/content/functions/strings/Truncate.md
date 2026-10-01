+++
title = "strings.Truncate"
linkTitle = "Truncate"
description = "返回给定字符串，截断到最大长度，同时不切断单词、不留下未闭合的 HTML 标签。"
date = 2026-10-02
weight = 320
source = "https://gohugo.io/functions/strings/truncate/"

[params.functions_and_methods]
signatures = ["strings.Truncate SIZE [ELLIPSIS] STRING"]
returnType = "template.HTML"
aliases = ["truncate"]
+++

截断被标记为安全 HTML 的值（例如 [`safe.HTML`][] 函数返回的值）时，`strings.Truncate` 会补全因截断而未闭合的标签，而不是从标签中间切断：

```go-html-template
{{ "<em>Keep my HTML</em>" | safeHTML | strings.Truncate 10 }} → <em>Keep my …</em>
```

> [!NOTE]
> 如果有一段包含 HTML 标签的原始字符串需要按 HTML 处理，请先用 [`safe.HTML`][] 函数转换；否则 `strings.Truncate` 会转义这些标签。

[`safe.HTML`]: /functions/safe/html/
