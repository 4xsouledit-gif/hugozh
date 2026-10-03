+++
title = "媒体类型配置"
linkTitle = "媒体类型配置"
description = "定义媒体类型及其后缀，供输出格式引用。"
date = 2026-10-01
weight = 130
source = "https://gohugo.io/configuration/media-types/"
+++

## 这一页解决什么问题

媒体类型（media type，旧称 MIME 类型）是「文件格式」的两段式名称，例如 `text/html`。Hugo 预置了常见格式与后缀的对应关系，[输出格式](/configuration/output-formats/)再引用媒体类型来决定产物文件的扩展名与模板后缀。

只有两种场景需要动它：**改某个媒体类型的后缀**（此时必须同时重新定义引用它的输出格式），以及**新建媒体类型**（例如 Atom，或 Netlify 那种没有后缀的 `_redirects`）。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `suffixes` | 想改主后缀（数组第一位就是主后缀） | 改了默认媒体类型的后缀，却没重新定义引用它的输出格式 → 产物扩展名与模板查找用的后缀不一致，模板「找不到」（上游明确指出必须同时重定义） |
| 新建 `mediaTypes.<类型>` | 接入新格式（Atom、自定义文本格式） | 媒体类型名与引用处不一致 → 引用它的输出格式解析失败，构建报错 |
| `delimiter = ''` | 需要生成无后缀文件（如 `_redirects`） | 只清空后缀却没清空分隔符 → 文件名里多出分隔符，不符合平台约定 |

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 改了后缀，产物扩展名却没变 | 只改了 `mediaTypes`，没有重新定义使用它的输出格式 | 像本页示例那样同时写 `[outputFormats.html]` 并设 `mediaType = 'text/html'` |
| 自定义模板不被使用 | 模板文件名用了非主后缀；主后缀是 `suffixes` 的第一项 | 用主后缀命名模板，例如 RSS 用 `xml` |
| 生成的文件名与平台约定不符 | 清了后缀却没有把 `delimiter` 也设为空 | 两者都留空：`delimiter = ''`，并在输出格式里用 `baseName` 指定文件名 |
| 构建报「找不到类型」一类错误 | 媒体类型名与引用处不一致（大小写、斜杠、拼写） | 用 `hugo config` 确认 `[mediatypes]` 中的键名，再核对输出格式的 `mediaType` |

更多排查入口见[故障排查](/troubleshooting/)。
