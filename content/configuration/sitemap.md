+++
title = "站点地图配置"
linkTitle = "站点地图配置"
description = "通过 sitemap 配置站点地图的字段、文件名与开关。"
date = 2026-10-01
weight = 300
source = "https://gohugo.io/configuration/sitemap/"
+++

## 这一页解决什么问题

站点地图（`sitemap.xml`）告诉搜索引擎有哪些页面可抓，以及各页面的更新频率与相对优先级。这一页只有四个键，但有一个必须记住的细节：**默认值表示「不输出该字段」**——`changefreq` 的默认 `""` 与 `priority` 的默认 `-1` 都不是「空值」或「最低优先级」，而是干脆不写进 XML。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `changefreq` / `priority` | 站点内容丰富，想给搜索引擎一点抓取提示 | `priority` 只接受 0.0–1.0，越界值在协议层面无效，搜索引擎会忽略该字段 |
| `disable` | 某些页面（隐私页、示例页）不该出现在站点地图里 | 只想排除一页却写在站点级 → 整站地图被关掉（或反过来，一页都没排除） |
| `filename` | 托管平台要求站点地图用别的文件名 | 改名后 `robots.txt` 中的 `Sitemap:` 指向没同步 → 搜索引擎找不到地图 |

**实测（Hugo 0.167，本站）**：本站 `hugo.toml` 设置了 `[sitemap] changefreq = "weekly"` 与 `priority = 0.5`，`hugo config` 输出的 `[sitemap]` 段中可以看到这两项生效。

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| XML 里整段 `<changefreq>` / `<priority>` 缺失 | 默认值（`""` 与 `-1`）的含义就是「省略该字段」 | 显式设值，例如 `changefreq = 'weekly'`、`priority = 0.5` |
| 某页面不该出现却出现了 | 只在站点配置里设了默认值，没在该页 front matter 写 `sitemap.disable` | 在该页 front matter 中写 `sitemap: {disable: true}`，格式与所用 front matter 语法一致 |
| 站点地图存在，搜索引擎却没抓 | `robots.txt` 中没有指向地图的 `Sitemap:` 行 | 补上该行，或启用 `enableRobotsTXT` 让 Hugo 输出内置的 `robots.txt` |
| 改了字段但产物没变 | 改错了层级：站点默认值在 `hugo.toml` 的 `[sitemap]`，单页覆盖在该页 front matter | 用 `hugo config` 确认站点级取值，再检查该页 front matter 是否覆盖了它 |

更多排查入口见[故障排查](/troubleshooting/)。
