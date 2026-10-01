+++
title = "FirstSection"
linkTitle = "FirstSection"
description = "返回给定页面所属顶层 section 的 Page 对象。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/methods/page/firstsection/"

[params.functions_and_methods]
signatures = ["PAGE.FirstSection"]
returnType = "page.Page"
+++

[section（内容区块）](/quick-reference/glossary/section/)

> [!NOTE]
> 在首页上调用时，`FirstSection` 方法返回首页自身的 `Page` 对象。

内容结构如下：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md     <-- first section: auctions
│   │   ├── auction-1.md
│   │   └── auction-2.md  <-- first section: auctions
│   ├── 2023-12/
│   │   ├── _index.md
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md         <-- first section: auctions
│   ├── bidding.md
│   └── payment.md        <-- first section: auctions
├── books/
│   ├── _index.md         <-- first section: books
│   ├── book-1.md
│   └── book-2.md         <-- first section: books
├── films/
│   ├── _index.md         <-- first section: films
│   ├── film-1.md
│   └── film-2.md         <-- first section: films
└── _index.md             <-- first section: home
```

要链接到当前页面所属的顶层 section：

```go-html-template
<a href="{{ .FirstSection.RelPermalink }}">{{ .FirstSection.LinkTitle }}</a>
```
