+++
title = "CurrentSection"
linkTitle = "CurrentSection"
description = "返回给定页面所在 section 的 Page 对象。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/page/currentsection/"

[params.functions_and_methods]
signatures = ["PAGE.CurrentSection"]
returnType = "page.Page"
+++

[section（内容区块）](/quick-reference/glossary/section/)

> [!NOTE]
> [section 页](g)、[分类法页](g)、[术语页](g)或首页的当前 section 就是它自身。

内容结构如下：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md     <-- current section: 2023-11
│   │   ├── auction-1.md
│   │   └── auction-2.md  <-- current section: 2023-11
│   ├── 2023-12/
│   │   ├── _index.md
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md         <-- current section: auctions
│   ├── bidding.md
│   └── payment.md        <-- current section: auctions
├── books/
│   ├── _index.md         <-- current section: books
│   ├── book-1.md
│   └── book-2.md         <-- current section: books
├── films/
│   ├── _index.md         <-- current section: films
│   ├── film-1.md
│   └── film-2.md         <-- current section: films
└── _index.md             <-- current section: home
```

要创建指向当前 section 页面的链接：

```go-html-template
<a href="{{ .CurrentSection.RelPermalink }}">{{ .CurrentSection.LinkTitle }}</a>
```
