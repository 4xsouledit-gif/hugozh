+++
title = "resources.GetRemote"
linkTitle = "GetRemote"
description = "返回给定 URL 上的远程资源；找不到时返回 nil。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/resources/getremote/"

[params.functions_and_methods]
signatures = ["resources.GetRemote URL [OPTIONS]"]
returnType = "resource.Resource"
+++

## 这一页解决什么问题

站点要在**构建时**引用外部内容：一个远端 JSON/CSV 数据源、别人的 RSS feed、一张远程图片。你希望在构建期把它抓下来、缓存到磁盘，然后用和本地资源一样的方式处理（`transform.Unmarshal`、图片缩放、`.RelPermalink`）。

`resources.GetRemote` 做的就是这件事：发一次 HTTP 请求，把响应变成一个资源对象。

> [!IMPORTANT]
> 本页的示例**需要联网**，本次文档整理环境无法访问外网，因此文中所有输出都标注了来源：来自上游文档的写「上游说明」，没有可靠来源的一律写「上游未给出输出」。**不要**把本页的片段当作已验证输出的示例。

## 什么时候用，什么时候别用

**该用**：

- 构建期抓取外部数据并缓存（避免每次构建都访问远端）；
- 抓取远程图片并按本地资源的方式处理（缩放、转格式）；
- 需要带请求头、POST 数据、超时控制的抓取。

**别用**：

- 页面里只是要放一个外链 → 直接写 URL，不必抓取；
- 需要浏览器端实时请求的数据 → 那是前端 JavaScript 的事，构建期抓取只会得到一份静态快照；
- 构建必须完全离线可复现 → 远程抓取会引入网络依赖；若必须用，请按下文用 `try` 兜住错误，并在缓存/CI 上做文章；
- 想解析 JSON/YAML/CSV 的**内容** → 抓回来之后交给 [`transform.Unmarshal`](/functions/transform/unmarshal/)，`GetRemote` 本身不解析。

