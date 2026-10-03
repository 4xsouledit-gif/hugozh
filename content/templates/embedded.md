+++
title = "内建模板"
linkTitle = "内建模板"
description = "Hugo 自带的内建局部模板清单：Disqus、Google Analytics、Open Graph、分页、Schema、X 卡片，含配置示例、元数据清单与覆盖方法。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/templates/embedded/"

[params.teach]
difficulty = "进阶"
time = "30–40 分钟"
prereq = [
  "有一个能构建的站点，并且模板里有 `head` 元素可以插标签。",
  "知道局部模板（partial）的调用方式（见[内容类型](/templates/types/)）。",
]
outcomes = [
  "按需要把评论、统计、社交卡片、分页导航这几类内建模板接进站点；",
  "为 Open Graph / Schema / X 卡片准备好配置与页面前置元数据，并知道回退顺序；",
  "构建后在 `public/` 的 HTML 里核对 `og:*`、`twitter:*`、microdata 是否按预期输出；",
  "需要改结构时，用「同名局部模板」覆盖内建模板，而不是改 Hugo 源码。",
]
next = ["/templates/types/", "/templates/pagination/", "/configuration/"]

+++

## 内建模板清单

Hugo 为常见需求内置了一批模板，无需自己编写即可直接调用。按调用方式可以把它们分为两类。

**内建局部模板**放在 `_internal/` 下，用 `partial` 函数调用：

| 内建模板 | 用途 |
| --- | --- |
| `_internal/disqus.html` | Disqus 评论组件 |
| `_internal/google_analytics.html` | Google Analytics 4 |
| `_internal/opengraph.html` | Open Graph 协议元数据 |
| `_internal/pagination.html` | pager 之间的分页导航 |
| `_internal/schema.html` | microdata 结构化数据 |
| `_internal/twitter_cards.html` | X（Twitter）卡片元数据 |

**内建的输出模板**用于生成整份文件，它们同样位于 Hugo 的内建模板命名空间中，例如 RSS 的 `_internal/rss.xml`、站点地图的 `_internal/sitemap.xml` 与多语言索引的 `_internal/sitemapindex.xml`。这类模板不需要在页面模板中调用，Hugo 在生成对应输出格式时自动使用。

调用时**不写 `_internal/` 前缀**：写 `{{ partial "opengraph.html" . }}`，Hugo 会找到内建的那一份。这样一来，覆盖内建模板也只需要两步：把同名文件放进 `layouts/_partials`，其余调用处一行都不用改。

## 什么时候用、什么时候别用

| 内建模板 | 什么时候用 | 什么时候别用 |
| --- | --- | --- |
| Disqus | 想给文章加评论且愿意引入第三方脚本 | 站点面向无法访问境外服务的读者；或对隐私、性能有硬要求 |
| Google Analytics | 需要访问统计 | 站点不公开、或不想向第三方上报访客数据（可用隐私设置关闭） |
| Open Graph | 页面会被分享到社交平台或聊天工具 | 站点纯内部使用、没有分享场景 |
| 分页 | 列表页内容超过一屏 | 列表本身很短（一页放得下） |
| Schema | 希望搜索结果展示结构化信息 | 站点不需要被搜索引擎收录 |
| X 卡片 | 内容会被分享到 X（Twitter） | 不运营 X 账号、也不在意分享样式 |

## Disqus

