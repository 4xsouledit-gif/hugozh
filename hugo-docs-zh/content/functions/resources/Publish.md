+++
title = "resources.Publish"
linkTitle = "Publish"
description = "发布给定资源后返回该资源。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/resources/publish/"

[params.functions_and_methods]
signatures = ["resources.Publish RESOURCE"]
returnType = "resource.Resource"
+++

（0.166.0 新增）

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

`resources.Publish` 函数把给定资源写入 [`publishDir`][] 并返回该资源，因此很适合用在模板管道中。

```go-html-template
{{ resources.Get "main.js" | js.Build | resources.Publish }}
```

这等价于：

```go-html-template
{{ (resources.Get "main.js" | js.Build).Publish }}
```

非管道形式的写法参见 [`Publish`][] 方法。

[`Publish`]: /methods/resource/publish/
[`publishDir`]: /configuration/all/
