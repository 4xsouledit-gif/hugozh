+++
title = "ByParam"
linkTitle = "ByParam"
description = "返回给定页面集合按指定参数升序排序后的结果。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/pages/byparam/"

[params.functions_and_methods]
signatures = ["PAGES.ByParam PARAM"]
returnType = "page.Pages"
+++

如果前置元数据中没有给定的参数，Hugo 会改用项目配置中的同名参数（如果存在）。

```go-html-template
{{ range .Pages.ByParam "author" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range (.Pages.ByParam "author").Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

如果目标参数是嵌套的，请用点号访问其字段：

```go-html-template
{{ range .Pages.ByParam "author.last_name" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```
