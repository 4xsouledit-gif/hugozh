+++
title = "resources.ExecuteAsTemplate"
linkTitle = "ExecuteAsTemplate"
description = "返回由 Go 模板创建的资源，它用给定上下文解析并执行。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/resources/executeastemplate/"

[params.functions_and_methods]
signatures = ["resources.ExecuteAsTemplate TARGETPATH CONTEXT RESOURCE"]
returnType = "resource.Resource"
+++

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

`resources.ExecuteAsTemplate` 函数返回由 Go 模板创建的资源，它用给定上下文解析并执行，并以目标路径作为缓存键缓存结果。

调用资源的 [`Publish`][]、[`Permalink`][] 或 [`RelPermalink`][] 方法时，Hugo 会把该资源发布到目标路径。

假设你有一个 CSS 文件，希望用项目配置中的值填充它：

```go-html-template {file="assets/css/template.css"}
body {
  background-color: {{ site.Params.style.bg_color }};
  color: {{ site.Params.style.text_color }};
}
```

而项目配置中包含：

```toml
[params.style]
bg_color = '#fefefe'
text_color = '#222'
```

把下面的代码放进 baseof.html 模板：

```go-html-template
{{ with resources.Get "css/template.css" }}
  {{ with resources.ExecuteAsTemplate "css/main.css" $ . }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ end }}
{{ end }}
```

上面的示例：

1. 把该模板捕获为资源
1. 以当前页面作为上下文，把该资源作为模板执行
1. 把该资源发布到 css/main.css

结果是：

```css {file="public/css/main.css"}
body {
  background-color: #fefefe;
  color: #222;
}
```

[`Permalink`]: /methods/resource/permalink/
[`Publish`]: /methods/resource/publish/
[`RelPermalink`]: /methods/resource/relpermalink/
