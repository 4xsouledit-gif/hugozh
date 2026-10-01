+++
title = "级联配置"
linkTitle = "级联配置"
description = "用 cascade 把页面参数、目标与切片级联到多组页面。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/configuration/cascade/"
+++

## 概述

级联（cascade）会把页面参数和其他前置元数据向下传递给一组页面。默认配置为：

```toml
cascade = []
```

在站点配置中，`cascade` 是切片类型的键，因此必须写出分区名。例如，把 `color` 页面参数级联到所有页面：

```toml
[[cascade]]
[cascade.params]
color = 'red'
```

> 也可以在页面的前置元数据中配置级联行为，详见[前置元数据](/content-management/front-matter/#级联)。

## 目标

`target` 键接受一个页面匹配器，用来把级联值限制到部分页面。如果省略 `target`，级联值会应用到所有页面。

页面匹配器按逻辑路径、页面类型、环境或站点筛选页面，可以使用以下关键字及其任意组合：

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `environment` | `string` | — | glob 模式，匹配构建环境，例如 `{staging,production}`。 |
| `kind` | `string` | — | glob 模式，匹配页面类型，例如 `{taxonomy,term}`。 |
| `lang` | `string` | — | 已弃用，请改用 `sites` 设置。Hugo 0.153.0 起弃用。 |
| `path` | `string` | — | glob 模式，匹配页面的逻辑路径，例如 `{/books,/books/**}`。 |
| `sites` | `map` | — | 站点矩阵，可匹配语言、版本、角色等内容维度的任意组合。Hugo 0.153.0 及更高版本可用。 |

例如，把 `color` 页面参数级联到 `articles` 分区及其所有下级页面，但仅限英语（`en`）和德语（`de`）语言站点：

```toml
[cascade.params]
color = 'red'
[cascade.target]
path = '{/articles,/articles/**}'
[cascade.target.sites.matrix]
languages = '{en,de}'
```

> `target` 的别名 `_target` 已弃用，并将在未来的版本中移除。

## 切片

在切片中定义多个级联映射，即可为不同目标应用不同的值。例如：

```toml
[[cascade]]
[cascade.params]
color = 'red'
[cascade.target]
path = '{/articles,/articles/**}'
[[cascade]]
[cascade.params]
color = 'blue'
[cascade.target]
path = '{/tutorials,/tutorials/**}'
```

上例会依次匹配各条级联规则，先为 `/articles` 分区设置 `color = 'red'`，再为 `/tutorials` 分区设置 `color = 'blue'`，未命中任何目标的页面不受影响。