**（0.141.0 新增）** 返回资源上的 `Err` 方法已在 v0.141.0 中移除。请改用 [`try`](/functions/go-template/try/) 语句，如下面的[错误处理](#错误处理)示例所示。

```go-html-template
{{ $url := "https://example.org/images/a.jpg" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else with .Value }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ else }}
    {{ errorf "Unable to get remote resource %q" $url }}
  {{ end }}
{{ end }}
```

（上游未给出输出。）

如上所示，当你用 [`Permalink`][]、[`RelPermalink`][] 或 [`Publish`][] 方法发布远程资源时，Hugo 会把生成的文件放在 [`publishDir`][] 的根目录下，文件名取 URL 的基名。为保证缓存键唯一，Hugo 会在原文件名后附加一个哈希值。

## 选项

`resources.GetRemote` 函数接受一个选项映射。

`body`
: （`string`）你想要传给服务器的数据。

`headers`
: （`map[string][]string`）为请求提供附加信息的键值对集合。

`key`
: （`string`）缓存键。Hugo 默认从 URL 与选项映射推导出该值。参见[缓存](#缓存)。

`method`
: （`string`）对请求的资源执行的动作，通常是 `GET`、`POST` 或 `HEAD` 之一。

`responseHeaders`
: （0.143.0 新增）
: （`[]string`）要从服务器响应中提取的响应头，可通过资源的 [`Data.Headers`][] 方法访问。响应头名称的匹配大小写不敏感。

`timeout`
: （0.157.0 新增）
: （`string`）请求未完成时被取消的时长，以时长（duration）表示。未指定时，请求将在 2 分钟后超时。

## 选项示例

> [!NOTE]
> 为简洁起见，下面的示例省略了[错误处理](#错误处理)。以上示例均来自上游文档，本次未能实测输出。

包含一个请求头：

```go-html-template
{{ $url := "https://example.org/api" }}
{{ $opts := dict
  "headers" (dict "Authorization" "Bearer abcd")
}}
{{ $resource := resources.GetRemote $url $opts }}
```

要为同一个请求头键指定多个值，请使用切片：

```go-html-template
{{ $url := "https://example.org/api" }}
{{ $opts := dict
  "headers" (dict "X-List" (slice "a" "b" "c"))
}}
{{ $resource := resources.GetRemote $url $opts }}
```

提交数据：

```go-html-template
{{ $url := "https://example.org/api" }}
{{ $opts := dict
  "method" "post"
  "body" `{"complete": true}`
  "headers" (dict  "Content-Type" "application/json")
}}
{{ $resource := resources.GetRemote $url $opts }}
```

覆盖默认缓存键：

```go-html-template
{{ $url := "https://example.org/images/a.jpg" }}
{{ $opts := dict
  "key" (print $url (now.Format "2006-01-02"))
}}
{{ $resource := resources.GetRemote $url $opts }}
```

提取服务器响应中的特定响应头：

```go-html-template
{{ $url := "https://example.org/images/a.jpg" }}
{{ $opts := dict
  "method" "HEAD"
  "responseHeaders" (slice "X-Frame-Options" "Server")
}}
{{ $resource := resources.GetRemote $url $opts }}
```

在抓取多个远程源时，用 `timeout` 选项避免缓慢的外部请求拖住构建：

```go-html-template
{{ $url := "https://example.org/feed.rss" }}
{{ $opts := dict "timeout" "10s" }}
{{ with try (resources.GetRemote $url $opts) }}
  {{ with .Err }}
    {{ warnf "Failed to fetch feed: %s" . }}
  {{ else with .Value }}
    {{ $data = . | transform.Unmarshal }}
  {{ end }}
{{ end }}
```

## 远程数据

获取远程数据时，请用 [`transform.Unmarshal`][] 函数解析响应。

```go-html-template
{{ $data := dict }}
{{ $url := "https://example.org/books.json" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else with .Value }}
    {{ $data = . | transform.Unmarshal }}
  {{ else }}
    {{ errorf "Unable to get remote resource %q" $url }}
  {{ end }}
{{ end }}
```

> [!NOTE]
> 获取远程数据时，配置有误的服务器可能返回带有错误 [Content-Type][] 的响应头。例如，服务器可能把 Content-Type 头设为 `application/octet-stream`，而不是 `application/json`。
>
> 遇到这种情况，请把资源的 `Content` 而不是资源本身传给 `transform.Unmarshal` 函数。例如上面的写法应改为：
>
> `{{ $data = .Content | transform.Unmarshal }}`

## 完整示例：抓取远端 JSON 并处理错误

下面这段来自上游文档，是「抓取 + 错误处理」的标准骨架。**本次未能实测**（环境无法访问外网），因此不给出输出：

```go-html-template {file="layouts/_partials/remote-books.html"}
{{ $data := dict }}
{{ $url := "https://example.org/books.json" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ warnf "抓取失败：%s" . }}
  {{ else with .Value }}
    {{ $data = . | transform.Unmarshal }}
    <p>共 {{ len $data.books }} 本</p>
  {{ else }}
    {{ warnf "没有取到远程资源 %q" $url }}
  {{ end }}
{{ end }}
```

**你应当看到什么**（根据上游说明推断，非实测）：请求成功时进入 `else with .Value` 分支，把响应交给 `transform.Unmarshal`；HTTP 404 时 `GetRemote` 返回 `nil`，落到最后的 `else`；其它错误进入 `.Err` 分支，由 `warnf` 记录而不中断构建。

## 返回值边界（来源标注）

> [!WARNING]
> 本节的结论**来自上游文档**（见括号标注），除最后一行外均未在本环境实测——远程抓取需要联网。

| 情况 | 结果 | 来源 |
| --- | --- | --- |
| HTTP 200 | 资源对象（可按资源处理、可发布） | 上游说明 |
| HTTP 404 | `nil`（上游明确：404 不视为错误） | 上游说明 |
| 其它 HTTP 错误、连接失败 | 抛出错误；若不用 `try`／`errorf` 处理，**构建失败** | 上游说明 |
| 媒体类型不在允许列表（如可执行文件） | 抛错，报错文本形如 `ERROR error calling resources.GetRemote: failed to resolve media type...` | 上游给出的示例文本 |
| 未指定 `timeout` | 请求 2 分钟后超时 | 上游说明 |
| 服务器返回错误 Content-Type | 资源本身仍可用，但 `transform.Unmarshal` 可能失败；改用 `.Content \| transform.Unmarshal` | 上游说明 |
| 缓存 | 资源缓存到磁盘；缓存键默认由 URL 与选项推导，可用 `key` 覆盖 | 上游说明 |
| 返回类型 | `resource.Resource`，或 `nil` | 上游说明 |

实测（仅限本环境的策略层面）：在无法访问外网的环境里调用会直接失败，报错形如

```text
error calling GetRemote: Get "https://example.org/": dial tcp …: access denied: "…" is not whitelisted in policy "security.http.urls"
```

这是**本地网络/安全策略**导致的结果，不是 `resources.GetRemote` 的通用行为，仅供参考排查思路：构建机上抓不到远端时，先确认是不是网络或 Hugo 的 `security.http.urls` 限制。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `failed to resolve media type...` | 响应类型不在允许列表（例如下载可执行文件） | 仅抓取需要的类型；确知安全时在 `[security.http]` 的 `mediaTypes` 里追加正则 |
| 报错看不懂 | 构建因一次网络抖动失败 | 没处理 HTTP 错误，Hugo 默认让构建失败 | 用 `try` + `warnf` 把错误降级为警告 |
| 没报错但结果不对 | 明明 404 却「成功」了 | 上游设计如此：404 返回 `nil`，不是错误 | 用 `else`／`with` 判断 `nil`，别只看 `.Err` |
| 没报错但结果不对 | 远端数据更新了，页面还是旧的 | 命中了磁盘缓存 | 用 `key` 选项控制缓存键（例如带上日期），或清理缓存目录 |
| 没报错但结果不对 | `transform.Unmarshal` 报解析失败 | 服务器 Content-Type 不对，Hugo 没按 JSON 处理 | 传 `.Content` 而不是资源本身给 `transform.Unmarshal` |
| 构建很慢 | 每次构建都卡很久 | 远端慢且没设 `timeout` | 加 `"timeout" "10s"` 之类的选项 |
| 报错看不懂 | 页面上原样出现 `{{ resources.GetRemote … }}` | 把模板函数写进了内容 Markdown | 该逻辑要放在模板里 |

更多排查入口见[故障排查](/troubleshooting/)。

[Content-Type]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
[`Data.Headers`]: /methods/resource/data/#headers
[`Data`]: /methods/resource/data/
[`Permalink`]: /methods/resource/permalink/
[`Publish`]: /methods/resource/publish/
[`RelPermalink`]: /methods/resource/relpermalink/
[`publishDir`]: /configuration/all/
[`transform.Unmarshal`]: /functions/transform/unmarshal/
[`try`]: /functions/go-template/try/
[允许列表]: https://en.wikipedia.org/wiki/Whitelist
[配置文件缓存]: /configuration/caches/
