+++
title = "Type"
linkTitle = "Type"
description = "返回给定页面的内容类型。"
date = 2026-10-02
weight = 870
source = "https://gohugo.io/methods/page/type/"

[params.functions_and_methods]
signatures = ["PAGE.Type"]
returnType = "string"
+++

`Page` 对象上的 `Type` 方法返回给定页面的[内容类型](g)。内容类型由前置元数据中的 `type` 字段定义；如果前置元数据中没有定义 `type` 字段，则根据顶层目录名推断。

内容结构如下：

```tree
content/
├── auction/
│   ├── _index.md
│   ├── item-1.md
│   └── item-2.md  <-- front matter: type = books
├── books/
│   ├── _index.md
│   ├── book-1.md
│   └── book-2.md
├── films/
│   ├── _index.md
│   ├── film-1.md
│   └── film-2.md
└── _index.md
```

要列出这些 book，而不论其属于哪个 [section](g)：

```go-html-template
{{ range where .Site.RegularPages.ByTitle "Type" "books" }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

Hugo 会把它渲染为;

```html
<h2><a href="/books/book-1/">Book 1</a></h2>
<h2><a href="/books/book-2/">Book 2</a></h2>
<h2><a href="/auction/item-2/">Item 2</a></h2>
```

前置元数据中的 `type` 字段在指定模板时也很有用。详见[说明][]。

[details]: /templates/lookup-order/#target-a-template
