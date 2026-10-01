+++
title = "resources.GetMatch"
linkTitle = "GetMatch"
description = "返回路径匹配给定 glob 模式的第一个全局资源；找不到时返回 nil。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/resources/getmatch/"

[params.functions_and_methods]
signatures = ["resources.GetMatch PATTERN"]
returnType = "resource.Resource"
+++

```go-html-template
{{ with resources.GetMatch "images/*.jpg" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

> [!NOTE]
> 该函数作用于全局资源。全局资源是位于 `assets` 目录内，或位于任何挂载到 `assets` 目录的目录内的文件。
>
> 对于页面资源，请使用 `Page` 对象上的 [`Resources.GetMatch`][] 方法。

Hugo 用大小写不敏感的 glob 模式判断是否匹配。语法规则与示例见 [glob 模式速查表][]。

[`Resources.GetMatch`]: /methods/page/resources/#getmatch
[glob 模式速查表]: /quick-reference/glob-patterns/
