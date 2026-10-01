+++
title = "分页配置"
linkTitle = "分页配置"
description = "配置每页条目数、翻页 URL 片段与别名生成行为。"
date = 2026-10-01
weight = 210
source = "https://gohugo.io/configuration/pagination/"
+++

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
