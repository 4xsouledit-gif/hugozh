+++
title = "Data"
linkTitle = "Data"
description = "返回 resources.GetRemote、css.Build 与 js.Build 函数所产生资源的补充信息。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/resource/data/"

[params.functions_and_methods]
signatures = ["RESOURCE.Data"]
returnType = "map"
+++

`Data` 方法返回 [`resources.GetRemote`][]、[`css.Build`][] 与 [`js.Build`][] 函数所产生资源的补充信息。

## 示例

```go-html-template
{{ $url := "https://example.org/images/a.jpg" }}
{{ $opts := dict "responseHeaders" (slice "Server") }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else with .Value }}
    {{ with .Data }}
      {{ .ContentLength }} → 42764
      {{ .ContentType }} → image/jpeg
      {{ .Headers }} → map[Server:[Netlify]]
      {{ .Status }} → 200 OK
      {{ .StatusCode }} → 200
      {{ .TransferEncoding }} → []
    {{ end }}
  {{ else }}
    {{ errorf "Unable to get remote resource %q" $url }}
  {{ end }}
{{ end }}
```

## 方法

在 `Data` 对象上使用这些方法。除非另有说明，这些方法适用于 `resources.GetRemote` 函数返回的资源。

`Artifacts`
: **（0.165.0 新增）**
: （`slice`）适用于 `css.Build` 与 `js.Build` 函数返回的资源，是随构建一并发布的附加输出文件的切片，例如 source map 以及 esbuild 的 `file` 加载器产出的文件。切片中的每个元素都提供 `MediaType`、`Permalink` 与 `RelPermalink` 方法。详见 [`css.Build`][css artifacts] 与 [`js.Build`][js artifacts] 文档中的 Artifacts 一节。

`ContentLength`
: （`int`）内容长度，单位为字节。

`ContentType`
: （`string`）内容类型。

`Headers`
: （`map[string][]string`）响应标头映射，只包含在传给 `resources.GetRemote` 函数的 [`responseHeaders`][] 选项中请求过的标头。标头名称匹配不区分大小写。多数情况下每个标头键对应一个值。

`Status`
: （`string`）HTTP 状态文本。

`StatusCode`
: （`int`）HTTP 状态码。

`TransferEncoding`
: （`string`）传输编码。

[`css.Build`]: /functions/css/build/
[`js.Build`]: /functions/js/build/
[`resources.GetRemote`]: /functions/resources/getremote/
[`responseHeaders`]: /functions/resources/getremote/#responseheaders
[css artifacts]: /functions/css/build/#artifacts
[js artifacts]: /functions/js/build/#artifacts
