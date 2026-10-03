+++
title = "Parent"
linkTitle = "Parent"
description = "返回给定页面所属父 section 的 Page 对象。"
date = 2026-10-02
weight = 530
source = "https://gohugo.io/methods/page/parent/"

[params.functions_and_methods]
signatures = ["PAGE.Parent"]
returnType = "page.Page"
+++

## 这一页解决什么问题

做面包屑、做「返回上一级」时，模板需要一个指向**上一层**的 `Page` 对象。`.Parent` 就返回它：常规页面的父级是所属 section，section 的父级是它的上一级 section（顶层 section 的父级是首页），首页没有父级。

关键在于：`.Parent` 只返回**一层**，而且**可能是 `nil`**。框架里凡是 `.Parent` 出现的地方，都应该和判空写在一起。

## 什么时候用，什么时候别用

**该用**：

- 「返回上一级」链接、只显示一层的面包屑；
- 在 section 模板里向上找到它的父 section。

**别用**：

- 想一次列出全部祖先（首页 › 文档 › 指南）→ 用 [`.Ancestors`](/methods/page/ancestors/)（它已经排好序，配合 `reverse` 得到「从根到当前」）；
- 想知道当前页面属于哪个 section → 用 [`.CurrentSection`](/methods/page/currentsection/)；要顶层 section 名 → 用 [`.Section`](/methods/page/section/)；
- 想取某个已知路径的父级 → 用 `site.GetPage` 直接取。

**别写**：`{{ .Parent.Title }}`——首页上 `.Parent` 是 `nil`，这一句会让**整个站点构建失败**（实测报错见下）。正确写法永远带 `with`：

```go-html-template
{{ with .Parent }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

[section（内容区块）](/quick-reference/glossary/section/)

> [!NOTE]
> 常规页面的父 section 就是[当前 section][]。

考虑如下内容结构：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md     <-- parent: auctions
│   │   ├── auction-1.md
│   │   └── auction-2.md  <-- parent: 2023-11
│   ├── 2023-12/
│   │   ├── _index.md
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md         <-- parent: home
│   ├── bidding.md
│   └── payment.md        <-- parent: auctions
├── books/
│   ├── _index.md         <-- parent: home
│   ├── book-1.md
│   └── book-2.md         <-- parent: books
├── films/
│   ├── _index.md         <-- parent: home
│   ├── film-1.md
│   └── film-2.md         <-- parent: films
└── _index.md             <-- parent: nil
```

上例中请注意，首页的父 section 是 `nil`。在调用其 `Page` 对象的方法之前，请先确认父 section 是否存在，以写出防御性代码。要创建指向当前页面父 section 页面的链接：

```go-html-template
{{ with .Parent }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

## 完整示例：面包屑的第一层

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
<nav aria-label="breadcrumb">
  <a href="{{ .Site.Home.RelPermalink }}">{{ .Site.Home.LinkTitle }}</a>
  {{ with .Parent }}
    › <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
  {{ else }}
    <span>（当前页就是首页）</span>
  {{ end }}
</nav>
```

实测（测试站内容结构：`/posts/`、`/docs/guide/` 两个 section 层，另有 `/tags/` 分类法）：

| 渲染的页面 | `.Parent` | 渲染结果里的第二段 |
| --- | --- | --- |
| `/posts/post-2/` | `/posts` | `› <a href="/posts/">文章</a>` |
| `/docs/guide/page-a/` | `/docs/guide` | `› <a href="/docs/guide/">指南</a>` |
| `/posts/` | `/`（首页） | `› <a href="/">MP 首页</a>` |
| `/tags/alpha/` | `/tags` | `› <a href="/tags/">Tags</a>` |
| `/`（首页） | `nil` | `<span>（当前页就是首页）</span>` |

**你应当看到什么**：常规页面拿到的是**直接**父 section（`page-a` 的父级是 `/docs/guide` 而不是 `/docs`）；section 页往上退一层；首页走 `else` 分支。这就是「只一层」的准确含义。

## 返回值边界（实测）

| 情况 | `.Parent` | 是否报错 |
| --- | --- | --- |
| 常规页面（叶子） | 所属 section 的 `Page` | 否 |
| section 页 | 上一级 section，顶层 section 得到首页 | 否 |
| taxonomy / term 页 | taxonomy 页 / 相应上一级 | 否 |
| 首页 | `nil` | 否 |
| `{{ .Parent.Title }}`（首页） | —— | 是：`nil pointer evaluating page.Page.Title`，构建退出码 1 |
| `{{ with .Parent }}…{{ else }}…{{ end }}` | 首页走 `else` | 否 |
| 返回类型 | `page.Page` | 否 |

> [!WARNING]
> 首页是最容易漏判的一页：它在很多模板里都会渲染（例如 `layouts/index.html` 复用了同一个 partial）。只要模板会被首页执行到，就必须写 `with .Parent`。

更多排查入口见[故障排查](/troubleshooting/)。

[current section]: /methods/page/currentsection/
