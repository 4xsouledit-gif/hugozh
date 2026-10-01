+++
title = "ByLinkTitle"
linkTitle = "ByLinkTitle"
description = "返回给定页面集合按链接标题升序排序后的结果；未定义链接标题时回退到标题。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/pages/bylinktitle/"

[params.functions_and_methods]
signatures = ["PAGES.ByLinkTitle"]
returnType = "page.Pages"
+++

```go-html-template
{{ range .Pages.ByLinkTitle }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByLinkTitle.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```
