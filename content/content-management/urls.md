+++
title = "URL 管理"
linkTitle = "URL 管理"
description = "Hugo 如何推导 URL，以及用 slug、url、别名与永久链接定制地址；含覆盖优先级与验证方法。"
date = 2026-10-01
weight = 130
source = "https://gohugo.io/content-management/urls/"

[params.teach]
difficulty = "进阶"
time = "25–35 分钟"
prereq = [
  "知道 `content/` 的目录结构如何映射成 URL（见[内容组织](/content-management/organization/)）。",
  "会改项目配置与前置元数据，能查看构建产物目录。",
]
outcomes = [
  "说清 `url`、`permalinks`、`slug` 三者的覆盖优先级，并预判最终地址；",
  "用 `slug` 把对外地址与文件名解耦，用 `permalinks` 给整个 section 统一 URL 结构；",
  "用 `aliases` 在迁移内容后保住旧链接，并在客户端重定向与服务器端重定向之间做选择；",
  "用 `hugo list all`、`--printPathWarnings` 与产物目录验证地址，而不是靠猜。",
]
next = ["/content-management/organization/", "/configuration/permalinks/", "/troubleshooting/"]

+++

## 这一页解决什么问题

默认情况下，Hugo 渲染页面时生成的 URL 与文件在 `content` 目录中的路径一致。例如：

```text
content/posts/post-1.md -> https://example.org/posts/post-1/
```

通过 front matter 取值与项目配置，可以改变 URL 的结构与外观。

Hugo 的 URL 推导有一条**固定的覆盖链**，理解它就等于理解了这一页。优先级从高到低：

1. 前置元数据 `url`（覆盖整条路径，且不给后代页面继承）；
2. 匹配到的 `permalinks` 模式；
3. 从祖先页面继承下来的 `slug`（0.167.0 起，section / 分类法 / 术语页上的 `slug` 会作用到其下所有页面，包括页面资源）；
4. 页面自身的 `slug`；
5. 否则由目录结构与文件名推导。

`slug` 与 `url` 同时设置时，`url` 胜出。

**验证最终地址，一步到位**：

```bash
hugo list all
```

**你应当看到什么**：`permalink` 列就是每个页面的最终地址。改完 `slug`、`url` 或 `permalinks` 之后重新跑一次，对照这一列即可——**不要凭记忆推断 URL**。再看产物目录确认文件真的写到了那里：

```bash
ls -R public
```

**实测（Hugo 0.167）**：给 `content/posts/urls.md` 设 `slug = 'custom-slug'` 与 `aliases = ['/old-path/']`，构建结果里该页地址是 `/posts/custom-slug/`，同时**多出一个** `public/old-path/index.html`（别名重定向页）；模板里 `.Aliases` 读出 `[/old-path]`。

## 概述

默认情况下，Hugo 渲染页面时生成的 URL 与文件在 `content` 目录中的路径一致。例如：

```text
content/posts/post-1.md -> https://example.org/posts/post-1/
```

通过 front matter 取值与项目配置，可以改变 URL 的结构与外观。

## 前置元数据

用以下 front matter 字段覆盖页面的默认 URL。

### slug

在 front matter 中设置 `slug` 可以覆盖路径的最后一段。该字段不适用于 `home` 页面。

```toml
+++
title = "我的第一篇文章"
slug = "my-first-post"
+++
```

最终 URL 为：

```text
https://example.org/posts/my-first-post/
```

自 v0.167.0 起，在 `section`、分类法或术语页面上设置 `slug` 时，Hugo 会把它应用到其下所有页面的 URL，包括页面的[页面资源](/content-management/page-resources/)。例如：

```toml
+++
title = "Products"
slug = "shop"
+++
```

最终 URL 为：

```text
content/products/_index.md             -> https://example.org/shop/
content/products/electronics/_index.md -> https://example.org/shop/electronics/
content/products/electronics/tv.md     -> https://example.org/shop/electronics/tv/
```

