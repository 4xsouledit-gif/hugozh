+++
title = "Content"
linkTitle = "Content"
description = "返回给定资源的内容。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/resource/content/"

[params.functions_and_methods]
signatures = ["RESOURCE.Content"]
returnType = "any"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

[资源类型][]为 `page` 时，`Resource` 对象上的 `Content` 方法返回 `template.HTML`，否则返回 `string`。

```text {file="assets/quotations/kipling.txt"}
He travels the fastest who travels alone.
```

要取得内容：

```go-html-template
{{ with resources.Get "quotations/kipling.txt" }}
  {{ .Content }} → He travels the fastest who travels alone.
{{ end }}
```

要取得以字节为单位的大小：

```go-html-template
{{ with resources.Get "quotations/kipling.txt" }}
  {{ .Content | len }} → 42
{{ end }}
```

要创建内联图像：

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  <img src="data:{{ .MediaType.Type }};base64,{{ .Content | base64Encode }}">
{{ end }}
```

要创建内联 CSS：

```go-html-template
{{ with resources.Get "css/style.css" }}
  <style>{{ .Content | safeCSS }}</style>
{{ end }}
```

要创建内联 JavaScript：

```go-html-template
{{ with resources.Get "js/script.js" }}
  <script>{{ .Content | safeJS }}</script>
{{ end }}
```

[资源类型]: /methods/resource/resourcetype/
