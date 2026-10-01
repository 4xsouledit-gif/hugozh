+++
title = "Plain"
linkTitle = "Plain"
description = "返回给定页面渲染后的内容，并移除所有 HTML 标签。"
date = 2026-10-02
weight = 560
source = "https://gohugo.io/methods/page/plain/"

[params.functions_and_methods]
signatures = ["PAGE.Plain"]
returnType = "string"
+++

`Page` 对象上的 `Plain` 方法会把 Markdown 和[短代码](g)渲染为 HTML，然后剥离 HTML [标签][]。它不会剥离 HTML [实体][]。

要阻止 Go 的 [`html/template`][] 包转义 HTML 实体，请把结果传给 [`htmlUnescape`][] 函数。

```go-html-template
{{ .Plain | htmlUnescape }}
```

[`html/template`]: https://pkg.go.dev/html/template
[`htmlUnescape`]: /functions/transform/htmlunescape/
[entities]: https://developer.mozilla.org/en-US/docs/Glossary/Entity
[tags]: https://developer.mozilla.org/en-US/docs/Glossary/Tag
