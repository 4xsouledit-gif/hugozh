+++
title = "reflect.IsSite"
linkTitle = "IsSite"
description = "报告给定值是否为站点（Site）对象。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/reflect/issite/"

[params.functions_and_methods]
signatures = ["reflect.IsSite INPUT"]
returnType = "bool"
+++

**（0.154.0 新增）**

```go-html-template {file="layouts/page.html"}
{{ with .Site  }}
  {{ reflect.IsSite . }} → true
{{ end }}

{{ with site.GetPage "/examples" }}
  {{ reflect.IsSite . }} → false
{{ end }}
```
