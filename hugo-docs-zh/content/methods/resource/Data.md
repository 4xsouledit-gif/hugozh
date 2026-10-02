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

## 这一页解决什么问题

`resources.Get` 拿到的本地资源只知道自己是什么；而**远程抓取**和**构建产出**这两类资源额外携带了「这次操作的元信息」：HTTP 响应码、内容长度、响应头，或者构建时连带生成的 source map。`Data` 就是读取这些补充信息的入口。

它回答的问题是：**下载到底成不成功（状态码/内容长度是多少）？构建除了主文件还多产出了哪些文件（source map 等）？**

## 什么时候用，什么时候别用

**该用**：

- 用 `resources.GetRemote` 下载后，想记录/校验 `StatusCode`、`ContentLength`、`ContentType`；
- 需要按响应头做条件处理（例如只在 `Server` 头匹配时才使用某镜像）；
- 用 `css.Build` / `js.Build` 构出资源后，要拿到 `.map` 等附带产物的 URL 一并输出（`Data.Artifacts`）。

**别用**：

- 资源是本地 `assets/` 文件 → 它的 `.Data` 是空映射（实测 `not .Data` 为 `true`），没有任何补充信息；要内容用 [`Content`](/methods/resource/content/)，要元数据用 [`Meta`](/methods/resource/meta/)；
- 只想判断下载成不成功、拿错误消息 → 用 [`try`](/functions/go-template/try/) 读 `.Err`（见下文示例），比翻 `Data` 更直接；
- 想读图片的 Exif/IPTC/XMP → 那是 [`Meta`](/methods/resource/meta/) 的活。

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

## 完整示例（实测）

### 本地资源没有补充信息

测量条件：Hugo 0.167.0 extended，Windows，最小站点。把下面这段放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "css/style.css" }}
  <p>Data 为空：{{ not .Data }}</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>Data 为空：true</p>
```

**你应当看到什么**：`Data` 只对远程资源与 `css.Build`/`js.Build` 产出的资源有内容；对 `assets/` 里的普通文件它就是一个空映射（`printf "%v"` 得到 `map[]`）。所以在本地资源上读 `.Data.ContentLength` 不会报错，但什么也读不到——这是「没报错但结果不对」的典型来源。

### 构建产物的附带文件

`js.Build` 打开外部 source map 后，`.Data.Artifacts` 会列出这些附带产物：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "js/script.js" }}
  {{ $b := . | js.Build (dict "sourceMap" "external") }}
  {{ range $b.Data.Artifacts }}
    <p>{{ .RelPermalink }} — {{ .MediaType.Type }}</p>
  {{ end }}
{{ end }}
```

Hugo 渲染为：

```html
<p>/js/script.js.map — application/source-map</p>
```

**你应当看到什么**：默认不写 `sourceMap` 时 `Artifacts` 是空切片（实测 `printf "%v"` 得到 `[]`）；写成 `external` 后切片里就有一项，`RelPermalink` 指向同目录下的 `.map` 文件，`MediaType.Type` 为 `application/source-map`。每个元素都支持 `MediaType`、`Permalink`、`RelPermalink`，所以「遍历 `.Data.Artifacts` 把附带产物一起登记」是标准写法。

### 远程资源的错误路径

下面的写法在**有网络**的环境里可用；`resources.GetRemote` 的失败会被 `try` 接住，放进 `.Err`：

```go-html-template
{{ $url := "https://example.org/images/a.jpg" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ warnf "抓取失败：%s" . }}
  {{ else with .Value }}
    {{ with .Data }}
      {{ .StatusCode }} {{ .Status }} {{ .ContentLength }} {{ .ContentType }}
    {{ end }}
  {{ end }}
{{ end }}
```

> [!NOTE]
> 本站实测环境启用了 `security.http` 白名单（Hugo 默认配置），对 `https://example.org` 的请求被拒绝，因此上表里远程资源的**具体数值**本站无法实测。`try` 能接住这条错误这点是实测的（`.Err` 里是完整的 `error calling GetRemote: …` 消息）。要在本地试，请确认所在网络可访问目标域名，并检查项目配置里的 `[security.http]`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 本地 `assets/` 资源 | `.Data` 为空映射（`map[]`） | 否 |
| `js.Build`（未开 sourceMap） | `.Data.Artifacts` 为空切片 `[]` | 否 |
| `js.Build (dict "sourceMap" "external")` | `.Artifacts` 有一项，`MediaType.Type` 为 `application/source-map` | 否 |
| `resources.GetRemote` 成功 | `ContentLength`、`ContentType`、`Status`、`StatusCode`、`Headers`、`TransferEncoding` 可用 | 否 |
| `resources.GetRemote` 请求失败 | 构建期错误；用 `try` 包住可读 `.Err` | 是（未用 `try` 时构建失败） |
| `resources.GetRemote` 成功但未在 `responseHeaders` 选项里请求某标头 | `Headers` 里没有该键（上游说明：只包含请求过的标头） | 否 |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Data` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 在本地资源上读 `.Data.ContentLength`，输出为空 | 本地资源没有补充信息，`Data` 是空映射 | 只在 `GetRemote` / `css.Build` / `js.Build` 的结果上读 `Data` |
| 没报错但结果不对 | `.Data.Artifacts` 一直是空的 | 没开需要附带产物的构建选项（如 `sourceMap`） | 打开对应选项（见 [`js.Build`][js artifacts]、[`css.Build`][css artifacts]） |
| 没报错但结果不对 | `Headers` 里找不到 `Server` 之类的标头 | 必须在 `resources.GetRemote` 的 `responseHeaders` 选项里点名请求 | 传 `dict "responseHeaders" (slice "Server")` |
| 报错看不懂 | `error calling GetRemote` | 目标不可达，或被 `security.http` 白名单拒绝 | 用 `try` 读 `.Err`，或检查 `[security.http]` 配置 |

更多排查入口见[故障排查](/troubleshooting/)。

[`css.Build`]: /functions/css/build/
[`js.Build`]: /functions/js/build/
[`resources.GetRemote`]: /functions/resources/getremote/
[`responseHeaders`]: /functions/resources/getremote/#responseheaders
[css artifacts]: /functions/css/build/#artifacts
[js artifacts]: /functions/js/build/#artifacts
