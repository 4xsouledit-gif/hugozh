+++
title = "Publish"
linkTitle = "Publish"
description = "发布给定资源。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/methods/resource/publish/"

[params.functions_and_methods]
signatures = ["RESOURCE.Publish"]
returnType = "nil"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

`Resource` 对象上的 `Publish` 方法把给定资源写入 [`publishDir`][]。

下例用 [`resources.FromString`][] 从字符串创建资源，然后发布它：

```go-html-template {file="layouts/baseof.html"}
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ with resources.FromString ".well-known/security.txt" $content }}
  {{ .Publish }}
{{ end }}
```

`Permalink` 与 `RelPermalink` 方法也会发布资源。`Publish` 是一个不带返回值的便捷发布方法。例如，下面这样写：

```go-html-template
{{ $resource.Publish }}
```

而不是这样写：

```go-html-template
{{ $noop := $resource.Permalink }}
```

要在管道中发布资源，请改用 [`resources.Publish`][] 函数。

[`publishDir`]: /configuration/all/#publishdir
[`resources.FromString`]: /functions/resources/fromstring/
[`resources.Publish`]: /functions/resources/publish/
