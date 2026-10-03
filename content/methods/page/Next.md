+++
title = "Next"
linkTitle = "Next"
description = "返回站点常规页面集合中相对于当前页面的下一个页面。"
date = 2026-10-02
weight = 440
source = "https://gohugo.io/methods/page/next/"

[params.functions_and_methods]
signatures = ["PAGE.Next"]
returnType = "page.Page"
+++

## 这一页解决什么问题

文章页顶部或底部的「上一篇 / 下一篇」链接，几乎每个主题都要写一遍。`.Next` 就是为这件事准备的：它在**站点级常规页面集合**中，返回排在当前页之后的那一页（返回类型 `page.Page`，不是字符串）。

两个最容易踩的点：

1. 这个集合是**全站**的：`/posts/` 里的文章，`.Next` 可能指向 `/docs/` 里的页面；
2. 集合按 `weight`、`date`、`linkTitle`、`path` **全部降序**排列，`Next` 取「排在后面」的那一页——所以在默认按 weight 升序显示的列表里，`.Next` 看起来更像「上一篇」。

它和 [`.Prev`](/methods/page/prev/) 成对使用。这个用于排序的页面集合独立于 `.Pages`，因此 `.Next` 的顺序与列表页看到的顺序不一定一致。

## 什么时候用，什么时候别用

**该用**：

- 单篇内容页的「上一篇 / 下一篇」导航，希望全站文章串成一条线；
- 需要「只有一个链接时也不报错」的防御性写法：`{{ with .Next }}…{{ else }}…{{ end }}`。

**别用**：

- 只想在**同一个 section 内**翻页（不希望 `/posts/` 的下一条跳到 `/docs/`）→ 用 [`.NextInSection`](/methods/page/nextinsection/) 和 [`.PrevInSection`](/methods/page/previnsection/)；
- 想按自己的排序（按标题、按日期升序）决定相邻页 → 用 `Pages` 对象上的 `Next`（例如 `(.Pages.ByTitle).Next`），或先自己排序再取相邻元素；
- 列表页的分页导航 → 那是 [`Paginator`](/methods/page/paginator/) 或 [`Paginate`](/methods/page/paginate/) 的工作；
- 首页、section、taxonomy、term 等非内容页 → 实测 `.Next` 与 `.Prev` 都是 `nil`，直接取字段会报错。

## 排序规则

Hugo 按以下排序层级对站点的常规页面集合排序，据此确定_下一个_和_上一个_页面：

字段|优先级|排序方向
:--|:--|:--
[`weight`][]|1|降序
[`date`][]|2|降序
[`linkTitle`][]|3|降序
[`path`][]|4|降序

用于确定_下一个_和_上一个_页面的这个已排序页面集合独立于其他页面集合，因此可能导致意外的行为。

例如，有如下内容结构：

```tree
content/
├── pages/
│   ├── _index.md
│   ├── page-1.md   <-- front matter: weight = 10
│   ├── page-2.md   <-- front matter: weight = 20
│   └── page-3.md   <-- front matter: weight = 30
└── _index.md
```

以及这些模板：

```go-html-template {file="layouts/section.html"}
{{ range .Pages.ByWeight }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

```go-html-template {file="layouts/page.html"}
{{ with .Prev }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with .Next }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

当你访问 page-2 时：

- `Prev` 方法指向 page-3
- `Next` 方法指向 page-1

要反转_下一个_和_上一个_的含义，你可以修改[项目配置][]中的排序方向，或者使用 `Pages` 对象上的 [`Next`][] 和 [`Prev`][] 方法以获得更大的灵活性。

## 完整示例：给文章页加「上一篇 / 下一篇」

把下面这段放进内容页模板（`layouts/_default/single.html`，或主题里的 `layouts/page.html`）：

```go-html-template {file="layouts/_default/single.html"}
<nav>
  {{ with .Prev }}<a href="{{ .RelPermalink }}">Prev: {{ .LinkTitle }}</a>{{ end }}
  {{ with .Next }}<a href="{{ .RelPermalink }}">Next: {{ .LinkTitle }}</a>{{ end }}
</nav>
```

实测（本站测试站：`/posts/` 下有 weight 10/20/30/60/70/80/90/100 的常规页面，`/docs/` 下另有若干页面），访问 `/posts/post-2/`（`weight = 20`）时渲染为：

```html
<nav>
  <a href="/docs/guide/page-b/">Prev: 指南 B</a>
  <a href="/docs/ref/">Next: 参考</a>
</nav>
```

**你应当看到什么**：`Next` 指向的 `/docs/ref/` 根本不在 `/posts/` 里——这就是「全站集合」的直接证据。如果你要的是「同一 section 内的下一篇」，请改用 `.NextInSection`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；测试站含 `/posts/`（8 个常规页面）与 `/docs/`（4 个常规页面）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 排序集合中的中间页 | 返回一个 `page.Page` | 否 |
| 排在降序集合最前（weight 最大）的页面 | `.Prev` 为 `nil`（实测 `/posts/bundle-1/`，`weight = 60`） | 否 |
| 排在降序集合最后的页面 | `.Next` 为 `nil`（实测 `/docs/guide/page-a/`） | 否 |
| 首页 / section / taxonomy / term 页 | `.Next`、`.Prev` 均为 `nil`（实测） | 否 |
| 站点只有一个常规页面 | 两个方法都返回 `nil` | 否 |
| `{{ .Next.RelPermalink }}` 直接取值 | —— | 是：`nil pointer evaluating page.Page.RelPermalink` |
| 用 `{{ with .Next }}` 或 `{{ if .Next }}` 判空 | 跳过分支 / 走 `else` | 否 |
| 返回类型 | `page.Page`（要 URL 需再取 `.RelPermalink`，要文字需取 `.LinkTitle`） | 否 |

一句话记法：**`.Next`/`.Prev` 永远可能返回 `nil`，先判空再取字段**。同理，首页与列表页上不要调用这两个方法。

更多排查入口见[故障排查](/troubleshooting/)。

[`Next`]: /methods/pages/next/
[`Prev`]: /methods/pages/prev/
[`date`]: /methods/page/date/
[`linkTitle`]: /methods/page/linktitle/
[`path`]: /methods/page/path/
[`weight`]: /methods/page/weight/
[项目配置]: /configuration/page/
