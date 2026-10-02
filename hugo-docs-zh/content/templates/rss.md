+++
title = "RSS 订阅"
linkTitle = "RSS 订阅"
description = "控制订阅源的生成范围与条数，在页面里引用订阅源，或编写自定义 RSS 模板；含产物核对方法与常见坑。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/templates/rss/"

[params.teach]
difficulty = "入门"
time = "15 分钟"
prereq = [
  "站点能正常构建，并且有一个列表页（首页或 section）可以放内容。",
  "会读 TOML 配置与模板里的动作语法（见[简介](/templates/introduction/)）。",
]
outcomes = [
  "说出默认为哪些页面种类生成订阅源，以及如何按页面种类关闭；",
  "用 `[services.rss] limit` 限制条目数，并在产物里数一数条目是否真的变少了；",
  "在页面 `head` 里加上正确的订阅源 `<link>`，并知道为什么要判空；",
  "需要改订阅源结构时，知道该创建哪些文件名（如 `home.rss.xml`）。",
]
next = ["/templates/sitemap/", "/templates/embedded/", "/templates/lookup-order/"]

+++

## 这一页解决什么问题

RSS 订阅源让读者用阅读器追更，也让聚合服务能抓取站点更新。Hugo 默认就会生成它，所以真正要处理的问题只有三个：

1. **要不要生成**——哪些页面种类需要订阅源；
2. **生成多少条**——不限制时，订阅源会随着站点增长越来越大（本站曾达到 2.1 MB，后来限流到 50 条）；
3. **页面里怎么声明**——在 `head` 里放一个指向订阅源的 `<link>`，阅读器才能自动发现它。

## 配置

默认情况下，构建项目时 Hugo 会为**首页、section、分类法（taxonomy）与分类法条目（term）**页面生成 RSS 订阅源。生成范围由项目配置中的 `[outputs]` 决定。例如，只为首页和 section 页面生成，而不为分类法与条目页面生成：

```toml {file="hugo.toml"}
[outputs]
home = ['html', 'rss']
section = ['html', 'rss']
taxonomy = ['html']
term = ['html']
```

要彻底关闭所有页面类型的订阅源生成：

```toml {file="hugo.toml"}
disableKinds = ['rss']
```

`[outputs]` 是按页面种类**逐个列出输出格式**的白名单：写成 `taxonomy = ['html']` 表示「分类法页面只要 HTML」，这一条比在别处写一堆开关都直观。改完配置后记得**重启** `hugo server`。

### 条数限制

默认情况下，每个订阅源中的条目数量不限。可以按需要在项目配置中修改：

```toml {file="hugo.toml"}
[services.rss]
limit = 42
```

把 `limit` 设为 `-1` 表示每个订阅源的条目数不设上限。条数较少时订阅源文件更小，抓取端也更省流量。

内建的 RSS 模板还会读取项目配置中的以下值（如果设置了的话）并渲染进订阅源：

```toml {file="hugo.toml"}
copyright = '© 2023 ABC Widgets, Inc.'
[params.author]
name = 'John Doe'
email = 'jdoe@example.org'
```

### 结果长什么样

构建后（`hugo`），首页的订阅源是 `public/index.xml`，section 的订阅源是 `public/<section>/index.xml`。内建模板的输出结构如下（节选，来自本站的实际构建产物，值已替换为示例值）：

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ABC Widgets</title>
    <link>https://example.org/</link>
    <description>Recent content on ABC Widgets</description>
    <generator>Hugo</generator>
    <language>zh-CN</language>
    <lastBuildDate>Fri, 02 Oct 2026 03:23:59 +0800</lastBuildDate>
    <atom:link href="https://example.org/index.xml" rel="self" type="application/rss+xml" />
    <item>
      <title>Hello</title>
      <link>https://example.org/posts/hello/</link>
      <pubDate>Fri, 02 Oct 2026 00:00:00 +0800</pubDate>
      <guid>https://example.org/posts/hello/</guid>
      <description>&lt;p&gt;页面正文的 HTML，转义后放进 description&lt;/p&gt;</description>
    </item>
  </channel>
