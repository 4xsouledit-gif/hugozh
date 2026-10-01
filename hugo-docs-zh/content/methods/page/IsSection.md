+++
title = "IsSection"
linkTitle = "IsSection"
description = "报告给定页面是否为 section 页面。"
date = 2026-10-02
weight = 350
source = "https://gohugo.io/methods/page/issection/"

[params.functions_and_methods]
signatures = ["PAGE.IsSection"]
returnType = "bool"
+++

如果[页面种类](g)为 `section`，`Page` 对象上的 `IsSection` 方法就返回 `true`。

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
{{ .IsSection }}
```
