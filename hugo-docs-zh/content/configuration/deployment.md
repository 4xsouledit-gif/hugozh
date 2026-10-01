+++
title = "部署目标配置"
linkTitle = "部署目标配置"
description = "配置 hugo deploy 的目标、匹配器与上传顺序。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/configuration/deployment/"
+++

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
| `cacheControl` | `string` | — | 提供该 blob 时使用的缓存属性，参见 MDN 的 Cache-Control 文档。 |
| `contentEncoding` | `string` | — | 该 blob 内容所使用的编码（若有），参见 MDN 的 Content-Encoding 文档。 |
| `contentType` | `string` | — | 写入的 blob 的媒体类型，参见 MDN 的 Content-Type 文档。 |
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

也可以部署到与 Amazon S3 兼容的存储服务器，例如 Ceph、MinIO 和 SeaweedFS。

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
