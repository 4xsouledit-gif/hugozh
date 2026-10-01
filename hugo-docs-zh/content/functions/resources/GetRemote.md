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

（0.141.0 新增）返回资源上的 `Err` 方法已在 v0.141.0 中移除。请改用 [`try`](/functions/go-template/try/) 语句，如下面的[错误处理](#错误处理)示例所示。

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
> 为简洁起见，下面的示例省略了[错误处理](#错误处理)。

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

## 错误处理

用 [`try`][] 语句捕获 HTTP 请求错误。如果你不自行处理错误，Hugo 会让构建失败。

> [!NOTE]
> Hugo 不把状态码为 404 的 HTTP 响应视为错误。这种情况下 `resources.GetRemote` 返回 `nil`。

```go-html-template
{{ $url := "https://broken-example.org/images/a.jpg" }}
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

要把错误记录为警告而不是错误：

```go-html-template
{{ $url := "https://broken-example.org/images/a.jpg" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ warnf "%s" . }}
  {{ else with .Value }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ else }}
    {{ warnf "Unable to get remote resource %q" $url }}
  {{ end }}
{{ end }}
```

## HTTP 响应

`resources.GetRemote` 函数返回的资源上的 [`Data`][] 方法会返回 HTTP 响应中的信息。

## 缓存

`resources.GetRemote` 返回的资源会缓存到磁盘上。详见[配置文件缓存][]。

默认情况下，Hugo 从传给函数的参数推导缓存键。可以通过在选项映射中设置 `key` 来覆盖缓存键。用这种方式可以更细致地控制 Hugo 重新抓取远程资源的频率。

```go-html-template
{{ $url := "https://example.org/images/a.jpg" }}
{{ $cacheKey := print $url (now.Format "2006-01-02") }}
{{ $opts := dict "key" $cacheKey }}
{{ $resource := resources.GetRemote $url $opts }}
```

## 安全性

为防止恶意意图，`resources.GetRemote` 函数会检查服务器响应，包括：

- 响应头中的 [Content-Type][]
- 文件扩展名（如果有）
- 内容本身

如果 Hugo 无法把媒体类型解析到其[允许列表][]中的某个条目，函数会抛出错误：

```text
ERROR error calling resources.GetRemote: failed to resolve media type...
```

例如，尝试下载可执行文件时就会看到上面的错误。

尽管允许列表已包含常见媒体类型的条目，你仍可能遇到 Hugo 无法解析某个你确知安全的文件媒体类型的情况。这时请编辑项目配置，把该媒体类型加入允许列表。例如：

```toml
[security.http]
mediaTypes = ['^application/vnd\.api\+json$']
```

注意上面的条目：

- 是对允许列表的**追加**，而不会**替换**允许列表
- 是一个正则表达式数组

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