匹配到的[永久链接模式](#永久链接)优先于从祖先页面继承的 slug。

### url

在 front matter 中设置 `url` 可以覆盖整条路径。该字段同样不适用于 `home` 页面。

与 `slug` 不同，`section`、分类法或术语页面上的 `url` 不会影响其下页面的 URL。

> [!NOTE]
> Hugo 不会对 `url` 字段做净化处理，因此你可以生成：
>
> - 包含操作系统保留字符的文件路径。例如 Windows 上的文件路径不能包含任何一个保留字符；若路径中出现了当前操作系统的保留字符，Hugo 会报错。
> - 包含非法字符的 URL。例如 URL 中不允许出现小于号（`<`）。

如果 `slug` 与 `url` 同时设置，`url` 的取值优先。

#### 包含冒号

如果需要让 `url` 字段包含冒号，请用反斜杠转义：字符串用单引号包裹时写一个反斜杠，用双引号包裹时写两个反斜杠。使用 YAML front matter 且不加引号时，写一个反斜杠即可。

```yaml
---
title: Example
url: "my\\:example"
---
```

最终 URL 为 `https://example.org/my:example/`。如前所述，由于冒号（`:`）是保留字符，这种写法在 Windows 上会失败。

#### 文件扩展名

以下 front matter：

```toml
+++
title = "我的第一篇文章"
url = "articles/my-first-article"
+++
```

生成的 URL 是 `https://example.org/articles/my-first-article/`。若写成带扩展名的形式：

```toml
+++
title = "我的第一篇文章"
url = "articles/my-first-article.html"
+++
```

生成的 URL 就是 `https://example.org/articles/my-first-article.html`。

#### 开头的斜杠

在单语言项目中，`url` 无论是否带前导斜杠，都相对于 `baseURL`；在多语言项目中，带前导斜杠的 `url` 相对于 `baseURL`，不带前导斜杠的 `url` 相对于 `baseURL` 加上语言前缀。

| 站点类型 | front matter 中的 `url` | 生成的 URL |
| --- | --- | --- |
| 单语言 | `/about` | `https://example.org/about/` |
| 单语言 | `about` | `https://example.org/about/` |
| 多语言 | `/about` | `https://example.org/about/` |
| 多语言 | `about` | `https://example.org/de/about/` |

#### 令牌

`url` 取值中也可以使用令牌（token），常见于 `cascade` 区段：

```toml
+++
title = "Bar"
[[cascade]]
  url = "/:sections[last]/:slug"
+++
```

## 项目配置

永久链接、URL 外观与后处理都在项目配置中进行。

### 永久链接

用 `permalinks` 配置为页面定义自定义 URL 模式，Hugo 支持两种形式：按 section 的映射形式，以及支持页面匹配器（page matcher）的数组形式。页面匹配器可以按逻辑路径、页面类型、构建环境或站点来筛选页面。

> [!NOTE]
> front matter 中的 `url` 字段会覆盖任何匹配到的永久链接模式。

映射形式以页面类型为键，为每个顶级 section 定义 URL 模式：

```toml
[permalinks.page]
  articles = "/blog/:year/:month/:slug/"
[permalinks.section]
  articles = "/blog/"
```

要按语言配置永久链接，把 `permalinks` 键嵌在语言键之下：

```toml
[languages.de]
  label = "Deutsch"
  locale = "de-DE"
  weight = 1
  [languages.de.permalinks.page]
    articles = "/artikel/:year/:month/:slug/"
  [languages.de.permalinks.section]
    articles = "/artikel/"
```

数组形式用于把不同的 URL 模式应用到不同的页面子集。每个条目必须包含 `pattern` 键，Hugo 采用**第一个**匹配到的模式；可选的 `target` 键接受一个页面匹配器，省略 `target` 时该模式应用到所有页面。把不带 `target` 的模式放在末尾，即可作为兜底规则：

```toml
[[permalinks]]
  pattern = "/:section/:slug/"
```

#### 令牌

在 URL 模式中可以使用以下令牌：

| 令牌 | 含义 |
| --- | --- |
| `:year`、`:month`、`:day` | front matter 中 `date` 字段的四位年份、两位月份、两位日期 |
| `:monthname`、`:weekdayname` | `date` 对应的月份名称、星期名称 |
| `:weekday`、`:yearday` | `date` 对应的星期序号（周日为 `0`）、一年中的第几天 |
| `:section`、`:sections` | 内容的 section、section 层级 |
| `:sectionslug`、`:sectionslugs` | 使用 slug 化名称的 section、section 层级（自 v0.149.0 起） |
| `:title` | front matter 中的 `title`，否则使用自动生成的标题 |
| `:slug` | front matter 中的 `slug`，否则依次退回 `title`、自动标题 |
| `:contentbasename` | 内容文件的基本名（自 v0.144.0 起） |
| `:slugorcontentbasename` | front matter 中的 `slug`，否则使用内容文件的基本名 |

`:sections` 与 `:sectionslugs` 支持切片语法，例如 `:sections[1:]` 表示除第一段之外的全部，`:sections[:last]` 表示除最后一段之外的全部，`:sections[last]` 表示只取最后一段，`:sections[1:2]` 表示第 2 与第 3 段；`:sectionslugs` 的切片写法与此相同，例如 `:sectionslugs[1:]`、`:sectionslugs[:last]`、`:sectionslugs[last]`、`:sectionslugs[1:2]`。切片越界不会报错，因此索引不必精确。

`:sectionslugs` 使用 slug 化后的 section 名称：取名规则依次为 front matter 中的 `slug`、front matter 中的 `title`，最后是自动生成的标题。`:sectionslug` 同理，只是只包含当前这一个 section。

`:filename`、`:slugorfilename` 已废弃，请改用 `:contentbasename` 与 `:slugorcontentbasename`。时间相关的取值也可以使用 Go time 包中的布局字符串组件。

### 外观

用 `uglyURLs` 控制是否生成「丑陋 URL」（ugly URL）。Hugo 默认生成漂亮 URL（pretty URL），形如：

```text
https://example.org/section/article/
```

丑陋 URL 则把页面输出为带 `.html` 扩展名的文件：

```text
https://example.org/section/article.html
```

为全站开启：

```toml
uglyURLs = true
```

也可以只对特定 section 开启：

```toml
[uglyURLs]
  books = true
  films = false
```

### 后处理

Hugo 提供两个互斥的配置项，用于在页面渲染**之后**改写 URL。

#### 规范 URL

> [!CAUTION]
> 这是历史遗留配置，已被模板函数与 Markdown 渲染钩子取代，未来版本可能会移除。

开启后，Hugo 会在页面渲染完成后执行查找替换：查找带有 `action`、`href`、`src`、`srcset`、`url` 属性的站内相对 URL（以斜杠开头），为它们加上 `baseURL` 前缀，转换为绝对 URL。

```html
<a href="/about"> -> <a href="https://example.org/about/">
<img src="/a.gif"> -> <img src="https://example.org/a.gif">
```

```toml
canonifyURLs = true
```

这是一种不完美的暴力替换方式，既可能影响正文内容，也可能影响 HTML 属性。

#### 相对 URL

> [!CAUTION]
> 除非你正在构建可通过文件系统直接打开的免服务器站点，否则不要开启该选项。

开启后，Hugo 同样在渲染后执行查找替换，把上述属性中的站内相对 URL 转换为相对于当前页面的地址。例如渲染 `content/posts/post-1` 时：

```html
<a href="/about"> -> <a href="../../about">
<img src="/a.gif"> -> <img src="../../a.gif">
```

```toml
relativeURLs = true
```

## 别名

别名（alias）可以把旧 URL 重定向到新 URL，在重命名或移动内容时避免出现死链，保证已有的书签与外部链接继续可用。

### 定义别名

在 front matter 的 `aliases` 字段中列出旧路径，Hugo 会在构建时把它们解析为服务器相对路径，并计入 `baseURL` 与语言等内容维度前缀：

```toml
+++
title = "示例一"
date = 2025-02-02
aliases = ["/old-url", "old-name", "../old/path"]
+++
```

如上所示，既可以写站内相对路径，也可以写页面相对路径，页面相对路径还允许使用目录跳转。以文件 `content/examples/example-1.en.md` 为参照，各种写法的解析结果如下：

| 路径类型 | 别名 | 服务器相对路径 |
| --- | --- | --- |
| 站内相对 | `/old-url` | `/en/old-url/` |
| 页面相对 | `old-name` | `/en/examples/old-name/` |
| 页面相对 | `../old/path` | `/en/old/path/` |

### 重定向方式

按托管环境与偏好，实现别名重定向有两种方式：客户端重定向与服务器端重定向。

> [!NOTE]
> 只有同时满足 `isHTML` 与 `permalinkable` 为 `true` 的输出格式才会生成别名数据，这既影响客户端重定向文件的创建，也影响服务器端重定向所用的 `Aliases` 方法的返回结果。

#### 客户端重定向

默认情况下 Hugo 使用客户端重定向，为每个别名生成一个小型 HTML 文件，其中包含 `meta http-equiv="refresh"` 标签，指示浏览器跳转到新地址。这种方式在所有托管服务上都可移植。

采用该方式时，Hugo 会在每个别名位置创建实体目录与 `index.html`。例如 `content/posts/new.md` 的页面相对别名为 `old-path` 时，会生成文件 `public/posts/old-path/index.html`。

除非你提供了自定义布局，Hugo 会使用内建的别名模板生成重定向文件，其内容为：

```go-html-template
<!DOCTYPE html>
<html lang="{{ site.Language.Locale }}">
  <head>
    <title>{{ .Permalink }}</title>
    {{ with .OutputFormats.Canonical }}<link rel="{{ .Rel }}" href="{{ .Permalink }}">{{ end }}
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url={{ .Permalink }}">
  </head>
</html>
```

要覆盖它，可在 `layouts` 目录中创建名为 `alias.html` 的文件，该模板可以访问以下上下文：

`Permalink`
: （`string`）目标页面的绝对 URL。

`Page`
: （`page.Page`）目标页面的完整 `Page` 对象。

#### 服务器端重定向

另一种做法是在 `Page` 对象上使用 `Aliases` 方法，生成一份由 Web 服务器处理的配置文件。这种方式更高效：重定向在 HTTP 头层级完成，无需先让浏览器下载并解析 HTML 正文；同时 Hugo 也不必为每个别名写出实体目录与 HTML 文件，构建与部署都更快。

常见做法是编写一个模板，为具体的托管服务或服务器生成规则文件，例如 Cloudflare、GitLab Pages、Netlify 使用的 `_redirects` 文件，或 Apache、LiteSpeed 使用的 `.htaccess` 文件。

如果采用服务器端重定向，应把项目配置中的 `disableAliases` 设为 `true`，以停止生成单独的 HTML 文件。该设置只阻止实体 HTML 文件的生成，`Page` 对象上的 `Aliases` 方法在配置模板中依然可用。

## baseURL

`baseURL` 是站点根地址，`.Permalink`、`.RelPermalink` 以及 `absURL`、`relURL` 等模板函数都受它影响。构建时可用 `hugo --baseURL` 临时覆盖，便于在预览、测试与生产环境之间切换。配置文件的组织方式见 [配置](/configuration/)。

## 排查地址问题

URL 在部分服务器、CDN 与对象存储上区分大小写，文件名里出现大写字母、空格或非 ASCII 字符时容易产生难以预期的链接。建议文件名统一使用小写字母、数字与连字符，并用 `slug` 把文件名与对外地址解耦。

```sh
# 构建时提示重复的目标路径
hugo --printPathWarnings

# 查看最终生效的配置
hugo config
```

出现地址不符预期时，先用 `hugo config` 确认最终生效的 `baseURL`、`permalinks`、`uglyURLs` 取值，再用 `--printPathWarnings` 检查是否有多个页面写出同一个文件。

## 什么时候改 URL、什么时候别改

**该改**：

- 内容要迁移（换域名、改目录结构）——用 `aliases` 保住旧链接；
- 对外地址需要稳定、不随文件名变化——用 `slug` 把两者解耦；
- 整个 section 的 URL 结构需要统一（例如 `/blog/:year/:month/:slug/`）——用 `permalinks`。

**别改**：

- **只是想「让 URL 好看一点」就随手写 `url`**——它绕过目录结构、不参与 slug 继承，后续移动内容时极易与目录脱节；能用 `slug` 解决的不要用 `url`；
- **上线后再改已有页面的 URL 却不加别名**——所有外链与书签立刻变死链；
- **指望 URL 大小写不敏感**——部分服务器、CDN 与对象存储区分大小写，文件名里出现大写字母、空格或非 ASCII 字符会产生难以预期的链接；文件名一律用小写字母、数字与连字符。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 设了 `slug`，URL 却还是文件名 | 该页有 `url` 字段（优先级更高），或被祖先页面的 `slug` 覆盖 | 用 `hugo list all` 的 `permalink` 列对照；按本页开头的覆盖链逐级排查 |
| 没报错但结果不对 | 在 section 的 `_index.md` 里设了 `url`，子页面地址没变 | `url` **不会**向下继承；只有 `slug` 在 0.167.0 起会继承 | 需要整块统一改地址就用 `permalinks`，或给每个子页面设 `slug` |
| 没报错但结果不对 | 两个页面写到了同一个文件 | 路径冲突（例如 `x.md` 与 `x/index.md`，或 `url` 与 `permalinks` 撞车） | 构建时加 `--printPathWarnings` 定位，改动其中之一 |
| 没报错但结果不对 | 旧链接全部 404 | 迁移时没有写 `aliases`；或写了 `disableAliases = true` 却没让服务器处理重定向 | 补 `aliases`；用了 `disableAliases` 就必须同时生成服务器端重定向规则 |
| 没报错但结果不对 | 别名页面不存在，但构建没报错 | 别名的输出格式不满足 `isHTML` 与 `permalinkable` 都为 `true` | 检查输出格式配置，见[输出格式](/configuration/output-formats/) |
| 报错看不懂 | 构建报文件路径含非法字符 | `url` / `slug` 里含当前操作系统的保留字符（例如 Windows 上的冒号） | 去掉保留字符，或按本页说明用反斜杠转义冒号；跨平台部署时更应避免 |
| 报错看不懂 | 多语言站点里地址少了语言前缀 | 多语言下不带前导斜杠的 `url` 会拼上语言前缀，带前导斜杠的则不会 | 按[开头的斜杠](#开头的斜杠)那张表选择写法 |
| 报错看不懂 | 站内链接在本地正常、上线 404 | 链接里写了驼峰，而输出 URL 全小写 | 站内链接一律写小写根相对路径，构建后跑一遍链接检查 |

更多排查入口见[故障排查](/troubleshooting/)。
