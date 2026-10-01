+++
title = "Sections"
linkTitle = "Sections"
description = "返回 section 页面集合，给定页面的每一个直属子 section 对应一个页面。"
date = 2026-10-02
weight = 750
source = "https://gohugo.io/methods/page/sections/"

[params.functions_and_methods]
signatures = ["PAGE.Sections"]
returnType = "page.Pages"
+++

`Page` 对象上的 `Sections` 方法可用于这些[页面类型](g)：`home`、`section` 和 `taxonomy`。这些页面类型的模板会在[上下文](g)中接收一个页面[集合](g)，并按[默认排序顺序](g)排列。

内容结构如下：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md     <-- front matter: weight = 202311
│   │   ├── auction-1.md
│   │   └── auction-2.md
│   ├── 2023-12/
│   │   ├── _index.md     <-- front matter: weight = 202312
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md         <-- front matter: weight = 30
│   ├── bidding.md
│   └── payment.md
├── books/
│   ├── _index.md         <-- front matter: weight = 20
│   ├── book-1.md
│   └── book-2.md
├── films/
│   ├── _index.md         <-- front matter: weight = 10
│   ├── film-1.md
│   └── film-2.md
└── _index.md
```

模板如下：

```go-html-template
{{ range .Sections.ByWeight }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

在首页上，Hugo 渲染出：

```html
<h2><a href="/films/">Films</a></h2>
<h2><a href="/books/">Books</a></h2>
<h2><a href="/auctions/">Auctions</a></h2>
```

在 auctions 页面上，Hugo 渲染出：

```html
<h2><a href="/auctions/2023-11/">Auctions in November 2023</a></h2>
<h2><a href="/auctions/2023-12/">Auctions in December 2023</a></h2>
```
