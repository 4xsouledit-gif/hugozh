+++
title = "丑陋 URL 配置"
linkTitle = "丑陋 URL 配置"
description = "让页面输出为带文件扩展名的丑陋 URL。"
date = 2026-10-01
weight = 320
source = "https://gohugo.io/configuration/ugly-urls/"
+++

## 这一页解决什么问题

默认情况下 Hugo 生成「漂亮 URL」：`/section/article/`，由该目录下的 `index.html` 承载。这一页讲怎么改成「丑陋 URL」：`/section/article.html`。

**只有确有需要时才改**：启用后每个页面的实际 URL 与发布目录结构都会变化，站内外写死的旧链接会立刻失效。这不是样式偏好问题，而是一次会影响索引与外部链接的迁移。

## 什么时候用，什么时候别用

**该用**：

- 目标托管平台或存量系统只认带扩展名的路径；
- 需要把产物当作文件直接分发给只识别文件路径的程序。

**别用**：

- 只是觉得 URL 不够好看——收益很小，而链接迁移、重定向与规则兼容的排查成本很高；
- 站点已上线、且外部有大量指向漂亮 URL 的链接（除非你能同时提供重定向）。

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 启用后大量站内链接 404 | 站内链接写死了旧的漂亮 URL | 站内链接改用 `.RelPermalink` 一类方法生成；旧地址用别名（alias）兜住，见[内容管理](/content-management/) |
| 只想改一个区块，结果整站都变了 | 把 `uglyURLs` 写成了 `true`，而不是映射 | 需要按区块区分时写成 `[uglyURLs]` 映射，见本页「为特定区块生成丑陋 URL」 |
| 站点地图 / RSS 的地址没跟着变 | 该输出格式自身的 `noUgly` 为 `true`（内置 `rss` 就是如此） | 这是预期行为；确有需要时在[输出格式配置](/configuration/output-formats/)里调整 |
| 部署后旧地址 404 | 平台上另有重写或美化规则 | 核对平台规则是否与新文件结构兼容 |

更多排查入口见[故障排查](/troubleshooting/)。
