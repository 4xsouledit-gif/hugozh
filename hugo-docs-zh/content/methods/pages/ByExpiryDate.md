+++
title = "ByExpiryDate"
linkTitle = "ByExpiryDate"
description = "返回给定页面集合按过期日期升序排序后的结果。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/pages/byexpirydate/"

[params.functions_and_methods]
signatures = ["PAGES.ByExpiryDate"]
returnType = "page.Pages"
+++

按过期日期排序时，取值由[项目配置][]决定，默认使用前置元数据中的 `expiryDate` 字段。

```go-html-template
{{ range .Pages.ByExpiryDate }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByExpiryDate.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

[项目配置]: /configuration/front-matter/#dates
