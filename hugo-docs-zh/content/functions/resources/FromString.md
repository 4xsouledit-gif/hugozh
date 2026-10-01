+++
title = "resources.FromString"
linkTitle = "FromString"
description = "返回由字符串创建的资源。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/resources/fromstring/"

[params.functions_and_methods]
signatures = ["resources.FromString TARGETPATH STRING"]
returnType = "resource.Resource"
+++

`resources.FromString` 函数返回由字符串创建的资源，并以目标路径作为缓存键缓存结果。

例如，要根据站点配置创建并发布一个 `security.txt` 文件：

```go-html-template {file="layouts/baseof.html"}
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ with resources.FromString ".well-known/security.txt" $content }}
  {{ .Publish }}
{{ end }}
```

要在管道中发布，请使用 [`resources.Publish`][] 函数：

```go-html-template {file="layouts/baseof.html"}
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ resources.FromString ".well-known/security.txt" $content | resources.Publish }}
```

[`Permalink`][] 与 [`RelPermalink`][] 方法也会发布该资源。

如果字符串中包含模板动作，请把 `resources.FromString` 与 [`resources.ExecuteAsTemplate`][] 组合使用：

```go-html-template {file="layouts/baseof.html"}
{{ $string := `Contact: mailto:{{ site.Params.email }}
Expires: {{ (now.AddDate 1 0 0).UTC.Format "2006-01-02T15:04:05Z" }}
` }}
{{ $r := resources.FromString "" $string }}
{{ $r = $r | resources.ExecuteAsTemplate ".well-known/security.txt" . }}
{{ $r.Publish }}
```

[`Permalink`]: /methods/resource/permalink/
[`RelPermalink`]: /methods/resource/relpermalink/
[`resources.ExecuteAsTemplate`]: /functions/resources/executeastemplate/
[`resources.Publish`]: /functions/resources/publish/
