+++
title = "resources.Concat"
linkTitle = "Concat"
description = "返回拼接后的资源切片。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/resources/concat/"

[params.functions_and_methods]
signatures = ["resources.Concat TARGETPATH [RESOURCE...]"]
returnType = "resource.Resource"
+++

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

`resources.Concat` 函数返回拼接后的资源切片，并以目标路径作为缓存键缓存结果。每个资源必须具有相同的媒体类型。

调用资源的 [`Publish`][]、[`Permalink`][] 或 [`RelPermalink`][] 方法时，Hugo 会把该资源发布到目标路径。

```go-html-template
{{ $plugins := resources.Get "js/plugins.js" }}
{{ $global := resources.Get "js/global.js" }}
{{ $js := slice $plugins $global | resources.Concat "js/bundle.js" }}
```

[`Permalink`]: /methods/resource/permalink/
[`Publish`]: /methods/resource/publish/
[`RelPermalink`]: /methods/resource/relpermalink/
