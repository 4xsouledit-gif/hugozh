+++
title = "站点地图"
linkTitle = "站点地图"
description = "使用内建模板生成 sitemap.xml，并按页面或全站调整配置。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/templates/sitemap/"
+++

## 概览

Hugo 内建的站点地图模板符合 [sitemap 协议](https://www.sitemaps.org/protocol.html) v0.9 版。

单语言项目中，Hugo 使用内建的 sitemap 模板，在 `publishDir` 根目录生成一个 `sitemap.xml`。

多语言项目则会生成两份内容：

- 在每种语言（每个站点）的根目录下，使用内建的 sitemap 模板生成各自语言的 `sitemap.xml`；
- 在 `publishDir` 根目录下，使用内建的 sitemapindex 模板生成一个索引文件 `sitemapindex.xml`，把各语言的地图汇总起来。

## 配置

站点地图的默认行为可在项目配置的 `[sitemap]` 小节中调整，可用的键包括：

- `changeFreq`：页面默认的更新频率，取值形如 `daily`、`weekly`、`monthly`；
- `priority`：页面默认的优先级，取值在 `0.0` 到 `1.0` 之间；
- `filename`：生成的文件名，默认是 `sitemap.xml`。

这些值作为全站默认值生效，单页可以在前置元数据中覆盖。修改 `filename` 时请注意，输出文件名会随之改变。

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

## 覆盖内建模板

要覆盖内建的 `sitemap.xml` 模板，创建 `layouts/sitemap.xml` 文件即可。遍历页面集合时，分别用 `.Sitemap.ChangeFreq` 和 `.Sitemap.Priority` 读取**更新频率**与**优先级**——这两个值已经按「前置元数据优先、否则用全站默认」的规则解析完毕，模板里直接输出即可。

要覆盖内建的 `sitemapindex.xml` 模板，则创建 `layouts/sitemapindex.xml` 文件。多语言项目通常需要定制的是这个索引文件，例如只把部分语言列入索引。

## 关闭站点地图生成

如果站点不需要站点地图，可以在项目配置中关闭对应的输出类型：

```toml {file="hugo.toml"}
disableKinds = ['sitemap']
```

设置之后，Hugo 不再生成 `sitemap.xml`（以及多语言项目的索引文件），适合本身不公开、也不希望被搜索引擎建立索引的站点。
