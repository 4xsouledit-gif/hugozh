+++
title = "transform.HTMLUnescape"
linkTitle = "HTMLUnescape"
description = "返回把每个 HTML 实体替换为对应字符后的给定字符串。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/transform/htmlunescape/"

[params.functions_and_methods]
signatures = ["transform.HTMLUnescape INPUT"]
returnType = "string"
aliases = ["htmlUnescape"]
+++

`transform.HTMLUnescape` 函数把 [HTML 实体][]替换为对应的字符。

```go-html-template
{{ htmlUnescape "Lilo &amp; Stitch" }} → Lilo & Stitch
{{ htmlUnescape "7 &gt; 6" }} → 7 > 6
```

在多数场景下，Go 的 [`html/template`][] 包会转义特殊字符。要绕过这一行为，请把未转义的字符串交给 [`safe.HTML`][] 函数。

```go-html-template
{{ htmlUnescape "Lilo &amp; Stitch" | safeHTML }}
```

[HTML 实体]: https://developer.mozilla.org/en-US/docs/Glossary/Entity
[`html/template`]: https://pkg.go.dev/html/template
[`safe.HTML`]: /functions/safe/html/
