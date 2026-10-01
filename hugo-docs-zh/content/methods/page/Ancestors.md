+++
title = "Ancestors"
linkTitle = "Ancestors"
description = "返回 Page 对象集合，给定页面的每一级祖先 section 各对应一个对象。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/page/ancestors/"

[params.functions_and_methods]
signatures = ["PAGE.Ancestors"]
returnType = "page.Pages"
+++

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
│   ├── _index.md         <-- front matter: weight = 10
│   ├── book-1.md
│   └── book-2.md
├── films/
│   ├── _index.md         <-- front matter: weight = 20
│   ├── film-1.md
│   └── film-2.md
└── _index.md
```

模板如下：

```go-html-template
{{ range .Ancestors }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

在 2023 年 11 月的拍卖页面上，Hugo 渲染出：

```html
<a href="/auctions/2023-11/">Auctions in November 2023</a>
<a href="/auctions/">Auctions</a>
<a href="/">Home</a>
```

上面的例子中可以看到，Hugo 按由近及远的顺序排列祖先。这样实现面包屑导航就很简单：

```go-html-template
<nav aria-label="breadcrumb" class="breadcrumb">
  <ol>
    {{ range .Ancestors.Reverse }}
      <li>
        <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
      </li>
    {{ end }}
    <li class="active">
      <a aria-current="page" href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
    </li>
  </ol>
</nav>
```

再配合一些 CSS，上面的代码会渲染出类似下面的效果，其中每段面包屑都链接到对应页面：

```text
Home > Auctions > Auctions in November 2023 > Auction 1
```
