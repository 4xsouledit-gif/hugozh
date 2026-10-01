+++
title = "Sections"
linkTitle = "Sections"
description = "返回顶层 section 页面的集合。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/methods/site/sections/"

[params.functions_and_methods]
signatures = ["SITE.Sections"]
returnType = "page.Pages"
+++

`Site` 对象上的 `Sections` 方法按[默认排序](g)返回顶层 [section 页面](g)的集合。

给定如下内容结构：

```tree
content/
├── books/
│   ├── book-1.md
│   └── book-2.md
├── films/
│   ├── film-1.md
│   └── film-2.md
└── _index.md
```

这个模板：

```go-html-template
{{ range .Site.Sections }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

渲染结果为：

```html
<h2><a href="/books/">Books</a></h2>
<h2><a href="/films/">Films</a></h2>
```