</rss>
```

两点值得留意：

- `<link>`、`<guid>`、`<atom:link>` 都是**绝对地址**，来自 `baseURL`；
- `<description>` 里是**转义后的 HTML**（`&lt;p&gt;`），这是 XML 的正常要求，不是出错。

### 验证标准

1. 构建：`hugo`；
2. 确认 `public/index.xml` 存在；如果没生成，先检查是不是有页面种类被 `disableKinds` 关掉了；
3. 数一数 `<item>` 的个数：**不超过** `limit` 配置值（例如 `limit = 42` 时最多 42 条）；
4. 用本地服务器看一遍更接近真实场景：`hugo server` 后访问 `http://localhost:1313/index.xml`，浏览器应当显示 XML 源码，而不是站点的 404 页面。

## 在页面中引用订阅源

要在渲染出的页面 `head` 元素中加入订阅源引用，把下面这段放进模板的 `head` 元素内：

```go-html-template
{{ with .OutputFormats.Get "rss" }}
  {{ printf `<link rel=%q type=%q href=%q title=%q>` .Rel .MediaType.Type .Permalink site.Title | safeHTML }}
{{ end }}
```

Hugo 会把它渲染成：

```html
<link rel="alternate" type="application/rss+xml" href="https://example.org/index.xml" title="ABC Widgets">
```

用 `.OutputFormats.Get "rss"` 判断当前页面是否配置了 RSS 输出，只有存在时才输出链接，可以避免为没有订阅源的页面生成空标签。注意 `.Permalink` 是**绝对地址**（阅读器要求如此），而 `type` 取的是 `.MediaType.Type`，即 `application/rss+xml`。

## 自定义模板

创建自己的 RSS 模板即可覆盖 Hugo 的内建模板。例如，为首页、section、分类法、条目页面分别使用不同的模板：

```tree
layouts/
  ├── home.rss.xml
  ├── section.rss.xml
  ├── taxonomy.rss.xml
  └── term.rss.xml
```

文件名由「页面类型 + 输出格式」组成，`rss` 对应 RSS 输出格式，因此可以针对不同页面类型给出不同的订阅源结构。RSS 模板的上下文中可以访问 `.Page` 和 `.Site` 对象。

只想改一份时不必写四份：只创建 `layouts/home.rss.xml`，其余页面种类仍会用内建模板。

### 最小可运行示例与验证

在 `layouts/home.rss.xml` 里写一份「只有标题和链接」的极简订阅源，最容易看出模板有没有被选中：

```go-html-template {file="layouts/home.rss.xml"}
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<rss version="2.0">
  <channel>
    <title>{{ site.Title }}</title>
    <link>{{ .Permalink }}</link>
    {{ range .RegularPages }}
      <item>
        <title>{{ .Title }}</title>
        <link>{{ .Permalink }}</link>
      </item>
    {{ end }}
  </channel>
</rss>
```

构建后打开 `public/index.xml`，你应当看到 `<rss version="2.0">` 后面**没有** `xmlns:atom` 等内建模板才有的属性——这就证明自定义模板确实生效了。（如果内容与原来一样，说明文件名没写对，对照[模板查找顺序](/templates/lookup-order/)检查。）

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` → [安装 Hugo](/installation/) |
| 没报错但结果不对 | `public/index.xml` 没有生成 | `disableKinds` 里有 `'rss'`，或 `[outputs].home` 没写 `'rss'` → 对照本页配置示例 |
| 没报错但结果不对 | 订阅源里的文章标题、正文是旧内容 | 阅读器或浏览器缓存；也可能 `limit` 太小导致目标文章不在窗口内 → 用无痕窗口访问 `/index.xml` 复核 |
| 没报错但结果不对 | 订阅源文件特别大（几 MB） | 没有设置 `[services.rss] limit` → 设置一个合理上限（如 50）并重新构建 |
| 报错看不懂 | 修改 `[outputs]` 后构建出现 `found no layout file for …` 警告 | 打开了某个输出格式却没有对应模板，Hugo 会回退内建模板；若是自定义输出格式则需自备模板 → 见[输出格式](/configuration/output-formats/) |
| 报错看不懂 | 构建时报模板执行失败，行号指向 `layouts/home.rss.xml` | 自定义 RSS 模板动作没闭合，或 XML 中出现了非法字符 → 用 `hugo --renderToMemory` 复现，按报错行号定位 |

更多排查入口见[故障排查](/troubleshooting/)。