Hugo 内置了 [Disqus](https://disqus.com) 评论模板，它同时适用于静态与动态网站。使用前需要先[注册](https://disqus.com/profile/signup/)该免费服务并取得站点短名（shortname）。在模板中加入：

```go-html-template
{{ partial "disqus.html" . }}
```

要覆盖它，把源码复制到 `layouts/_partials/disqus.html`，再按上面的写法调用。

### 配置

只需在项目配置中设置短名：

```toml {file="hugo.toml"}
[services.disqus]
shortname = 'your-disqus-shortname'
```

此外还可以在单个页面的前置元数据中设置这三个参数（类型均为 `string`）：

`disqus_identifier`
: 讨论串的唯一标识，URL 变化时用它保留评论。

`disqus_title`
: 讨论串标题。

`disqus_url`
: 讨论串的规范 URL，同一内容有多个地址时用它覆盖 Disqus 识别讨论串所用的地址。

```toml {file="content/blog/my-post.md"}
[params]
disqus_identifier = 'unique-identifier'
disqus_title = 'Post title'
disqus_url = 'https://example.org/blog/my-post/'
```

> [!NOTE]
> 本地预览站点时，Hugo 会把 Disqus 组件替换为一句提示，说明本地预览默认不加载 Disqus 评论。

**这意味着本地「看不到评论框」是正常现象**，不要为了调试它去改模板；要验证就部署到线上预览环境。

### 隐私

在项目配置的隐私设置中把 `disable` 设为 `true` 即可禁用该模板，默认值为 `false`。

```toml {file="hugo.toml"}
[privacy.disqus]
disable = true
```

## Google Analytics

Hugo 内置了 [Google Analytics 4](https://support.google.com/analytics/answer/10089681) 的模板。在模板中加入：

```go-html-template
{{ partial "google_analytics.html" . }}
```

要覆盖内建模板，把源码复制到 `layouts/_partials/google_analytics.html`，再照上面的写法调用。

### 配置

在项目配置中提供跟踪 ID：

```toml {file="hugo.toml"}
[services.googleAnalytics]
id = 'G-MEASUREMENT_ID'
```

> [!NOTE]
> 如果配置的 ID 以 `ua-` 开头（不区分大小写），Hugo 会记录一条警告并且什么都不渲染。Google Universal Analytics（UA）自 2023 年 7 月 1 日起已被 Google Analytics 4（GA4）取代，请创建 GA4 媒体资源和数据流，再用新的衡量 ID 更新项目配置。

这条警告值得记住：**页面上没有统计脚本、终端里却只有一行 WARNING**，多半就是 ID 还是老的 `UA-` 格式。

### 隐私

隐私设置支持两个键：`disable` 决定是否禁用该模板，默认 `false`；`respectDoNotTrack` 决定是否尊重浏览器的「不跟踪」设置，默认 `true`。

```toml {file="hugo.toml"}
[privacy.googleAnalytics]
disable = false
respectDoNotTrack = true
```

## Open Graph

Hugo 内置了 [Open Graph 协议](https://ogp.me/)的模板。这些元数据让页面在主流社交媒体和消息平台上被分享时呈现为富对象。在模板中加入：

```go-html-template
{{ partial "opengraph.html" . }}
```

要覆盖内建模板，把源码复制到 `layouts/_partials/opengraph.html`，再照上面的写法调用。

### 配置

该模板由项目配置与各页面的[前置元数据](/content-management/front-matter/)共同决定：

```toml {file="hugo.toml"}
title = 'My cool site'
[params]
  description = 'Text about my cool site'
  images = ['site-feature-image.jpg']
  [params.social]
  facebook_app_id = '12345678'
[taxonomies]
  series = 'series'
```

```toml {file="content/blog/my-post.md"}
title = 'Post title'
description = 'Text about this post'
date = 2024-03-08T08:18:11-08:00
images = ["post-cover.png"]
audio = []
videos = []
series = []
tags = []
locale = 'en-US'
```

常用项包括站点标题、`params.description`、`params.images`、`params.social.facebook_app_id` 以及 `series` 分类法。

### 元数据

Hugo 会输出这些元数据：`og:url`（页面永久链接）、`og:site_name`（站点标题）、`og:title`（页面标题，依次回退到站点标题与配置中的 `params.title`）、`og:description`（页面描述，依次回退到页面摘要与 `params.description`）、`og:locale`（前置元数据的 `locale`，回退到站点语言的 `locale`，其中的连字符会替换为下划线，例如 `en-US` 变为 `en_US`）、`og:type`（普通页面为 `article`，列表页与首页为 `website`）。

文章页面还会输出 `article:section`（页面所属的顶层 section）、`article:published_time`（发布日期）、`article:modified_time`（最后修改日期）以及 `article:tag`（前 6 个标签）。图片元数据最多输出 6 个 `og:image` 标签。

图片的解析规则（Schema 与 X 卡片同样适用）：

当 `images` 前置元数据参数被设置时，Hugo 会逐个处理每个值。对于站内路径，它先查找页面资源，再查找全局资源：找到就使用资源的永久链接，找不到就把路径转换为绝对 URL。外部 URL 原样使用。

当 `images` 未设置时，Hugo 会在页面资源中查找名字匹配 `*feature*` 的文件，找不到则退到 `*cover*` 或 `*thumbnail*`。如果仍然没有找到图片，就使用站点配置中 `params.images` 数组的第一项，并按照上面的规则处理。

`audio` 与 `videos` 是 `[]string` 类型的前置元数据参数，Hugo 最多输出 6 个 `og:audio` 和 `og:video` 标签，并把每个值传给 `absURL`，把相对路径转换成绝对 URL；与 `images` 不同，这两个参数不会去页面资源或全局资源中查找。

`series` 分类法用于填充 `og:see_also` 元数据：Hugo 取同一系列中除当前页之外的前 7 个页面，最多输出 7 个 `og:see_also` 标签。

Facebook 元数据方面，如果配置中设置了 `params.social.facebook_app_id`，Hugo 输出 `fb:app_id`；否则若设置了 `params.social.facebook_admin`，则输出 `fb:admins`。

## 分页

Hugo 内置了在 pager 之间渲染导航链接的模板。在模板中加入：

```go-html-template
{{ partial "pagination.html" . }}
```

要覆盖内建模板，把源码复制到 `layouts/_partials/pagination.html`，再照上面的写法调用。

内建分页模板有 `default` 和 `terse` 两种格式；`terse` 格式的控件和页码槽位更少，渲染成横向列表时占用更少空间，详见[分页](/templates/pagination/)。

## Schema

Hugo 内置了在模板的 `head` 元素中渲染 [microdata](https://html.spec.whatwg.org/multipage/microdata.html#microdata) `meta` 元素的模板。在模板中加入：

```go-html-template
{{ partial "schema.html" . }}
```

要覆盖内建模板，把源码复制到 `layouts/_partials/schema.html`，再照上面的写法调用。

### 配置

该模板由页面数据与各页面的前置元数据共同决定：

```toml {file="hugo.toml"}
title = 'My cool site'
[params]
  description = 'Text about my cool site'
```

```toml {file="content/blog/my-post.md"}
title = 'Post title'
description = 'Text about this post'
date = 2024-03-08T08:18:11-08:00
lastmod = 2024-03-09T12:00:00-08:00
images = ['post-cover.png']
keywords = ['ssg', 'hugo']
```

### 元数据

Hugo 输出这些 microdata：`name`（页面标题，回退到站点标题）、`description`（页面描述，依次回退到页面摘要与配置中的 `params.description`）、`datePublished`（发布日期）、`dateModified`（最后修改日期）、`wordCount`（字数）。图片元数据最多输出 6 个 `image` 标签，解析规则同 Open Graph 一节。

关键词元数据按以下优先级取值：`keywords` 被定义为分类法时，取该分类法各条目的标题；否则取前置元数据中的 `keywords`；再取 `tags` 分类法各条目的标题；最后取所有分类法条目的标题。

## X（Twitter）卡片

Hugo 内置了 [X（Twitter）卡片](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)的模板，这类元数据用于在链接到本站的推文中附加富媒体内容。在模板中加入：

```go-html-template
{{ partial "twitter_cards.html" . }}
```

要覆盖内建模板，把源码复制到 `layouts/_partials/twitter_cards.html`，再照上面的写法调用。

### 配置

该模板由项目配置与各页面的前置元数据共同决定：

```toml {file="hugo.toml"}
[params]
  description = 'Text about my cool site'
  images = ["site-feature-image.jpg"]
  [params.social]
  twitter = 'GoHugoIO'
```

```toml {file="content/blog/my-post.md"}
title = 'Post title'
description = 'Text about this post'
images = ["post-cover.png"]
```

常用项包括 `params.description`、`params.images` 与 `params.social.twitter`。

### 元数据

如果找到了图片，Hugo 把 `twitter:card` 设为 `summary_large_image`，并用找到的第一张图片输出 `twitter:image` 标签；没有找到图片时，把 `twitter:card` 设为 `summary` 并省略图片标签。图片解析规则同 Open Graph 一节。

此外还会输出 `twitter:title`（页面标题，依次回退到站点标题与 `params.title`）、`twitter:description`（页面描述，依次回退到页面摘要与 `params.description`）以及 `twitter:site`（配置中的 `params.social.twitter`，缺少 `@` 前缀时会自动补上）。例如配置里写 `twitter = 'GoHugoIO'`，Hugo 渲染出：

```html
<meta name="twitter:site" content="@GoHugoIO"/>
```

## 最小可运行示例

把三类元数据模板一起放进 `head`：

```go-html-template {file="layouts/baseof.html"}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>{{ .Title }}</title>
  {{ partial "opengraph.html" . }}
  {{ partial "twitter_cards.html" . }}
  {{ partial "schema.html" . }}
</head>
<body>
  {{ block "main" . }}{{ end }}
</body>
</html>
```

同时准备好站点级默认值（否则 `og:site_name`、`twitter:site` 会缺失）：

```toml {file="hugo.toml"}
baseURL = 'https://example.org/'
title = 'ABC Widgets'

[params]
  description = 'The Best Widgets on Earth'
  images = ['site-feature-image.jpg']
  [params.social]
  twitter = 'GoHugoIO'
```

构建：

```bash
hugo
```

### 结果长什么样

打开 `public/index.html`，在 `head` 里搜索 `og:`，你应当看到（节选，格式与本站实际构建产物一致）：

```html
<meta property="og:site_name" content="ABC Widgets">
<meta property="og:title" content="ABC Widgets">
<meta property="og:description" content="The Best Widgets on Earth">
<meta property="og:type" content="website">
<meta property="og:url" content="https://example.org/">
<meta property="og:locale" content="zh_CN">
```

再搜索 `twitter:`，应当看到 `twitter:card` 与 `twitter:site`（后者带上了 `@`）：

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@GoHugoIO">
```

### 验证标准

1. `og:url` 是**绝对地址**，域名与 `baseURL` 一致；
2. `og:locale` 里的连字符已变成下划线（`zh-CN` → `zh_CN`）；
3. 首页的 `og:type` 是 `website`；随便打开一篇文章页，`og:type` 应当是 `article`，并且多出 `article:published_time`；
4. 文章页里 `og:image`、`twitter:image` 至少有一个，且是绝对 URL；
5. 页面源码里**没有**未替换的模板动作（搜不到 `{{` 开头的大括号串）。

任何一条不满足，先检查两个地方：模板里是否真的调用了对应 partial；`baseURL` 与 `params` 是否写了。**这两类问题都不会报错**，只能靠产物核对。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` → [安装 Hugo](/installation/) |
| 没报错但结果不对 | 页面里没有任何 `og:*` 标签 | 模板里没调用 `{{ partial "opengraph.html" . }}`，或 `head` 里的 partial 名字写错（注意不要写 `_internal/` 前缀） |
| 没报错但结果不对 | `og:description`、`twitter:description` 是空的 | 页面没写 `description`，`params.description` 也没配置 → 按回退顺序补齐 |
| 没报错但结果不对 | `og:image` 指向一个不存在的图片 | `images` 里的路径既不是页面资源也不是全局资源，Hugo 会把它当相对路径转成绝对 URL（不会报错）→ 把图片放进页面包或 `assets/`、`static/` |
| 没报错但结果不对 | 统计脚本没输出，终端只有一行 WARNING | Google Analytics 的 ID 仍是 `UA-` 开头 → 换成 GA4 的 `G-` 衡量 ID |
| 没报错但结果不对 | 本地看不到评论框 | 这是预期行为：本地预览时 Disqus 组件被替换为提示文字 |
| 报错看不懂 | 报错指向某个内建 partial，提示模板执行失败 | 通常是传入的上下文不对（把 `(dict …)` 传给了只需要 `.` 的 partial）→ 按本页示例传当前上下文 |
| 报错看不懂 | 覆盖模板后报语法错误 | 从源码复制时漏了结尾的动作或注释块 → 用 `hugo --renderToMemory` 复现，对照[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。
