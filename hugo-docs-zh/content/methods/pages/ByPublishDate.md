+++
title = "ByPublishDate"
linkTitle = "ByPublishDate"
description = "返回给定页面集合按发布日期升序排序后的结果。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/pages/bypublishdate/"

[params.functions_and_methods]
signatures = ["PAGES.ByPublishDate"]
returnType = "page.Pages"
+++

按发布日期排序时，取值由[项目配置][]决定，默认使用前置元数据中的 `publishDate` 字段。

```go-html-template
{{ range .Pages.ByPublishDate }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByPublishDate.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

[项目配置]: /configuration/front-matter/#dates
