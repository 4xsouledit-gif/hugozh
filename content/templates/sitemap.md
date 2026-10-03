+++
title = "站点地图"
linkTitle = "站点地图"
description = "使用内建模板生成 sitemap.xml：配置默认值、按页面覆盖或排除，并核对构建产物是否符合预期。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/templates/sitemap/"

[params.teach]
difficulty = "入门"
time = "15 分钟"
prereq = [
  "站点能正常构建，`hugo --renderToMemory` 退出码为 0。",
  "会读 TOML/YAML 前置元数据（front matter），知道 `title`、`date` 这类字段写在哪。",
]
outcomes = [
  "说清 `sitemap.xml` 生成在哪个路径、单语言与多语言有什么差别；",
  "用 `[sitemap]` 配置调默认值，并用页面前置元数据单独覆盖或排除某一页；",
  "构建后在 `public/sitemap.xml` 里逐条核对页面，确认被排除的页面真的不在里面；",
  "需要改 XML 结构时知道该覆盖哪个模板文件。",
]
next = ["/templates/rss/", "/templates/robots/", "/configuration/sitemap/"]

+++

## 这一页解决什么问题

站点地图（sitemap）是一份给搜索引擎读的页面清单：它告诉爬虫站点上有哪些页面、它们大概多久更新一次。Hugo 内建的模板会自动生成这份文件，**你通常什么都不用做**；需要动手的场景只有三种：调默认值、把个别页面排除出去、或者改写 XML 结构。

因此这一页的重点不是「怎么生成」，而是「生成在哪、怎么核对、怎么局部改」。

## 概览

Hugo 内建的站点地图模板符合 [sitemap 协议](https://www.sitemaps.org/protocol.html) v0.9 版。

单语言项目中，Hugo 使用内建的 sitemap 模板，在 `publishDir` 根目录生成一个 `sitemap.xml`。

多语言项目则会生成两份内容：

- 在每种语言（每个站点）的根目录下，使用内建的 sitemap 模板生成各自语言的 `sitemap.xml`；
- 在 `publishDir` 根目录下，使用内建的 sitemapindex 模板生成一份汇总索引，把各语言的地图列在一起（这份文件同样受下文的 `filename` 配置影响）。

### 结果长什么样

本地构建后（`hugo`），单体语言站点的产物里会出现 `public/sitemap.xml`，内容形如：

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://example.org/</loc>
  </url>
  <url>
    <loc>https://example.org/posts/hello/</loc>
  </url>
</urlset>
```

要点有两个，都可以自己核对：

- `<loc>` 里是**绝对地址**，由 `baseURL` 决定——所以 `baseURL` 写错时，站点地图里全是错域名，而**构建不会报错**；
- 只有被发布的页面才会出现；草稿（`draft = true`）默认不发布，自然不会进站点地图。

## 配置

站点地图的默认行为可在项目配置的 `[sitemap]` 小节中调整，可用的键包括：

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `changefreq` | `string` | `""` | 页面默认的更新频率，取值形如 `always`、`hourly`、`daily`、`weekly`、`monthly`、`yearly`、`never`。默认值 `""` 表示**不输出该字段**。 |
| `priority` | `float` | `-1` | 页面默认的优先级，取值在 `0.0` 到 `1.0` 之间。默认值 `-1` 表示**不输出该字段**。 |
| `filename` | `string` | `sitemap.xml` | 生成的文件名。 |
| `disable` | `bool` | `false` | 是否禁止把页面纳入站点地图，通常在单个页面的前置元数据中设置。 |

这些值作为全站默认值生效，单页可以在前置元数据中覆盖。修改 `filename` 时请注意，输出文件名会随之改变——如果你的 `robots.txt` 里写死了 `Sitemap: …/sitemap.xml`，两处要一起改；用模板生成 `robots.txt` 并配合 `absURL` 可以避免这类不同步。

最小可运行示例（站点级默认值，写在 `hugo.toml`）：

```toml {file="hugo.toml"}
[sitemap]
  changefreq = 'weekly'
  priority = 0.5
```

构建后你应当看到 `public/sitemap.xml` 的每个 `<url>` 里都多出 `<changefreq>weekly</changefreq>` 与 `<priority>0.5</priority>` 两个子元素。

## 覆盖默认值

在某个页面的前置元数据中，可以覆盖该页在站点地图里的默认值：

```toml {file="content/news.md"}
title = '新闻'
[sitemap]
  changefreq = 'weekly'
  disable = true
  priority = 0.8
```

其中 `changefreq` 与 `priority` 覆盖全站默认值；`disable = true` 表示不把这一页写进站点地图，适合内容较薄或不希望被收录的页面。

### 验证标准

1. 构建：`hugo`；
2. 打开 `public/sitemap.xml`，搜索被你标记 `disable = true` 的那一页的 URL，**应当搜不到**；
3. 再搜索一个正常页面的 URL，**应当能搜到**，并且它的 `<changefreq>`/`<priority>` 与你为它设置的值一致。

只做第 1 步不算验证——站点地图最常见的问题恰恰是「构建成功，但页面被不该出现的规则影响了」。

## 覆盖内建模板

要覆盖内建的 `sitemap.xml` 模板，创建 `layouts/sitemap.xml` 文件即可。遍历页面集合时，分别用 `.Sitemap.ChangeFreq` 和 `.Sitemap.Priority` 读取**更新频率**与**优先级**——这两个值已经按「前置元数据优先、否则用全站默认」的规则解析完毕，模板里直接输出即可：

```xml {file="layouts/sitemap.xml"}
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {{ range .Pages }}
    <url>
      <loc>{{ .Permalink }}</loc>
      {{ with .Sitemap.ChangeFreq }}<changefreq>{{ . }}</changefreq>{{ end }}
      {{ with .Sitemap.Priority }}<priority>{{ . }}</priority>{{ end }}
    </url>
  {{ end }}
</urlset>
```

用 `with` 包住可选的子元素，是因为两个字段的默认值表示「不输出」；直接输出会得到空的 `<changefreq></changefreq>`，与内建模板的行为不一致。

要覆盖内建的 sitemapindex 模板，则创建 `layouts/sitemapindex.xml` 文件。多语言项目通常需要定制的是这个索引文件，例如只把部分语言列入索引。

## 关闭站点地图生成

如果站点不需要站点地图，可以在项目配置中关闭对应的输出类型：

```toml {file="hugo.toml"}
disableKinds = ['sitemap']
```

设置之后，Hugo 不再生成 `sitemap.xml`（以及多语言项目的索引文件），适合本身不公开、也不希望被搜索引擎建立索引的站点。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` → [安装 Hugo](/installation/) |
| 没报错但结果不对 | 站点地图里的域名全是错的 | `baseURL` 与实际部署地址不一致；这类错误不会报错，只能靠打开 `public/sitemap.xml` 核对 → 见[配置](/configuration/) |
| 没报错但结果不对 | 排除了某页，它却还在站点地图里 | `disable` 写在了错误层级（必须放在 `[sitemap]` 表内），或这一页有多个输出格式被一起收录 → 对照本页的 front matter 示例检查缩进 |
| 没报错但结果不对 | 改了 `filename`，`robots.txt` 里的 `Sitemap:` 还指向旧文件名 | 两处配置不同步 → 用模板生成 `robots.txt`，或在改 `filename` 时同步修改 |
| 报错看不懂 | `failed to extract shortcode` 或 XML 结构报错 | 自定义 `layouts/sitemap.xml` 时，正文里的短代码定界符没转义，或模板动作没闭合 → 先用 `hugo --renderToMemory` 复现，再对照[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。
