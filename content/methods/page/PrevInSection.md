+++
title = "PrevInSection"
linkTitle = "PrevInSection"
description = "返回某个 section 中相对于给定页面的上一个常规页面。"
date = 2026-10-02
weight = 590
source = "https://gohugo.io/methods/page/previnsection/"

[params.functions_and_methods]
signatures = ["PAGE.PrevInSection"]
returnType = "page.Page"
+++

## 这一页解决什么问题

`.PrevInSection` 是 [`.Prev`](/methods/page/prev/) 的「限定范围」版本：只在当前页面所属的 **section 内部**的常规页面里，返回排在前面的那一页。它和 [`.NextInSection`](/methods/page/nextinsection/) 成对使用，用来做「系列文章」内部的上/下篇导航。

「当前 section」是页面的**直接**父 section：`/docs/guide/page-a.md` 的 section 是 `/docs/guide`。嵌套 section 之间互不穿透，也不会跑到节外去。

## 什么时候用，什么时候别用

**该用**：

- 系列文章内「上一篇 / 下一篇」，导航不跳出该系列；
- 分章节的文档（例如 `/docs/guide/` 下的若干页）需要按 weight 顺序前后翻阅。

**别用**：

- 要让全站文章串成一条线 → 用 [`.Prev`](/methods/page/prev/) / [`.Next`](/methods/page/next/)；
- 想在 section 页面上列页面 → 用 [`.RegularPages`](/methods/page/regularpages/) 或 [`.Pages`](/methods/page/pages/) 再 `range`；
- 列表页分页 → 用 [`Paginator`](/methods/page/paginator/)。

**`.Prev` 与 `.PrevInSection` 的差别（实测，同一页面 `/posts/post-2/`）**：

| 方法 | 实测结果 | 范围 |
| --- | --- | --- |
| `.Prev` | `/docs/guide/page-b/` | 全站常规页面 |
| `.PrevInSection` | `/posts/post-3/` | 仅 `/posts/` |
| `.Next` | `/docs/ref/` | 全站常规页面 |
| `.NextInSection` | `/posts/post-1/` | 仅 `/posts/` |

## 排序规则

Hugo 按以下排序层级对当前 section 的常规页面排序，据此确定_下一个_和_上一个_页面：

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
{{ with .PrevInSection }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with .NextInSection }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

当你访问 page-2 时：

- `PrevInSection` 方法指向 page-3
- `NextInSection` 方法指向 page-1

要反转_下一个_和_上一个_的含义，你可以修改[项目配置][]中的排序方向，或者使用 `Pages` 对象上的 [`Next`][] 和 [`Prev`][] 方法以获得更大的灵活性。

## 示例

写出防御性代码，先检查页面是否存在：

```go-html-template
{{ with .PrevInSection }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with .NextInSection }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

## 完整示例：系列文章内部的上一篇

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
{{ $prev := .PrevInSection }}
{{ $next := .NextInSection }}
<nav>
  {{ with $prev }}<a href="{{ .RelPermalink }}" rel="prev">上一篇：{{ .LinkTitle }}</a>{{ end }}
  {{ with $next }}<a href="{{ .RelPermalink }}" rel="next">下一篇：{{ .LinkTitle }}</a>{{ end }}
  {{ if and (not $prev) (not $next) }}<span>本系列只有这一篇</span>{{ end }}
</nav>
```

实测（测试站 `/posts/` 内 weight 10/20/30/60/70/80/90/100），访问 `/posts/post-2/`（`weight = 20`）时渲染为：

```html
<nav>
  <a href="/posts/post-3/" rel="prev">上一篇：第三篇</a>
  <a href="/posts/post-1/" rel="next">下一篇：第一篇</a>
</nav>
```

访问 `/docs/ref/`（`/docs/` 下唯一的常规页面）时渲染为：

```html
<nav>
  <span>本系列只有这一篇</span>
</nav>
```

**你应当看到什么**：两个链接都留在 `/posts/` 内；`rel="prev"` 指向 weight 更大的页，`rel="next"` 指向 weight 更小的页（降序方向）。当 section 内只剩一页时，两个方法都是 `nil`，`and (not $prev) (not $next)` 判真——这是最稳妥的兜底写法。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| section 内 weight 最大的页面 | `.PrevInSection` 为 `nil` | 否 |
| section 内 weight 最小的页面 | `.NextInSection` 为 `nil`（实测 `/docs/guide/page-a/`） | 否 |
| section 内只有一页 | 两个方法都为 `nil`（实测 `/docs/ref/`） | 否 |
| section / 首页 / taxonomy / term 页 | 全部为 `nil`（实测 `/posts/`、`/tags/alpha/`） | 否 |
| 嵌套 section | 只查本层（实测 `/docs/guide/page-c/` 的 `PrevInSection` 为 `nil`，不会落到 `/docs/ref/`） | 否 |
| `{{ .PrevInSection.RelPermalink }}` 直接取值 | —— | 是：`nil pointer evaluating page.Page.RelPermalink` |
| 返回类型 | `page.Page` | 否 |

**先存变量再 `with`**（如上例）比在每个分支里重复调用更可靠：两个方法都只返回 `nil` 或 `page.Page`，把 `nil` 存进变量、再用 `with` 判断，就不会出现「取字段时才发现是空」的情况。

更多排查入口见[故障排查](/troubleshooting/)。

[`Next`]: /methods/pages/next/
[`Prev`]: /methods/pages/prev/
[`date`]: /methods/page/date/
[`linkTitle`]: /methods/page/linktitle/
[`path`]: /methods/page/path/
[`weight`]: /methods/page/weight/
[project configuration]: /configuration/page/
