+++
title = "ByLastmod"
linkTitle = "ByLastmod"
description = "返回给定页面集合按最后修改日期升序排序后的结果。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/pages/bylastmod/"

[params.functions_and_methods]
signatures = ["PAGES.ByLastmod"]
returnType = "page.Pages"
+++

按最后修改日期排序时，取值由[项目配置][]决定，默认使用前置元数据中的 `lastmod` 字段。

```go-html-template
{{ range .Pages.ByLastmod }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByLastmod.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

[项目配置]: /configuration/front-matter/#dates
