+++
title = "分页配置"
linkTitle = "分页配置"
description = "配置每页条目数、翻页 URL 片段与别名生成行为。"
date = 2026-10-01
weight = 210
source = "https://gohugo.io/configuration/pagination/"
+++

## 这一页解决什么问题

`pagination` 控制列表页怎么分页：每页容纳多少条、第 2 页的 URL 长什么样。默认每页 `10` 条、分页片段是 `page`。

改这里最常见的后果是**旧的分页地址失效**：`pagerSize` 一变，页数跟着变；`path` 一变，所有 `/page/2/` 形式的地址都换名字。改之前先想清楚有没有外部链接或收藏依赖它们。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `pagerSize` | 列表页太长或太短，希望一页容纳更多条目 | 调大后总页数减少，原来的 `/page/3/` 之类地址 **404**（构建成功，不报错） |
| `path` | URL 里不想出现英文 `page`（多语言站点常用本地化词） | 改动后旧地址全部失效；取含空格或非 ASCII 的值会让 URL 难以阅读与分享 |
| `disableAliases` | 不希望第一个分页器额外生成别名重定向 | 设为 `true` 后原有的别名消失，依赖该别名的旧链接 404 |

## 默认配置

`pagination` 区段控制列表页面的分页行为。以下为默认值：

```toml
[pagination]
disableAliases = false
pagerSize = 10
path = 'page'
```

## 设置项

| 键名 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `disableAliases` | `bool` | `false` | 是否禁用第一个分页器的[别名](/content-management/urls/)生成。 |
| `pagerSize` | `int` | `10` | 每个分页器包含的页面数量。 |
| `path` | `string` | `page` | 分页 URL 中标识「目标页面是分页器」的那一段。 |

`pagerSize` 决定单个分页器容纳多少条内容。首页 `/posts/` 显示前 `pagerSize` 条，第 2 页为 `/posts/page/2/`，依此类推。若把 `path` 改为 `seite`，则第 2 页变为 `/posts/seite/2/`。

`disableAliases` 针对的是第一个分页器：默认情况下 Hugo 为第一个分页器生成别名并重定向，设置为 `true` 后不再生成。

```toml
[pagination]
pagerSize = 20
path = 'seite'
```

## 多语言项目

多语言项目可以在各语言键下分别定义分页行为，例如英语每页 10 条、德语每页 20 条，并使用各自的 URL 片段：

```toml
[languages.en]
contentDir = 'content/en'
direction = 'ltr'
label = 'English'
locale = 'en-US'
weight = 1

[languages.en.pagination]
disableAliases = true
pagerSize = 10
path = 'page'

[languages.de]
contentDir = 'content/de'
direction = 'ltr'
label = 'Deutsch'
locale = 'de-DE'
weight = 2

[languages.de.pagination]
disableAliases = true
pagerSize = 20
path = 'blatt'
```

## 注意事项

分页设置只影响分页器的规模与 URL 形态，不会改变内容的默认排序。站点若把内容大量集中在少数列表页，可适当调大 `pagerSize`；把 `path` 改成非 ASCII 或含空格的字符串会让 URL 难以阅读，建议保持简短的小写单词。

相关阅读：[配置站点](/configuration/)、[URL 管理](/content-management/urls/)。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 改了 `pagerSize`，旧的分页地址 404 | 总页数变化，原有的编号页不再存在 | 让 `disableAliases` 保持默认（为第一个分页器生成别名重定向），或在平台上配置跳转规则 |
| 第 2 页地址不是 `/page/2/` | `path` 被改过，或被语言级配置覆盖 | 同时检查站点级 `[pagination]` 与 `[languages.<lang>.pagination]` 两处 |
| 分页完全没生效，内容全挤在一页 | 模板没有使用分页器（`Paginate` / `Paginator`） | 这是模板侧的问题，不是配置问题：检查列表模板是否调用了分页器 |
| 只有部分语言的分页行为不同 | 该语言写了自己的 `[languages.<lang>.pagination]` | 想统一就删掉语言级覆盖；想分开就把两处都写清楚 |

更多排查入口见[故障排查](/troubleshooting/)。
