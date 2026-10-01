+++
title = "内建模板"
linkTitle = "内建模板"
description = "Hugo 自带的内建模板清单，以及覆盖它们的通用做法。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/templates/embedded/"
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

## 覆盖内建模板

覆盖内建局部模板的方法是把它的**源码**复制到 `layouts/_partials` 目录下的同名文件里，再用 `partial` 函数从模板中调用。下面各小节会给出每个模板对应的文件名与调用写法。

覆盖内建输出模板的方法与之类似：在 `layouts` 目录下创建同名文件即可，详见[站点地图](/templates/sitemap/)与 [RSS 订阅](/templates/rss/)两页。

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

此外还可以在单个页面的前置元数据中设置 `disqus_identifier`（讨论串的唯一标识，URL 变化时用它保留评论）、`disqus_title`（讨论串标题）、`disqus_url`（讨论串的规范 URL，同一内容有多个地址时用它覆盖 Disqus 识别讨论串所用的地址）。

> [!NOTE]
> 本地预览站点时，Hugo 会把 Disqus 组件替换为一句提示，说明本地预览默认不加载 Disqus 评论。

### 隐私

在项目配置的隐私设置中把 `disable` 设为 `true` 即可禁用该模板，默认值为 `false`。

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

### 隐私

隐私设置支持两个键：`disable` 决定是否禁用该模板，默认 `false`；`respectDoNotTrack` 决定是否尊重浏览器的「不跟踪」设置，默认 `true`。

## Open Graph

Hugo 内置了 [Open Graph 协议](https://ogp.me/)的模板。这些元数据让页面在主流社交媒体和消息平台上被分享时呈现为富对象。在模板中加入：

```go-html-template
{{ partial "opengraph.html" . }}
```

要覆盖内建模板，把源码复制到 `layouts/_partials/opengraph.html`，再照上面的写法调用。

### 配置

该模板由项目配置与各页面的[前置元数据](/content-management/front-matter/)共同决定，常用项包括站点标题、`params.description`、`params.images`、`params.social.facebook_app_id` 以及 `series` 分类法。

### 元数据

Hugo 会输出这些元数据：`og:url`（页面永久链接）、`og:site_name`（站点标题）、`og:title`（页面标题，依次回退到站点标题与配置中的 `params.title`）、`og:description`（页面描述，依次回退到页面摘要与 `params.description`）、`og:locale`（前置元数据的 `locale`，回退到站点语言的 `locale`，其中的连字符会替换为下划线，例如 `en-US` 变为 `en_US`）、`og:type`（普通页面为 `article`，列表页与首页为 `website`）。

文章页面还会输出 `article:section`（页面所属的顶层 section）、`article:published_time`（发布日期）、`article:modified_time`（最后修改日期）以及 `article:tag`（前 6 个标签）。图片元数据最多输出 6 个 `og:image` 标签。

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

该模板由页面数据与各页面的前置元数据共同决定。

### 元数据

Hugo 输出这些 microdata：`name`（页面标题，回退到站点标题）、`description`（页面描述，依次回退到页面摘要与配置中的 `params.description`）、`datePublished`（发布日期）、`dateModified`（最后修改日期）、`wordCount`（字数）。图片元数据最多输出 6 个 `image` 标签。

关键词元数据按以下优先级取值：`keywords` 被定义为分类法时，取该分类法各条目的标题；否则取前置元数据中的 `keywords`；再取 `tags` 分类法各条目的标题；最后取所有分类法条目的标题。

## X（Twitter）卡片

Hugo 内置了 [X（Twitter）卡片](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)的模板，这类元数据用于在链接到本站的推文中附加富媒体内容。在模板中加入：

```go-html-template
{{ partial "twitter_cards.html" . }}
```

要覆盖内建模板，把源码复制到 `layouts/_partials/twitter_cards.html`，再照上面的写法调用。

### 配置

该模板由项目配置与各页面的前置元数据共同决定，常用项包括 `params.description`、`params.images` 与 `params.social.twitter`。

### 元数据

如果找到了图片，Hugo 把 `twitter:card` 设为 `summary_large_image`，并用找到的第一张图片输出 `twitter:image` 标签；没有找到图片时，把 `twitter:card` 设为 `summary` 并省略图片标签。此外还会输出 `twitter:title`（页面标题，依次回退到站点标题与 `params.title`）、`twitter:description`（页面描述，依次回退到页面摘要与 `params.description`）以及 `twitter:site`（配置中的 `params.social.twitter`，缺少 `@` 前缀时会自动补上）。例如配置里写 `twitter = 'GoHugoIO'`，Hugo 渲染出：

```html
<meta name="twitter:site" content="@GoHugoIO"/>
```
