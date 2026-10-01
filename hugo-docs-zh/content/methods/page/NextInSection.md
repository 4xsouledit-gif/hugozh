+++
title = "NextInSection"
linkTitle = "NextInSection"
description = "返回某个 section 中相对于给定页面的下一个常规页面。"
date = 2026-10-02
weight = 450
source = "https://gohugo.io/methods/page/nextinsection/"

[params.functions_and_methods]
signatures = ["PAGE.NextInSection"]
returnType = "page.Page"
+++

Hugo 按以下排序层级对当前 section 的常规页面排序，据此确定_下一个_和_上一个_页面：

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
{{ with .PrevInSection }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with .NextInSection }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

当你访问 page-2 时：

- `PrevInSection` 方法指向 page-3
- `NextInSection` 方法指向 page-1

要反转_下一个_和_上一个_的含义，你可以修改[项目配置][]中的排序方向，或者使用 `Pages` 对象上的 [`Next`][] 和 [`Prev`][] 方法以获得更大的灵活性。

## 示例

写出防御性代码，先检查页面是否存在：

```go-html-template
{{ with .PrevInSection }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with .NextInSection }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

## 替代方案

使用 `Pages` 对象上的 [`Next`][] 和 [`Prev`][] 方法可以获得更大的灵活性。

[`Next`]: /methods/pages/next/
[`Prev`]: /methods/pages/prev/
[`date`]: /methods/page/date/
[`linkTitle`]: /methods/page/linktitle/
[`path`]: /methods/page/path/
[`weight`]: /methods/page/weight/
[项目配置]: /configuration/page/
