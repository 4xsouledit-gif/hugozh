+++
title = "部署目标配置"
linkTitle = "部署目标配置"
description = "配置 hugo deploy 的目标、匹配器与上传顺序。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/configuration/deployment/"

[params.teach]
difficulty = "进阶"
time = "15–20 分钟"
prereq = [
  "站点能构建，用来部署的云存储与凭据已准备好。",
  "知道 `hugo deploy` 是做什么的（见[使用 hugo deploy 部署](/host-and-deploy/deploy-with-hugo-deploy/)）。",
]
outcomes = [
  "配置一个部署目标（target），并用 `hugo deploy --target <名>` 部署到它；",
  "用匹配器给不同类型的文件设置缓存头与 gzip；",
  "先用 `dryRun` 看清将要发生的上传与删除，再真正部署。",
]
next = ["/host-and-deploy/deploy-with-hugo-deploy/", "/troubleshooting/"]
+++

## 这一页解决什么问题

`[deployment]` 只在运行 `hugo deploy` 时生效：它定义**部署到哪里**（云存储目标）、**哪些文件怎么上传**（匹配器：缓存头、gzip、媒体类型）、以及**删除与并发的上限**。

**先做这一步再改**：把 `dryRun = true` 跑一次——它会打印将要上传与删除的文件而不改动远端。「远端文件被误删」是这块最痛的故障，而 `maxDeletes` 正是为此设的闸门。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `targets` / `target` | 有多个部署目的地（生产、预发） | `target` 名写错 → 报找不到目标；不写则用第一个目标，容易误部署到生产 |
| `matchers` | 给不同文件设置 `cacheControl`、`gzip`、`contentType` | `pattern` 写错 → 该组文件**静默沿用默认行为**（没有缓存头、没有压缩），构建不报错 |
| `order` | 想控制上传顺序 | 不匹配任何表达式的文件最后以任意顺序上传 |
| `maxDeletes` | 防止一次部署误删大量远端文件 | 默认 `256`：删除数量超过它时**中止部署**；设为 `-1` 等于取消这道闸门 |
| `force` | 需要重新上传全部文件（元数据变更等） | 每次都开 → 部署变慢、流量变大 |
| `invalidateCDN` | 目标挂了 CDN，希望部署后刷新缓存 | 关掉后 CDN 继续返回旧内容：站点更新了，访客看到的还是旧页面 |
| `workers` | 上传太慢，或触发目标端限流 | 并发调高可能被限流；调低则部署更慢 |
| `stripIndexHTML` | 部署到键值型对象存储，希望规范 URL 与对象键一致 | 不设时远端键会带 `index.html`，部分场景下 URL 与规范地址不一致 |

> 该配置只在运行 `hugo deploy` 时生效，详见[使用 hugo deploy 部署](/host-and-deploy/deploy-with-hugo-deploy/)。

## 顶层设置

这些设置控制部署过程的整体行为，默认配置如下：

