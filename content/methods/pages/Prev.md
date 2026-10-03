+++
title = "Prev"
linkTitle = "Prev"
description = "返回页面集合中相对于给定页面的上一个页面。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/methods/pages/prev/"

[params.functions_and_methods]
signatures = ["PAGES.Prev PAGE"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

做「上一篇 / 下一篇」导航。它是**页面集合上的方法**，参数是「当前页」，返回集合里与它相邻的另一个页面。

**先记住这个反直觉的事实**（实测）：`Prev` 返回的是集合里**后一个**元素（下标 +1），`Next` 返回的是**前一个**元素（下标 −1）。所以在一个「按 `weight` 升序」的列表里，`Prev` 指向列表的下一项、`Next` 指向上一项。

**到边界时返回 `nil`，不报错**：集合的最后一个元素没有 `Prev`。模板里必须用 `with` 包住。

> [!WARNING]
> 本页签名里的返回类型写的是 `page.Pages`，但**实测返回的是单个页面**。判断空值请用 `with`；对返回值用 `len` 会报错：nil 时 `len of type nil pointer`，有值时 `len of type hugolib.pageState`。

## 什么时候用，什么时候别用

**该用**：

- 文章底部的「上一篇 / 下一篇」；
- 只需要相邻页面、不需要位置信息时。

**别用**：

- 需要「第 N 篇 / 共 M 篇」→ 用 [`IndexOf`](/methods/pages/indexof/)；
- 想限定在同一个 section 内 → 用页面级的 [`PrevInSection`](/methods/page/previnsection/) / [`NextInSection`](/methods/page/nextinsection/)；
- 想按自定义顺序导航 → 先把集合排成目标顺序再调 `Prev`。

## 用法

Hugo 按以下排序层级对页面集合排序，据此确定_下一个_和_上一个_页面：

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
{{ $pages := .CurrentSection.Pages.ByWeight }}

{{ with $pages.Prev . }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with $pages.Next . }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

当你访问 page-2 时：

- `Prev` 方法指向 page-3
- `Next` 方法指向 page-1

要反转_下一个_和_上一个_的含义，可以把 [`Reverse`][] 方法链式接在页面集合的定义后面：

```go-html-template {file="layouts/page.html"}
{{ $pages := .CurrentSection.Pages.ByWeight.Reverse }}

{{ with $pages.Prev . }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with $pages.Next . }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

> [!TIP]
> 如果你还需要知道页面在集合中的位置，请改用 [`IndexOf`][] 方法。例如可以用它在「上一个／下一个」链接旁渲染「post 2 of 3」。

## 完整示例：链式 `Reverse` 让方向符合直觉

示例沿用本章首页的[示例站点结构](/methods/pages/)。集合 `.CurrentSection.Pages` 的顺序是 `alpha bravo charlie delta`。

```go-html-template {file="layouts/_default/single.html"}
{{ $pages := .CurrentSection.Pages }}
<p>Prev：{{ with $pages.Prev . }}{{ .LinkTitle }}{{ else }}（无）{{ end }}</p>
<p>Next：{{ with $pages.Next . }}{{ .LinkTitle }}{{ else }}（无）{{ end }}</p>

{{ $reversed := .CurrentSection.Pages.ByWeight.Reverse }}
<p>反转后 Prev：{{ with $reversed.Prev . }}{{ .LinkTitle }}{{ else }}（无）{{ end }}</p>
<p>反转后 Next：{{ with $reversed.Next . }}{{ .LinkTitle }}{{ else }}（无）{{ end }}</p>
```

`post-2`（`bravo`）渲染为：

```html
<p>Prev：charlie</p>
<p>Next：alpha</p>

<p>反转后 Prev：alpha</p>
<p>反转后 Next：charlie</p>
```

**你应当看到什么**：同一个页面，集合反转后 `Prev`/`Next` 的结果**互换了**（`charlie` ↔ `alpha`）；`post-1`（`alpha`）在未反转时 `Next` 为空、`post-4`（`delta`）在未反转时 `Prev` 为空——首尾的 `nil` 由 `with` 兜住。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 集合中间的页面 | 返回相邻的**单个页面**（`printf "%T"` 实测为页面类型，不是集合） | 否 |
| 集合的最后一个元素 | `nil` → `with` 走 `else` | 否 |
| 集合的第一个元素（`Prev`） | 返回第二个元素 | 否 |
| 传入的页面不在该集合里 | `nil`（实测用别的 section 的页面查询得到空） | 否 |
| 空集合 | `nil` | 否 |
| 对返回值用 `len` | —— | 是：`len of type nil pointer` / `len of type hugolib.pageState` |
| 参数不是页面（`Prev "x"`） | —— | 是：`can't handle "x" for arg of type page.Page` |
| 返回类型 | 签名写 `page.Pages`，**实测是单个页面**（与 [`Next`](/methods/pages/next/) 一致） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 末页渲染出空链接 `<a href="">` | 没用 `with` 包住 `nil` | `{{ with $pages.Prev . }}…{{ end }}` |
| 没报错但结果不对 | 「上一篇」指向了后面的文章 | `Prev` 指向集合的下一个元素 | 换算方向或链 `.Reverse`，见完整示例 |
| 报错看不懂 | `len of type nil pointer` | 对返回值用了 `len`（返回的是单个页面） | 用 `with`；要位置信息用 [`IndexOf`](/methods/pages/indexof/) |
| 报错看不懂 | `can't handle "x" for arg of type page.Page` | 参数传成了字符串 | 传当前页面 `.` |
| 没报错但结果不对 | 导航跨越了不同 section | `.CurrentSection.Pages` 只含本 section，改用 `site.RegularPages` 就是全站范围 | 先想清楚「相邻」的范围，再选集合 |

更多排查入口见[故障排查](/troubleshooting/)。

[`IndexOf`]: /methods/pages/indexof/
[`Reverse`]: /methods/pages/reverse/
[`date`]: /methods/page/date/
[`linkTitle`]: /methods/page/linktitle/
[`path`]: /methods/page/path/
[`weight`]: /methods/page/weight/
