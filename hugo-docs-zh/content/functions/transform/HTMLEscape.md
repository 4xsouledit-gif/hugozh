+++
title = "transform.HTMLEscape"
linkTitle = "HTMLEscape"
description = "返回把特殊字符替换为 HTML 实体后的给定字符串。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/transform/htmlescape/"

[params.functions_and_methods]
signatures = ["transform.HTMLEscape INPUT"]
returnType = "string"
aliases = ["htmlEscape"]
+++

`transform.HTMLEscape` 函数通过把五个特殊字符替换为 [HTML 实体][]来转义它们：

- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `'` → `&#39;`
- `"` → `&#34;`

例如：

```go-html-template
{{ htmlEscape "Lilo & Stitch" }} → Lilo &amp; Stitch
{{ htmlEscape "7 > 6" }} → 7 &gt; 6
```

[HTML 实体]: https://developer.mozilla.org/en-US/docs/Glossary/Entity
