+++
title = "Page"
linkTitle = "Page"
description = "返回分类法页面；若分类法没有任何术语则返回 nil。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/taxonomy/page/"

[params.functions_and_methods]
signatures = ["TAXONOMY.Page"]
returnType = "page.Page"
+++

如果分类法没有任何术语，这个 `TAXONOMY` 方法会返回 `nil`，因此必须做防御式编码：

```go-html-template
{{ with .Site.Taxonomies.tags.Page }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

渲染结果为：

```html
<a href="/tags/">Tags</a>
```
