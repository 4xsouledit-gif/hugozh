+++
title = "IsBranch"
linkTitle = "IsBranch"
description = "报告给定页面是否为一个分支包。"
date = 2026-10-02
weight = 290
source = "https://gohugo.io/methods/page/isbranch/"

[params.functions_and_methods]
signatures = ["PAGE.IsBranch"]
returnType = "bool"
+++

**（0.163.0 新增）**

[分支](g)

```tree
content/
├── books/
│   ├── book-1/
│   │   └── index.md    <-- kind = page      IsBranch = false
│   ├── book-2.md       <-- kind = page      IsBranch = false
│   └── _index.md       <-- kind = section   IsBranch = true
├── tags
│   ├── fiction
│   │   └── _index.md   <-- kind = term      IsBranch = true
│   └── _index.md       <-- kind = taxonomy  IsBranch = true
└── _index.md           <-- kind = home      IsBranch = true
```

```go-html-template
{{ .IsBranch }}
```
