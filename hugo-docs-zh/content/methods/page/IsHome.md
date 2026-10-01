+++
title = "IsHome"
linkTitle = "IsHome"
description = "报告给定页面是否为首页。"
date = 2026-10-02
weight = 310
source = "https://gohugo.io/methods/page/ishome/"

[params.functions_and_methods]
signatures = ["PAGE.IsHome"]
returnType = "bool"
+++

如果[页面种类](g)为 `home`，`Page` 对象上的 `IsHome` 方法就返回 `true`。

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
{{ .IsHome }}
```