```toml
[deployment]
confirm = false
dryRun = false
force = false
invalidateCDN = true
maxDeletes = 256
order = []
target = ''
targets = []
matchers = []
workers = 10
```

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `confirm` | `bool` | `false` | 部署前是否提示确认。 |
| `dryRun` | `bool` | `false` | 是否只模拟部署而不对远端做任何改动。 |
| `force` | `bool` | `false` | 是否重新上传所有文件。 |
| `invalidateCDN` | `bool` | `true` | 是否使部署目标中列出的 CDN 缓存失效。 |
| `maxDeletes` | `int` | `256` | 最多删除的文件数，设为 `-1` 表示不限制。 |
| `matchers` | `[]Matcher` | `[]` | 匹配器切片，详见[匹配器](#匹配器)一节。 |
| `order` | `[]string` | `[]` | 由正则表达式组成的有序切片，决定上传优先级（从左到右）。不匹配任何表达式的文件最后以任意顺序上传。 |
| `target` | `string` | `''` | 目标部署对象的 `name`，默认为第一个目标。 |
| `targets` | `[]Target` | `[]` | 部署目标切片，详见[目标](#目标)一节。 |
| `workers` | `int` | `10` | 上传文件时使用的并发工作进程数。 |

## 目标

一个目标（target）代表一个部署目的地，例如「staging」或「production」。

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cloudFrontDistributionID` | `string` | — | CloudFront Distribution ID，在使用 Amazon Web Services CloudFront CDN 时适用。部署该目标时 Hugo 会刷新该 CDN 缓存。 |
| `exclude` | `string` | — | glob 模式，匹配部署到该目标时要排除的文件。本地文件若不符合包含/排除过滤条件则不会上传，远端文件若不符合这些条件则不会被删除。 |
| `googleCloudCDNOrigin` | `string` | — | 部署该目标时要刷新的 Google Cloud 项目与 CDN 源，写作 `<project>/<origin>`。 |
| `include` | `string` | — | glob 模式，匹配部署到该目标时要包含的文件。本地文件若不符合包含/排除过滤条件则不会上传，远端文件若不符合这些条件则不会被删除。 |
| `name` | `string` | — | 该目标的任意名称。 |
| `stripIndexHTML` | `bool` | `false` | 是否把名为 `<dir>/index.html` 的文件映射为远端的 `<dir>`（根目录的 `index.html` 除外）。这对键值型云存储（如 Amazon S3、Google Cloud Storage、Azure Blob Storage）很有用，可以让规范 URL 与对象键保持一致。 |
| `url` | `string` | — | 部署的[目标 URL](#目标-url)。 |

## 匹配器

匹配器（Matcher）表示对路径符合指定模式的文件应用的一组配置。

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cacheControl` | `string` | — | 提供该 blob 时使用的缓存属性，参见 MDN 的 [Cache-Control][cacheControl] 文档。 |
| `contentEncoding` | `string` | — | 该 blob 内容所使用的编码（若有），参见 MDN 的 [Content-Encoding][contentEncoding] 文档。 |
| `contentType` | `string` | — | 写入的 blob 的媒体类型，参见 MDN 的 [Content-Type][contentType] 文档。 |
| `force` | `bool` | `false` | 匹配到的文件是否应重新上传。当其他由路由决定的元数据（例如 `contentType`）发生变化时很有用。 |
| `gzip` | `bool` | `false` | 文件是否应在上传前进行 gzip 压缩。若启用，`ContentEncoding` 字段会自动设为 `gzip`。 |
| `pattern` | `string` | — | 用于匹配路径的正则表达式。匹配前路径会被转换为使用正斜杠（`/`）。 |

## 目标 URL

| 服务 | URL 示例 |
| --- | --- |
| Amazon Simple Storage Service (S3) | `s3://my-bucket?region=us-west-1` |
| Azure Blob Storage | `azblob://my-container` |
| Google Cloud Storage (GCS) | `gs://my-bucket` |

使用 Google Cloud Storage 时还可以指定子目录：

```text
gs://my-bucket?prefix=a/subdirectory
```

也可以部署到与 Amazon S3 兼容的存储服务器，例如 [Ceph][Ceph]、[MinIO][MinIO] 和 [SeaweedFS][SeaweedFS]。

例如，一个 MinIO 部署目标的 `url` 可能类似这样：

```text
s3://my-bucket?endpoint=https://my.minio.instance&awssdk=v2&use_path_style=true&disable_https=false
```

## 示例

下面的配置定义了四个匹配器和两个目标，可同时用于生产与预发环境：

```toml
[deployment]
  order = ['.jpg$', '.gif$']
  [[deployment.matchers]]
    cacheControl = 'max-age=31536000, no-transform, public'
    gzip = true
    pattern = '^.+\.(js|css|svg|ttf)$'
  [[deployment.matchers]]
    cacheControl = 'max-age=31536000, no-transform, public'
    gzip = false
    pattern = '^.+\.(png|jpg)$'
  [[deployment.matchers]]
    contentType = 'application/xml'
    gzip = true
    pattern = '^sitemap\.xml$'
  [[deployment.matchers]]
    gzip = true
    pattern = '^.+\.(html|xml|json)$'
  [[deployment.targets]]
    url = 's3://my_production_bucket?region=us-west-1'
    cloudFrontDistributionID = 'E1234567890ABCDEF0'
    exclude = '**.{heic,psd}'
    name = 'production'
  [[deployment.targets]]
    url = 's3://my_staging_bucket?region=us-west-1'
    exclude = '**.{heic,psd}'
    name = 'staging'
```

部署到生产目标：

```bash
hugo deploy --target production
```

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 部署后远端少了一批文件 | 删除判定依据包含/排除过滤条件：本地文件不符合 `include` / `exclude` 时，远端对应文件会被视为应删除 | 先用 `dryRun = true` 预览删除列表，再核对 `include` / `exclude` |
| 部署中途停止，提示删除数量过多 | 触发了 `maxDeletes`（默认 `256`）这道闸门 | 确认删除符合预期后再调大；不要直接设 `-1` 了事 |
| 静态资源没有缓存头或没有 gzip | `matchers` 的 `pattern` 没匹配到这些路径 | 用一条最小正则验证；匹配前路径会统一转为 `/` |
| CDN 上仍是旧内容 | `invalidateCDN = false`，或目标没有配置 CDN 相关字段 | 打开该项，或补 `cloudFrontDistributionID` / `googleCloudCDNOrigin` |
| 上传很慢或报限流 | `workers` 与目标端限制不匹配 | 适当调低 `workers` 后重试 |
| 报错看不懂 | 凭据与权限类错误来自云端，不是 Hugo 的配置问题 | 见[使用 hugo deploy 部署](/host-and-deploy/deploy-with-hugo-deploy/)与[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。

[Ceph]: https://ceph.com/
[MinIO]: https://www.minio.io/
[SeaweedFS]: https://github.com/chrislusf/seaweedfs
[cacheControl]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[contentEncoding]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
[contentType]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
