+++
title = "collections.Group"
linkTitle = "group"
description = "按指定 key 对给定的页面集合（切片）分组，返回一个映射。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/collections/group/"

[params.functions_and_methods]
signatures = ["collections.Group KEY PAGES"]
returnType = "page.PageGroup"
aliases = ["group"]
+++

## 这一页解决什么问题

`group` 把一批页面打包成一个**带名字的页面组**（`page.PageGroup`），组上有两个字段：`.Key`（组名）和 `.Pages`（页面集合）。渲染时 `range $groups`，每轮拿到一个组，就能输出「标题 + 该组的页面列表」。

**这里有一个极易误解的点（实测）**：第一个参数 `KEY` 是**组的名字**，不是用来分组的字段名。`group "Section" site.RegularPages` 返回的是**一个**组，其 `.Key` 是 `"Section"`，`.Pages` 是传进去的全部页面——它**不会**按 `Section` 字段把页面拆开。真正「按字段自动分组」请用页面集合的分组方法：[`PAGES.GroupBy`](/methods/pages/groupby/)、[`PAGES.GroupByParam`](/methods/pages/groupbyparam/)、[`PAGES.GroupByDate`](/methods/pages/groupbydate/) 等。

`group` 的典型用法是**手工造几个组再一起遍历**，例如把最近 10 篇标成 "New"、更早 10 篇标成 "Old"（上游示例）。

## 什么时候用，什么时候别用

**该用**：

- 列表页要分成几块、每块有名字（「推荐 / 最新 / 归档」）；
- 需要把页面组交给分页模板处理（上游提示：`group` 返回的类型与内置分组方法相同，可以参与分页）。

**别用**：

- 想按字段**自动**分组 → 用 [`PAGES.GroupBy`](/methods/pages/groupby/) 等方法；
- 只想排序 → 用 [`collections.Sort`](/functions/collections/sort/)；
- 传入的是普通切片而不是页面集合 → 实测报错（见文末），因为它需要的是 Page。

## 用法

```go-html-template
{{ $new := .Site.RegularPages | first 10 | group "New" }}
{{ $old := .Site.RegularPages | last 10 | group "Old" }}
{{ $groups := slice $new $old }}
{{ range $groups }}
  <h3>{{ .Key }}{{/* 输出 "New"、"Old" */}}</h3>
  <ul>
    {{ range .Pages }}
      <li>
        <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
        <div class="meta">{{ .Date.Format "Mon, Jan 2, 2006" }}</div>
      </li>
    {{ end }}
  </ul>
{{ end }}
```

从 `group` 得到的页面组，与 Hugo 内置 [group 方法][group methods]返回的类型相同。上面的示例可以[分页][paginated]。

## 完整示例：手工造「New / Old」两块

需要在有内容页面的站点里跑。下面这个临时站点有 3 个页面（`A 文章`、`B 文章`、`C 文章`，日期依次变新）：

```go-html-template {file="layouts/_partials/home-groups.html"}
{{ $new := site.RegularPages | first 2 | group "New" }}
{{ $old := site.RegularPages | last 1 | group "Old" }}
{{ $groups := slice $new $old }}
{{ range $groups }}
  <h3>{{ .Key }}（{{ len .Pages }} 篇）</h3>
  <ul>
    {{ range .Pages }}<li>{{ .Title }}</li>{{ end }}
  </ul>
{{ end }}
```

Hugo 渲染为（`range` 循环会留下空行，这里省略）：

```html
  <h3>New（2 篇）</h3>
  <ul>
    <li>C 文章</li>
    <li>B 文章</li>
  </ul>
  <h3>Old（1 篇）</h3>
  <ul>
    <li>A 文章</li>
  </ul>
```

**你应当看到什么**：`.Key` 原样输出你传入的字符串；`.Pages` 是你传给它的那批页面（顺序不变，`site.RegularPages` 默认按日期倒序，所以最新的是 `C 文章`）；`group` 没有做任何「按字段拆分」的工作。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows；含 3 个内容页面的最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 传入页面集合 | 单个 `page.PageGroup`：`.Key` 等于 `KEY` 字符串，`.Pages` 等于传入的页面 | 否 |
| `KEY` 写成某个字段名（如 `"Section"`） | **不会**按字段拆分；`.Key` 就是 `"Section"`，`.Pages` 是全部页面（实测 3 篇） | 否 |
| 传入普通切片（非页面集合） | —— | 是：`error calling group: grouping not supported for type []int *int` |
| 页面集合为空 | 返回 `.Pages` 为空的组：实测无内容站点上 `group "X" site.RegularPages` 得 `page.PageGroup KEY=[X] N=0` | 否 |
| 返回类型 | `page.PageGroup`（结构体，字段 `.Key`、`.Pages`）；要多个组就自己用 `slice` 装起来 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 期望按 `Section` 分成多个组，却只拿到一个组 | 第一个参数是**组名**，不是字段名（实测） | 改用 [`PAGES.GroupBy`](/methods/pages/groupby/) 等方法 |
| 报错看不懂 | `grouping not supported for type …` | 传入的不是页面集合（例如 `dict` 列表或数字切片） | 确认传入的是 `.Pages`、`site.RegularPages` 这类页面集合 |
| 没报错但结果不对 | `range` 一个组时把组当成列表遍历失败 | `PageGroup` 是结构体，不能直接 `range` | 用 `range .Pages`；多个组要先 `slice` 成切片 |
| 没报错但结果不对 | 分组里的页面顺序不是期望的 | `.Pages` 保持传入顺序 | 取集合时就先排好序（或改用带分组+排序的方法） |

更多排查入口见[故障排查](/troubleshooting/)。

[group methods]: /quick-reference/page-collections/#group
[paginated]: /templates/pagination/
