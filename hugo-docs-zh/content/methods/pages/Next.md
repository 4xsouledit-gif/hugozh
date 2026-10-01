+++
title = "Next"
linkTitle = "Next"
description = "返回页面集合中相对于给定页面的下一个页面。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/methods/pages/next/"

[params.functions_and_methods]
signatures = ["PAGES.Next PAGE"]
returnType = "page.Page"
+++

Hugo 按以下排序层级对页面集合排序，据此确定_下一个_和_上一个_页面：

字段|优先级|排序方向
:--|:--|:--
[`weight`][]|1|降序
[`date`][]|2|降序
[`linkTitle`][]|3|降序
[`path`][]|4|降序

用于确定_下一个_和_上一个_页面的这个已排序页面集合独立于其他页面集合，因此可能导致意外的行为。

例如，有如下内容结构：

```tree
content/
├── pages/
│   ├── _index.md
│   ├── page-1.md   <-- front matter: weight = 10
│   ├── page-2.md   <-- front matter: weight = 20
│   └── page-3.md   <-- front matter: weight = 30
└── _index.md
```

以及这些模板：

```go-html-template {file="layouts/section.html"}
{{ range .Pages.ByWeight }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

```go-html-template {file="layouts/page.html"}
{{ $pages := .CurrentSection.Pages.ByWeight }}

{{ with $pages.Prev . }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with $pages.Next . }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

当你访问 page-2 时：

- `Prev` 方法指向 page-3
- `Next` 方法指向 page-1

要反转_下一个_和_上一个_的含义，可以把 [`Reverse`][] 方法链式接在页面集合的定义后面：

```go-html-template {file="layouts/page.html"}
{{ $pages := .CurrentSection.Pages.ByWeight.Reverse }}

{{ with $pages.Prev . }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with $pages.Next . }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

> [!TIP]
> 如果你还需要知道页面在集合中的位置，请改用 [`IndexOf`][] 方法。例如可以用它在「上一个／下一个」链接旁渲染「post 2 of 3」。

[`IndexOf`]: /methods/pages/indexof/
[`Reverse`]: /methods/pages/reverse/
[`date`]: /methods/page/date/
[`linkTitle`]: /methods/page/linktitle/
[`path`]: /methods/page/path/
[`weight`]: /methods/page/weight/
