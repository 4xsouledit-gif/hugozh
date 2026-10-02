+++
title = "输出格式配置"
linkTitle = "输出格式配置"
description = "定义和调整输出格式，控制页面的渲染产物。"
date = 2026-10-01
weight = 170
source = "https://gohugo.io/configuration/output-formats/"
+++

## 这一页解决什么问题

输出格式（output format）定义「同一个页面还能产出哪些文件」：除了 `index.html`，还可以有 JSON、Atom、纯文本、`robots.txt` 等。这一页给出全部字段含义、如何新建格式，以及某个产物为什么叫这个名字、放在这个位置。

**最容易踩的坑**：新建一个输出格式需要四步齐备（媒体类型 → 输出格式 → `outputs` → 模板）。少任何一步都不会提示「少了一步」，而是表现为「文件根本没生成」或「构建报找不到模板」。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `weight` | 调整输出格式的渲染次序 | 数值小者靠前（`html` 默认 `10`，其余默认 `0`）；次序变化会影响主输出格式的判定与别名重定向 |
| `baseName` / `path` / `root` | 控制产物文件名与位置 | 两种格式解析到同一个文件系统路径 → 构建报路径冲突或互相覆盖（上游要求每种格式最终解析到唯一路径） |
| `isPlainText` | 输出非 HTML（JSON、纯文本、Markdown） | 不设时用 `html/template` 解析模板 → 输出里的 `<`、`&` 被转义，JSON 结构被破坏 |
| `mediaType` | 新建格式 | 与[媒体类型配置](/configuration/media-types/)中已定义的类型名不一致 → 构建报错 |
| `permalinkable` | 希望 `.Permalink` / `.RelPermalink` 返回**当前**格式的地址 | 保持默认 `false` 时，`page.json.json` 里的 `.RelPermalink` 返回的是主输出格式（HTML）的地址 |
| `noUgly` / `ugly` | 项目启用了 `uglyURLs`，但要给个别格式开例外 | 取值与站点级 `uglyURLs` 相互抵消 → 某些格式的 URL 形态与其它格式不一致 |
| `notAlternative` | 不想让该格式出现在 `AlternativeOutputFormats` 里（如 `css`、`manifest`） | 忘了设 → `head` 里会多出指向该格式的 `rel="alternate"` 链接 |
| `outputs` | 指定哪些页面种类渲染该格式 | 忘了加 → 模板写好了却没有产物（见[输出配置](/configuration/outputs/)） |

同一个页面可以输出任意多种格式。你可以定义任意数量的输出格式，只要每种格式最终解析到唯一的文件系统路径即可。默认配置的表格形式如下：

| 键名 | mediaType | weight | baseName | isHTML | isPlainText | noUgly | notAlternative | path | permalinkable | protocol | rel | root | ugly |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `html` | `text/html` | 10 | `index` | `true` | `false` | `false` | `false` | `''` | `true` | `''` | `canonical` | `false` | `false` |
| `rss` | `application/rss+xml` | 0 | `index` | `false` | `false` | `true` | `false` | `''` | `false` | `''` | `alternate` | `false` | `false` |
| `json` | `application/json` | 0 | `index` | `false` | `true` | `false` | `false` | `''` | `false` | `''` | `alternate` | `false` | `false` |
| `amp` | `text/html` | 0 | `index` | `true` | `false` | `false` | `false` | `amp` | `true` | `''` | `amphtml` | `false` | `false` |
| `calendar` | `text/calendar` | 0 | `index` | `false` | `true` | `false` | `false` | `''` | `false` | `webcal://` | `alternate` | `false` | `false` |
| `css` | `text/css` | 0 | `styles` | `false` | `true` | `false` | `true` | `''` | `false` | `''` | `stylesheet` | `false` | `false` |
| `csv` | `text/csv` | 0 | `index` | `false` | `true` | `false` | `false` | `''` | `false` | `''` | `alternate` | `false` | `false` |
| `markdown` | `text/markdown` | 0 | `index` | `false` | `true` | `false` | `false` | `''` | `false` | `''` | `alternate` | `false` | `false` |
| `robots` | `text/plain` | 0 | `robots` | `false` | `true` | `false` | `false` | `''` | `false` | `''` | `alternate` | `true` | `false` |
| `sitemap` | `application/xml` | 0 | `sitemap` | `false` | `false` | `false` | `false` | `''` | `false` | `''` | `sitemap` | `false` | `true` |
| `sitemapindex` | `application/xml` | 0 | `sitemap` | `false` | `false` | `false` | `false` | `''` | `false` | `''` | `sitemap` | `true` | `true` |
| `webappmanifest` | `application/manifest+json` | 0 | `manifest` | `false` | `true` | `false` | `true` | `''` | `false` | `''` | `manifest` | `false` | `false` |

