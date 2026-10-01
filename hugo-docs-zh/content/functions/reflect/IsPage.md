+++
title = "reflect.IsPage"
linkTitle = "IsPage"
description = "报告给定值是否为页面（Page）对象。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/reflect/ispage/"

[params.functions_and_methods]
signatures = ["reflect.IsPage INPUT"]
returnType = "bool"
+++

**（0.154.0 新增）**

```go-html-template {file="layouts/page.html"}
{{ with site.GetPage "/examples" }}
  {{ reflect.IsPage . }} → true
{{ end }}

{{ with .Site  }}
  {{ reflect.IsPage . }} → false
{{ end }}
```
