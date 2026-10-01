+++
title = "Parent"
linkTitle = "Parent"
description = "返回给定页面所属父 section 的 Page 对象。"
date = 2026-10-02
weight = 530
source = "https://gohugo.io/methods/page/parent/"

[params.functions_and_methods]
signatures = ["PAGE.Parent"]
returnType = "page.Page"
+++

[section（内容区块）](/quick-reference/glossary/section/)

> [!NOTE]
> 常规页面的父 section 就是[当前 section][]。

考虑如下内容结构：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md     <-- parent: auctions
│   │   ├── auction-1.md
│   │   └── auction-2.md  <-- parent: 2023-11
│   ├── 2023-12/
│   │   ├── _index.md
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md         <-- parent: home
│   ├── bidding.md
│   └── payment.md        <-- parent: auctions
├── books/
│   ├── _index.md         <-- parent: home
│   ├── book-1.md
│   └── book-2.md         <-- parent: books
├── films/
│   ├── _index.md         <-- parent: home
│   ├── film-1.md
│   └── film-2.md         <-- parent: films
└── _index.md             <-- parent: nil
```

上例中请注意，首页的父 section 是 `nil`。在调用其 `Page` 对象的方法之前，请先确认父 section 是否存在，以写出防御性代码。要创建指向当前页面父 section 页面的链接：

```go-html-template
{{ with .Parent }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

[current section]: /methods/page/currentsection/
