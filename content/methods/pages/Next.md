+++
title = "Next"
linkTitle = "Next"
description = "返回页面集合中相对于给定页面的下一个页面。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/methods/pages/next/"

[params.functions_and_methods]
signatures = ["PAGES.Next PAGE"]
returnType = "page.Page"
+++

## 这一页解决什么问题

做「下一篇 / 上一篇」导航。它是**页面集合上的方法**，参数是「当前页」，返回集合里与它相邻的另一个页面。

**先记住这个反直觉的事实**（实测）：`Next` 返回的是集合里**前一个**元素（下标 −1），`Prev` 返回的是**后一个**元素（下标 +1）。所以在一个「按 `weight` 升序」的列表里，`Prev` 指向列表的下一项、`Next` 指向上一项。

**到边界时返回 `nil`，不报错**：集合的第一个元素没有 `Next`，最后一个元素没有 `Prev`。模板里必须用 `with` 包住，否则会渲染出空链接。

## 什么时候用，什么时候别用

**该用**：

- 文章底部的「上一篇 / 下一篇」；
- 知道相邻页面的存在性时（`with` 判断即可）。

**别用**：

- 需要「第 N 篇 / 共 M 篇」的位置信息 → 用 [`IndexOf`](/methods/pages/indexof/)；
- 想按**章节**限定相邻范围 → 用页面级的 [`NextInSection`](/methods/page/nextinsection/) / [`PrevInSection`](/methods/page/previnsection/)（它们按 section 分区）；
- 想按自定义顺序导航 → 先把集合排成你要的顺序再调 `Next`/`Prev`。

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

## 完整示例：首尾返回 nil

示例沿用本章首页的[示例站点结构](/methods/pages/)。集合 `.CurrentSection.Pages` 的顺序是 `alpha bravo charlie delta`（由 `weight` 10/20/30 加未加权页决定）。

```go-html-template {file="layouts/_default/single.html"}
{{ $pages := .CurrentSection.Pages }}
<p>Next：{{ with $pages.Next . }}{{ .LinkTitle }}{{ else }}（无）{{ end }}</p>
<p>Prev：{{ with $pages.Prev . }}{{ .LinkTitle }}{{ else }}（无）{{ end }}</p>
```

四个页面分别渲染出（其中「（无）」来自 `else` 分支）：

| 当前页 | 渲染的 `Next` | 渲染的 `Prev` |
| --- | --- | --- |
| `post-1`（`alpha`，集合的第一个） | （无） | `bravo` |
| `post-2`（`bravo`） | `alpha` | `charlie` |
| `post-3`（`charlie`） | `bravo` | `delta` |
| `post-4`（`delta`，集合的最后一个） | `charlie` | （无） |

**你应当看到什么**：`Next` 取的是集合里**前一个**元素、`Prev` 取**后一个**；`alpha`（第一个）的 `Next` 与 `delta`（最后一个）的 `Prev` 都是**空**，`with` 走 `else` 输出「（无）」。如果不用 `with`，这两处会渲染成 `<a href="">`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 集合中间的页面 | 返回相邻的**单个页面** | 否 |
| 集合的第一个元素（`Next`） | `nil` → `with` 走 `else`（实测输出为空） | 否 |
| 集合的最后一个元素（`Prev`） | `nil` | 否 |
| 传入的页面不在该集合里 | `nil`（实测用别的 section 的页面查询，得到空） | 否 |
| 空集合 | `nil` | 否 |
| 对返回值用 `len` | —— | 是：`len of type nil pointer`（nil 时）或 `len of type hugolib.pageState`（有值时） |
| 参数不是页面（`Next "x"`） | —— | 是：`can't handle "x" for arg of type page.Page` |
| 返回类型 | 签名写 `page.Page`，**实测确实是单个页面** | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 首尾渲染出空链接 `<a href="">` | 没用 `with` 包住 `nil` | `{{ with $pages.Next . }}…{{ end }}` |
| 没报错但结果不对 | 上一篇/下一篇和列表顺序相反 | `Next`/`Prev` 的语义与列表方向相反 | 想按列表方向导航就链 `.Reverse`：`$pages.ByWeight.Reverse` |
| 报错看不懂 | `len of type nil pointer` | 对返回值用了 `len`（它返回的是单个页面，不是集合） | 用 `with` 判断；要位置信息用 [`IndexOf`](/methods/pages/indexof/) |
| 报错看不懂 | `can't handle "x" for arg of type page.Page` | 参数传成了字符串 | 传当前页面 `.` |
| 没报错但结果不对 | 相邻关系与预期不一致 | `Next`/`Prev` 用的是内部排序，不是你页面上渲染的排序 | 两处都用同一个集合变量（如 `.ByWeight`），并对照本页边界表 |

更多排查入口见[故障排查](/troubleshooting/)。

[`IndexOf`]: /methods/pages/indexof/
[`Reverse`]: /methods/pages/reverse/
[`date`]: /methods/page/date/
[`linkTitle`]: /methods/page/linktitle/
[`path`]: /methods/page/path/
[`weight`]: /methods/page/weight/
