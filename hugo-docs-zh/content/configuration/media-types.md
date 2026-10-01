+++
title = "媒体类型配置"
linkTitle = "媒体类型配置"
description = "定义媒体类型及其后缀，供输出格式引用。"
date = 2026-10-01
weight = 130
source = "https://gohugo.io/configuration/media-types/"
+++

媒体类型（media type，旧称 MIME 类型）是标识文件格式的两段式名称，例如 HTML 内容的媒体类型是 `text/html`。在 Hugo 中，已配置的媒体类型有多种用途，其中之一是定义[输出格式](/configuration/output-formats/)。下文给出 `mediaTypes` 区段的键名与默认值，并说明如何修改、新建媒体类型，以及如何注册没有后缀的媒体类型。

## 键名与默认值

`mediaTypes` 是一个映射：键为媒体类型名（如 `text/html`），值为该媒体类型的设置表。

| 键名 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `mediaTypes` | `map` | 见下节默认表 | 媒体类型映射，键为媒体类型名。 |
| `mediaTypes.<类型>.delimiter` | `string` | `"."` | 文件名与后缀之间的分隔符。分隔符与后缀共同构成文件扩展名。 |
| `mediaTypes.<类型>.suffixes` | `[]string` | 因媒体类型而异，见下节 | 与该媒体类型关联的后缀，第一个后缀是主后缀。 |

## 默认媒体类型

默认配置中的媒体类型及其后缀如下：

| 媒体类型 | 后缀 |
| --- | --- |
| `application/json` | `json` |
| `application/manifest+json` | `webmanifest` |
| `application/octet-stream` | 无 |
| `application/pdf` | `pdf` |
| `application/rss+xml` | `xml`、`rss` |
| `application/source-map` | `map` |
| `application/toml` | `toml` |
| `application/wasm` | `wasm` |
| `application/xml` | `xml` |
| `application/yaml` | `yaml`、`yml` |
| `font/otf` | `otf` |
| `font/ttf` | `ttf` |
| `font/woff` | `woff` |
| `font/woff2` | `woff2` |
| `image/avif` | `avif` |
| `image/bmp` | `bmp` |
| `image/gif` | `gif` |
| `image/heic` | `heic` |
| `image/heif` | `heif` |
| `image/jpeg` | `jpg`、`jpeg`、`jpe`、`jif`、`jfif` |
| `image/png` | `png` |
| `image/svg+xml` | `svg` |
| `image/tiff` | `tif`、`tiff` |
| `image/webp` | `webp` |
| `text/asciidoc` | `adoc`、`asciidoc`、`ad` |
| `text/calendar` | `ics` |
| `text/css` | `css` |
| `text/csv` | `csv` |
| `text/html` | `html`、`htm` |
| `text/javascript` | `js`、`jsm`、`mjs` |
| `text/jsx` | `jsx` |
| `text/markdown` | `md`、`mdown`、`markdown` |
| `text/org` | `org` |
| `text/pandoc` | `pandoc`、`pdc` |
| `text/plain` | `txt` |
| `text/rst` | `rst` |
| `text/tsx` | `tsx` |
| `text/typescript` | `ts` |
| `text/x-gotmpl` | `gotmpl` |
| `text/x-sass` | `sass` |
| `text/x-scss` | `scss` |
| `video/3gpp` | `3gpp`、`3gp` |
| `video/mp4` | `mp4` |
| `video/mpeg` | `mpg`、`mpeg` |
| `video/ogg` | `ogv` |
| `video/webm` | `webm` |
| `video/x-msvideo` | `avi` |

表中的「后缀」一列就是各媒体类型关联的后缀。例如，Hugo 把 `.html` 和 `.htm` 文件与 `text/html` 媒体类型关联起来；`application/octet-stream` 在默认配置中没有定义后缀。

> **注意**
> 第一个后缀是主后缀。为模板文件命名时应使用主后缀。例如为 RSS feed 创建模板时，使用 `xml` 后缀。

## 修改媒体类型

可以修改任何默认媒体类型。例如把 `text/html` 的主后缀从 `html` 换成 `htm`：

```toml
[mediaTypes.'text/html']
suffixes = ['htm','html']
```

注意这里把 `htm` 放在了数组首位，因此它成为主后缀。

如果改动了某个默认媒体类型，就必须同时显式地重新定义所有使用该媒体类型的输出格式。例如，要让上面的改动作用于 `html` 输出格式，就要重新定义它：

```toml
[outputFormats.html]
mediaType = 'text/html'
```

## 新建媒体类型

可以按需新建媒体类型。例如为 Atom feed 新建一个媒体类型：

```toml
[mediaTypes.'application/atom+xml']
suffixes = ['atom']
```

注册之后，就可以在输出格式的 `mediaType` 设置里引用它，具体写法参见[输出格式配置](/configuration/output-formats/)。

## 无后缀的媒体类型

有时需要创建既没有后缀、也没有分隔符的媒体类型。例如 [Netlify](https://www.netlify.com/) 会识别名为 `_redirects` 和 `_headers` 的配置文件，而 Hugo 可以用自定义输出格式生成它们。

为此，注册一个不带后缀和分隔符的媒体类型：

```toml
[mediaTypes.'text/netlify']
delimiter = ''
```

对应的自定义输出格式定义大致如下：

```toml
[outputFormats.redir]
baseName    = '_redirects'
isPlainText = true
mediatype   = 'text/netlify'
[outputFormats.headers]
baseName       = '_headers'
isPlainText    = true
mediatype      = 'text/netlify'
notAlternative = true
```
