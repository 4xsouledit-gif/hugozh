+++
title = "RegularPages"
linkTitle = "RegularPages"
description = "返回所有常规页面的集合。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/methods/site/regularpages/"

[params.functions_and_methods]
signatures = ["SITE.RegularPages"]
returnType = "page.Pages"
+++

`Site` 对象上的 `RegularPages` 方法按[默认排序](g)返回所有[常规页面](g)的集合。

```go-html-template
{{ range .Site.RegularPages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

[默认排序（default sort order）](/quick-reference/glossary/default-sort-order/)

[default sort order](g)

要改变排序方式，请使用 `Pages` 的任意一个[排序方法][]。例如：

```go-html-template
{{ range .Site.RegularPages.ByTitle }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

[排序方法]: /methods/pages/
