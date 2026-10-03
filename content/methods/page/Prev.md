+++
title = "Prev"
linkTitle = "Prev"
description = "返回站点常规页面集合中相对于当前页面的上一个页面。"
date = 2026-10-02
weight = 580
source = "https://gohugo.io/methods/page/prev/"

[params.functions_and_methods]
signatures = ["PAGE.Prev"]
returnType = "page.Page"
+++

## 这一页解决什么问题

`.Prev` 是 [`.Next`](/methods/page/next/) 的镜像：在**站点级常规页面集合**中，返回排在当前页之前的那一页（返回 `page.Page`）。写「上一篇 / 下一篇」导航时，这两个方法总是成对出现。

要点和 `.Next` 完全一致：集合是**全站**的（会跨 section），排序是 `weight`、`date`、`linkTitle`、`path` **全部降序**。所以「前一篇」在这里指降序列表中位置更靠前、通常 weight 更大或日期更晚的那一页——和你凭直觉说的「前一篇（更早发布）」不一定是同一页。

## 什么时候用，什么时候别用

**该用**：

- 内容页的「上一篇」链接，且能接受全站范围；
- 和 `.Next` 配对，做出首尾都能判空的导航（`{{ with .Prev }}`）。

**别用**：

- 只想在同一个 section 内往回翻 → 用 [`.PrevInSection`](/methods/page/previnsection/)；
- 想按发布时间倒序自己定义「前一篇」 → 用 `Pages` 对象的排序方法，例如 `{{ with (.Pages.ByDate.Reverse).Prev }}`，或自己取相邻元素；
- 列表页分页的「上一页」 → 那是 [`Paginator`](/methods/page/paginator/) 的事，不是 `.Prev`；
- 首页、section、taxonomy、term 页 → 实测返回 `nil`。

**怎么选**：

| 需求 | 用哪个 |
| --- | --- |
| 全站范围内的上一篇 | `.Prev` |
| 仅本 section 的上一篇 | [`.PrevInSection`](/methods/page/previnsection/) |
| 列表页的上一页按钮 | [`Paginate`](/methods/page/paginate/) / [`Paginator`](/methods/page/paginator/) |
| 按自己的排序取上一篇 | `Pages` 对象的 `.Prev`（先排序） |

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

## 完整示例：首尾都能判空的导航

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
<nav>
  {{ with .Prev }}<a href="{{ .RelPermalink }}" rel="prev">{{ .LinkTitle }}</a>{{ end }}
  {{ with .Next }}<a href="{{ .RelPermalink }}" rel="next">{{ .LinkTitle }}</a>{{ end }}
</nav>
```

实测（测试站 `/posts/` 有 weight 10/20/30/60/70/80/90/100 的页面，`/docs/` 另有页面），访问 `/posts/post-2/`（`weight = 20`）时渲染为：

```html
<nav>
  <a href="/docs/guide/page-b/" rel="prev">指南 B</a>
  <a href="/docs/ref/" rel="next">参考</a>
</nav>
```

访问降序集合最前的一页 `/posts/bundle-1/`（`weight = 60`，站点里 weight 最大的常规页面之一）时，实测渲染为：

```html
<nav>
  <a href="/posts/plain-demo/" rel="prev">Plain 演示</a>
  <a href="/docs/guide/page-c/" rel="next">指南 C</a>
</nav>
```

**你应当看到什么**：`rel="prev"` 指向的是 weight 更大的 `plain-demo`，`rel="next"` 指向 weight 更小的 `page-c`——这两个方向都与「降序列表中的前后」一致，而不是发布日期意义上的前后。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 排序集合中的中间页 | 返回一个 `page.Page` | 否 |
| 排在降序集合最前的一页（本站为 weight 最大的页面） | `.Prev` 为 `nil`（实测 `/posts/no-sitemap/`，`weight = 100`） | 否 |
| 排在降序集合最后的一页 | `.Next` 为 `nil`（实测 `/docs/guide/page-a/`） | 否 |
| 首页 / section / taxonomy / term 页 | `nil`（实测） | 否 |
| `{{ .Prev.RelPermalink }}` 直接取值 | —— | 是：`nil pointer evaluating page.Page.RelPermalink` |
| 用 `with`/`if` 包裹 | 走 `else` / 跳过 | 否 |
| 返回类型 | `page.Page` | 否 |

> [!NOTE]
> 是否为 `nil` 取决于页面在降序集合中的位置，而不是「weight 是不是最大」这一个条件——weight 相同时还要看 `date`、`linkTitle`、`path`。要确认顺序，先 `{{ range .Site.RegularPages }}{{ .Path }}{{ end }}` 打印一遍，再决定模板里的兜底文案。

更多排查入口见[故障排查](/troubleshooting/)。

[`Next`]: /methods/pages/next/
[`Prev`]: /methods/pages/prev/
[`date`]: /methods/page/date/
[`linkTitle`]: /methods/page/linktitle/
[`path`]: /methods/page/path/
[`weight`]: /methods/page/weight/
[project configuration]: /configuration/page/
