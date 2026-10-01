+++
title = "ByWeight"
linkTitle = "ByWeight"
description = "返回给定页面集合按权重升序排序后的结果。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/pages/byweight/"

[params.functions_and_methods]
signatures = ["PAGES.ByWeight"]
returnType = "page.Pages"
+++

用前置元数据中的 `weight` 字段为页面指定[weight](g)（权重）。权重必须是非零整数。较轻的条目浮到顶部，较重的条目沉到底部。未设置权重或权重为零的页面排在集合末尾。

```go-html-template
{{ range .Pages.ByWeight }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByWeight.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```
