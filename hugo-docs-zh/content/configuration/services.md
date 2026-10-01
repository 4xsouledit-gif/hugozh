+++
title = "服务配置"
linkTitle = "服务配置"
description = "通过 services 配置 Hugo 内嵌模板所需的凭据与行为。"
date = 2026-10-01
weight = 290
source = "https://gohugo.io/configuration/services/"
+++

Hugo 提供内嵌模板来简化站点与内容的创建，其中一些模板是可配置的。例如，内嵌的 Google Analytics 模板需要一个 Google 跟踪 ID。

`[services]` 下的键都位于 `[services.disqus]`、`[services.googleAnalytics]`、`[services.rss]`、`[services.x]` 等子表中。

## 字段

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `disqus.shortname` | `string` | 无 | Disqus 评论系统使用的 shortname，详见[内嵌模板](/templates/)中的 Disqus 部分。 |
| `googleAnalytics.id` | `string` | 无 | Google Analytics 4 属性使用的 Google 跟踪 ID，详见[内嵌模板](/templates/)中的 Google Analytics 部分。 |
| `rss.limit` | `int` | `-1` | RSS feed 中最多包含的条目数，设为 `-1` 表示不限制，详见 [RSS 模板](/templates/)。 |
| `x.disableInlineCSS` | `bool` | `false` | 是否禁用内嵌的 `x` 短代码所渲染的内联 CSS，详见 [x 短代码](/shortcodes/)中的隐私部分。 |

## 模板中读取配置

这些值可以在模板中按下列路径读取（点号两侧的空格只是为了在 Markdown 中清晰展示）：

```text
.Site.Config.Services.Disqus.Shortname
.Site.Config.Services.GoogleAnalytics.ID
.Site.Config.Services.RSS.Limit
.Site.Config.Services.X.DisableInlineCSS
```

## 示例

同时启用 Disqus 评论、Google Analytics 并限制 RSS 条目数的配置：

```toml
[services]
  [services.disqus]
    shortname = 'your-disqus-shortname'
  [services.googleAnalytics]
    id = 'G-XXXXXXXXXX'
  [services.rss]
    limit = 20
  [services.x]
    disableInlineCSS = true
```

只配置其中一项时，其余子表可以完全省略。各键的含义要点如下：`disqus.shortname` 与 `googleAnalytics.id` 默认未设置，不填写就不会启用对应的内嵌模板；`rss.limit` 默认为 `-1`，不设置该键时 RSS 输出包含全部条目；`x.disableInlineCSS` 默认为 `false`，即内嵌 `x` 短代码会输出内联 CSS。

也可以在配置中显式写全默认值：

```toml
[services]
  [services.disqus]
    shortname = ''
  [services.googleAnalytics]
    id = ''
  [services.rss]
    limit = -1
  [services.x]
    disableInlineCSS = false
```
