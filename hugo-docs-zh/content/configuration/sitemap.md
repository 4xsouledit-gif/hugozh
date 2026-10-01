+++
title = "站点地图配置"
linkTitle = "站点地图配置"
description = "通过 sitemap 配置站点地图的字段、文件名与开关。"
date = 2026-10-01
weight = 300
source = "https://gohugo.io/configuration/sitemap/"
+++

以下是站点地图的默认配置值。除非在 front matter 中被覆盖，它们会作用于所有页面。

## 字段

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `changefreq` | `string` | `""` | 页面可能发生变化的频率。有效值为 `always`、`hourly`、`daily`、`weekly`、`monthly`、`yearly`、`never`。使用默认值 `""` 时，Hugo 会从站点地图中省略该字段。 |
| `disable` | `bool` | `false` | 是否禁止把页面纳入站点地图。在 front matter 中设为 `true` 可排除该页面。 |
| `filename` | `string` | `sitemap.xml` | 生成文件的名称。 |
| `priority` | `float` | `-1` | 该页面相对于站点上其他页面的优先级，有效值范围为 0.0 到 1.0。使用默认值 `-1` 时，Hugo 会从站点地图中省略该字段。 |

`changefreq` 与 `priority` 的取值含义参见 [sitemaps.org 协议](https://www.sitemaps.org/protocol.html)，两者的默认值都表示“不输出该字段”，而不是输出空值。

## 示例

站点级默认配置：

```toml
[sitemap]
changefreq = 'weekly'
disable = false
filename = 'sitemap.xml'
priority = 0.5
```

在单个页面的 front matter 中覆盖默认值：

```yaml
title: 示例页面
sitemap:
  changefreq: daily
  priority: 0.8
```

把某个页面排除出站点地图：

```yaml
title: 不应出现在站点地图中的页面
sitemap:
  disable: true
```

站点地图的输出仍然使用[模板](/templates/)目录中的站点地图模板，因此如需调整 XML 结构，可以覆盖内置模板。
