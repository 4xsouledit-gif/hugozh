+++
title = "服务配置"
linkTitle = "服务配置"
description = "通过 services 配置 Hugo 内嵌模板所需的凭据与行为。"
date = 2026-10-01
weight = 290
source = "https://gohugo.io/configuration/services/"
+++

## 这一页解决什么问题

`[services]` 给 Hugo 的**内嵌模板**（Disqus 评论、Google Analytics、RSS、`x` 短代码）提供参数：不填就不会启用对应功能。这一页列清有哪些键、在模板里怎么读，以及「填了却没生效」通常卡在哪。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `disqus.shortname` | 使用 Hugo 内嵌的 Disqus 评论模板 | shortname 写错 → 评论区空白或指向别人的站点，页面本身不报错 |
| `googleAnalytics.id` | 使用内嵌的 Google Analytics 4 模板 | ID 写错 → 统计后台收不到数据；值必须原样照抄（`G-XXXXXXXXXX`） |
| `rss.limit` | feed 条目过多，需要限量（默认 `-1` 表示不限） | 设成 `0` → feed 里没有条目；条目极多又不设限 → feed 体积失控 |
| `x.disableInlineCSS` | 打算自己为 `x` 短代码提供样式 | 开启后不再输出内联 CSS，忘记补样式 → 嵌入内容没有样式 |

**什么时候别用**：站点用的是**主题自带的**评论或统计实现时，在这里填写不会起作用——模板根本不读这些值，症状是「配置写了、页面上什么都没出现」。先确认主题是否调用了 Hugo 的内嵌模板。

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 填了 ID 或 shortname，页面上依然没有统计/评论区 | 主题没有调用 Hugo 内嵌模板，这些键只对内嵌模板生效 | 查主题是否调用了 `google_analytics.html` 一类内嵌模板；否则改到主题自己的参数位置 |
| 模板里读到的值是空 | 子表名写错（例如写成 `[services.google]`），Hugo 不报错，只当作未设置 | 对照本页字段表核对子表名与键名；用 `hugo config` 确认 |
| `rss.limit` 设为正数但 feed 条目没变少 | 该限制按 feed 模板读取的页面集合生效；改的是别的输出格式或另有分页逻辑 | 先用 `hugo build` 后检查 `public/` 下的 feed；确认该 limit 是当前 feed 使用的值 |
| 报错看不懂 | 这类错误通常来自内嵌模板渲染，而不是配置本身 | 到[故障排查](/troubleshooting/)按现象查；必要时在模板里打印 `.Site.Config.Services` 确认取值 |

更多排查入口见[故障排查](/troubleshooting/)。
