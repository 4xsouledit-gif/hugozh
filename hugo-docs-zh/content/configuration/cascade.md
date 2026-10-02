+++
title = "级联配置"
linkTitle = "级联配置"
description = "用 cascade 把页面参数、目标与切片级联到多组页面。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/configuration/cascade/"
+++

## 这一页解决什么问题

级联（cascade）一次性地给**一批页面**写入前置元数据：按路径、页面类型、环境或多维站点筛出目标，再把参数灌进去。它是「每个文件都抄一遍同样的 front matter」的替代方案。

**最常见的坑**：`target` 的匹配模式写错时**没有任何报错**——规则没匹配到任何页面，你以为设置生效了，实际一个页面都没拿到参数。所以每写一条规则，都要用结果去验证（见下文与「常见坑」）。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `[[cascade]]` + `cascade.params` | 某个分区下所有页面都需要相同的自定义参数（配色、布局、作者） | 参数名写错 → 模板取到空值，页面照常构建，**不报错** |
| `cascade.target.path` | 只把值应用到部分路径 | glob 漏写 `/**` → 只有分区首页生效、下级页面拿不到值，表现为「部分页面异常」 |
| `cascade.target.kind` / `environment` / `sites` | 按页面类型、构建环境或多维站点筛选 | 多个筛选键写在同一个 `target` 里是**同时满足**的关系；按「或」的预期写会得到空集合 |
| 多条 `[[cascade]]` | 不同目标用不同值 | 上游明确按声明顺序**依次匹配**；两条规则命中同一页面时，顺序会影响最终值 |

**本站提示**：`cascade` 是切片类型的键，拆到 `config/` 目录时**必须写出分区名**（见[配置简介](/configuration/introduction/)）。

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 级联「设了」，页面完全没变化 | `target` 的 glob 没匹配到任何页面，而 **Hugo 不报错** | 先用省略 `target` 的写法验证参数能否生效，再逐步收紧匹配范围 |
| 只有分区首页生效，子页面没有 | `path` 只写了 `/articles`，没带 `/**` | 写成 `'{/articles,/articles/**}'` 这类模式 |
| 参数取到空值 | 参数写在了 `[cascade]` 下，而不是 `[cascade.params]` 下 | 页面参数放 `cascade.params`；其它前置元数据字段直接写在 `cascade` 下 |
| 配置拆到 `config/` 目录后失效 | `cascade` 是切片类型，拆分文件时必须写出分区名 | 文件里写成 `[[cascade]]`，不要只写裸切片 |
| 多条规则互相覆盖 | 规则按声明顺序依次匹配，后写的会影响先写的 | 调整声明顺序，或把 `target` 收紧到互不重叠 |

更多排查入口见[故障排查](/troubleshooting/)；页面级联的写法见[前置元数据](/content-management/front-matter/)。
