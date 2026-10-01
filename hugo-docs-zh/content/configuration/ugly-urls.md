+++
title = "丑陋 URL 配置"
linkTitle = "丑陋 URL 配置"
description = "让页面输出为带文件扩展名的丑陋 URL。"
date = 2026-10-01
weight = 320
source = "https://gohugo.io/configuration/ugly-urls/"
+++

丑陋 URL（ugly URL）是带有文件扩展名的 URL。例如：

```text
https://example.org/section/article.html
```

在默认配置下，Hugo 生成的是漂亮 URL（pretty URL）。例如：

```text
https://example.org/section/article/
```

`uglyURLs` 区段用于改变这一行为，既可以作用于整个站点，也可以只作用于特定区块。

## 键名与默认值

| 键名 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `uglyURLs` | `bool` | 未启用（空映射 `{}`） | 设为 `true` 时，为整个站点生成丑陋 URL。 |
| `uglyURLs.<区块名>` | `bool` | 未启用 | 仅为指定区块启用或关闭丑陋 URL。只有把 `uglyURLs` 写成映射时才使用这种形式。 |

默认配置为空，因此站点输出的是漂亮 URL：

```toml
uglyURLs = {}
```

## 为整个站点生成丑陋 URL

把 `uglyURLs` 设为 `true`，站点内的所有页面都会改为输出丑陋 URL：

```toml
uglyURLs = true
```

启用后，原本发布到 `/section/article/` 的页面会改为发布到 `/section/article.html`，发布目录中的文件结构也随之改变。

## 为特定区块生成丑陋 URL

也可以只对部分区块启用。把 `uglyURLs` 写成映射，键为区块名，值为布尔值：

```toml
[uglyURLs]
books = true
films = false
```

上例中 `books` 区块的页面生成丑陋 URL，而 `films` 区块保持漂亮 URL。

## 与输出格式的关系

单个输出格式可以用 `noUgly` 设置覆盖站点级别的 `uglyURLs`：`noUgly` 为 `true` 时，即使启用了丑陋 URL，该输出格式也不会生成丑陋 URL。例如内置的 `rss` 输出格式就把 `noUgly` 设为 `true`，因此它的 URL 始终是漂亮 URL。各输出格式的 `noUgly` 默认值与设置方法见[输出格式配置](/configuration/output-formats/)。

## 注意事项

- 丑陋 URL 会改变页面的实际 URL，之前使用漂亮 URL 的链接可能因此失效；必要时可以用别名（alias）把旧地址重定向到新地址，参见[内容管理](/content-management/)。
- 该设置只影响 URL 与发布路径的形态，页面内容本身不受影响。
- 如果站点部署平台上有额外的重写或美化规则，启用丑陋 URL 后需要确认这些规则仍然适用。
