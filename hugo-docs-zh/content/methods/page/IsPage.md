+++
title = "IsPage"
linkTitle = "IsPage"
description = "报告给定页面是否为常规页面。"
date = 2026-10-02
weight = 340
source = "https://gohugo.io/methods/page/ispage/"

[params.functions_and_methods]
signatures = ["PAGE.IsPage"]
returnType = "bool"
+++

如果[页面种类](g)为 `page`，`Page` 对象上的 `IsPage` 方法就返回 `true`。

```tree
content/
├── books/
│   ├── book-1/
│   │   └── index.md  <-- kind = page
│   ├── book-2.md     <-- kind = page
│   └── _index.md     <-- kind = section
└── _index.md         <-- kind = home
```

```go-html-template
{{ .IsPage }}
```