`weight`、`rel`、`baseName`、`path` 取值为空的项，其含义与上文字段说明中的默认行为一致。下面是与上表对应的部分默认配置片段：

```toml
[outputFormats.html]
baseName = 'index'
isHTML = true
isPlainText = false
mediaType = 'text/html'
notAlternative = false
path = ''
permalinkable = true
protocol = ''
rel = ''
root = false
ugly = false
weight = 10

[outputFormats.rss]
baseName = 'index'
isHTML = false
isPlainText = false
mediaType = 'application/rss+xml'
notAlternative = false
path = ''
permalinkable = false
protocol = ''
rel = 'alternate'
root = false
ugly = false
weight = 0
```

## 字段说明

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `baseName` | `string` | `index` | 发布文件的基础名。 |
| `isHTML` | `bool` | `false` | 是否把该输出格式归类为 HTML。它决定 LiveReload 脚本何时注入，并与 `permalinkable` 一起决定是否生成别名重定向。 |
| `isPlainText` | `bool` | `false` | 是否用 Go 的 `text/template` 包而非 `html/template` 包解析该格式的模板。 |
| `mediaType` | `string` | — | 发布文件的媒体类型，必须与已配置的媒体类型之一匹配。 |
| `notAlternative` | `bool` | `false` | 是否把该输出格式排除在 `Page` 对象的 `AlternativeOutputFormats` 方法返回值之外。 |
| `noUgly` | `bool` | `false` | 当项目配置启用了 `uglyURLs` 时，是否对该输出格式禁用丑 URL。 |
| `path` | `string` | — | 该输出格式发布路径的第一段，相对于 `publishDir` 根目录。省略时 Hugo 使用文件原本的内容路径发布。 |
| `permalinkable` | `bool` | `false` | 调用 `Page` 对象的 `Permalink` 与 `RelPermalink` 方法时，是否返回当前渲染格式而非主输出格式。与 `isHTML` 同为 `true` 时才会创建别名重定向。`html` 和 `amp` 默认启用。 |
| `protocol` | `string` | `baseURL` 的协议 | 该输出格式 URL 的协议（scheme），例如 `https://` 或 `webcal://`。默认取项目配置中 `baseURL` 的 scheme，通常是 `https://`。 |
| `rel` | `string` | `canonical` / `alternate` | 输出格式与当前页面的关系，Hugo 用它确定当前页面的规范输出格式。预定义 `html` 格式默认为 `canonical`，其他预定义格式默认为 `alternate`。 |
| `root` | `bool` | `false` | 是否把文件发布到发布目录的根目录。 |
| `ugly` | `bool` | `false` | 当项目配置中 `uglyURLs` 为 `false` 时，是否对该输出格式启用丑 URL。 |
| `weight` | `int` | `0` | 非零时作为输出格式排序的首要依据，其次才按格式名排序。数值小者靠前，大者靠后。Hugo 按排序结果依次渲染各输出格式。`html` 输出格式的默认权重为 `10`，其他为 `0`。 |

## 修改输出格式

任何默认输出格式都可以修改。例如要让 `json` 先于 `html` 渲染：

```toml
[outputFormats.json]
weight = 1
[outputFormats.html]
weight = 2
```

可见修改默认输出格式时，只需要写出与默认值不同的属性。

