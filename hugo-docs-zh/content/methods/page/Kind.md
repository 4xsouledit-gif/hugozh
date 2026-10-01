+++
title = "Kind"
linkTitle = "Kind"
description = "返回给定页面的种类。"
date = 2026-10-02
weight = 380
source = "https://gohugo.io/methods/page/kind/"

[params.functions_and_methods]
signatures = ["PAGE.Kind"]
returnType = "string"
+++

[页面种类](g)是 `home`、`page`、`section`、`taxonomy` 或 `term` 之一。

```tree
content/
├── books/
│   ├── book-1/
│   │   └── index.md    <-- kind = page
│   ├── book-2.md       <-- kind = page
│   └── _index.md       <-- kind = section
├── tags/
│   ├── fiction/
│   │   └── _index.md   <-- kind = term
│   └── _index.md       <-- kind = taxonomy
└── _index.md           <-- kind = home
```

在模板中取值：

```go-html-template
{{ .Kind }}
```