## 新建输出格式

以 Atom feed 为例，分四步：

第一步，输出格式必须指定媒体类型。Atom 使用 `application/atom+xml`，它不属于默认媒体类型，需要先创建：

```toml
[mediaTypes.'application/atom+xml']
suffixes = ['atom']
```

第二步，创建输出格式：

```toml
[outputFormats.atom]
mediaType = 'application/atom+xml'
noUgly = true
```

其余属性沿用默认值。

第三步，指定要为哪些页面种类渲染该格式：

```toml
[outputs]
home = ['html', 'rss', 'atom']
section = ['html', 'rss', 'atom']
taxonomy = ['html', 'rss', 'atom']
term = ['html', 'rss', 'atom']
```

第四步，创建模板。Atom feed 属于列表，需要创建列表模板，路径为：

```text
layouts/list.atom.atom
```

## 列出输出格式

每个 `Page` 对象提供两个方法：`OutputFormats`（包含当前格式在内的全部格式）与 `AlternativeOutputFormats`。用后者可以在 `head` 元素中生成 `rel` 链接列表：

```go-html-template
{{ range .AlternativeOutputFormats }}
  <link rel="{{ .Rel }}" type="{{ .MediaType.Type }}" href="{{ .Permalink | safeURL }}">
{{ end }}
```

## 链接到输出格式

`Page` 对象的 `Permalink` 与 `RelPermalink` 方法返回的 URL 取决于当前输出格式。对于 `permalinkable` 为 `true` 的格式（如 `html` 和 `amp`），方法返回该格式自身的 URL；对其他格式，则返回页面主输出格式的 URL。

例如在 `page.json.json` 中：

```go-html-template
{{ .RelPermalink }} → /that-page/
{{ with .OutputFormats.Get "json" }}
  {{ .RelPermalink }} → /that-page/index.json
{{ end }}
```

若要让这些方法返回**当前**模板输出格式的 URL，必须把该格式的 `permalinkable` 设为 `true`。在同一个 `page.json.json` 模板中为 `json` 启用后：

```go-html-template
{{ .RelPermalink }} → /that-page/index.json
{{ with .OutputFormats.Get "html" }}
  {{ .RelPermalink }} → /that-page/
{{ end }}
```

## 模板查找顺序

每种输出格式都需要一个符合模板查找顺序的模板。文件名的具体形式为 `[页面种类].[输出格式].[后缀]`，例如对 section 页面：

| 输出格式 | 模板路径 |
| --- | --- |
| `html` | `layouts/section.html.html` |
| `json` | `layouts/section.json.json` |
| `rss` | `layouts/section.rss.xml` |

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 新建了输出格式，页面没有多出文件 | `[outputs]` 没有为对应页面种类加上该格式名 | 见本页「新建输出格式」第三步 |
| 构建报「找不到模板」 | 缺 `[页面种类].[输出格式].[后缀]` 形式的模板 | 按本页「模板查找顺序」创建；Atom 的例子是 `layouts/list.atom.atom` |
| JSON 输出被转义、结构异常 | 没有设 `isPlainText = true`，模板被 `html/template` 解析 | 设 `isPlainText = true`；**实测（Hugo 0.167，本站）**：本站自定义的 `md`、`pagesjson`、`llms` 输出格式都设了它 |
| `page.json.json` 里的 `.RelPermalink` 指向 HTML 地址 | 该格式的 `permalinkable` 仍是默认 `false` | 需要返回当前格式地址时设为 `true` |
| 两个格式的产物互相覆盖 | `baseName` / `path` / `root` 组合后解析到同一路径 | 上游要求每种格式解析到唯一路径；逐项核对这三个字段 |
| `head` 里多出不需要的 `alternate` 链接 | 该格式的 `notAlternative` 为默认 `false`（`css`、`manifest` 等默认已设 `true`） | 为辅助类格式设 `notAlternative = true` |
| 报错看不懂 | 多与媒体类型名或模板路径有关 | 见[媒体类型配置](/configuration/media-types/)与[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。
