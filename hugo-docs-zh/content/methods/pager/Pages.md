+++
title = "Pages"
linkTitle = "Pages"
description = "返回当前分页器中的页面。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/pager/pages/"

[params.functions_and_methods]
signatures = ["PAGER.Pages"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

`Pages` 返回**当前分页器**里包含的页面集合——不是全站页面，也不是整个待分页集合。分页列表页的主体就是遍历它：第 1 页给前 3 条，第 2 页给第 4–6 条，以此类推。实测 7 条、每页 3 条时，`/` 给 3 条、`/page/2/` 给 3 条、`/page/3/` 给 1 条。

## 什么时候用，什么时候别用

**该用**：

- 渲染当前这页的文章列表（分页列表页的主循环）；
- 把当前页的页面再交给 `range`、`where`、`sort` 处理。

**别用**：

- 要**全部**页面、不分页 → 直接用 `site.RegularPages`、[`RegularPages`](/methods/page/regularpages/) 或 `where` 的结果；
- 要**全部** pager（数字页码条）→ 用 [`Pagers`](/methods/pager/pagers/)；
- 想统计条数 → 用 [`NumberOfElements`](/methods/pager/numberofelements/)：实测普通分页下它与 `len .Pages` 一致，但**按组分页时 `.Pages` 是空的**，而 `NumberOfElements` 仍在计数。

## 基本用法

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ partial "pagination.html" . }}
```

## 完整示例：首页文章列表

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}
<ul>
  {{ range $paginator.Pages }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`（日期 2024-01 至 2024-07），`[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。

`/`（第 1 页）渲染为（`range` 会留下空行，这里省略）：

```html
<ul>
    <li><a href="/posts/p7/">Post 7</a></li>
    <li><a href="/posts/p6/">Post 6</a></li>
    <li><a href="/posts/p5/">Post 5</a></li>
</ul>
```

`/page/3/`（最后一页）渲染为：

```html
<ul>
    <li><a href="/posts/p1/">Post 1</a></li>
</ul>
```

**你应当看到什么**：7 = 3 + 3 + 1。第 1 页是最新的三篇（集合默认按日期倒序），最后一页只剩一条。总页数与本页条数可分别用 [`TotalPages`](/methods/pager/totalpages/)、[`NumberOfElements`](/methods/pager/numberofelements/) 核对。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 7 条、每页 3 条的普通分页 | `Pages(3)`；最后一页 `Pages(1)` | 否 |
| 单页分页（7 条、每页 100） | `Pages(7)`，全部内容都在这一页 | 否 |
| 按组分页（`.Paginate ($pages.GroupByDate "2006")`） | **空集合**（`len` 为 0）——内容要从 [`PageGroups`](/methods/pager/pagegroups/) 取 | 否 |
| 空集合分页 | 空集合（`len` 为 0） | 否 |
| 在 `if` / `with` 里判断 | 空集合判为假，可以据此隐藏列表 | 否 |
| 返回类型 | `page.Pages`（页面集合），可继续交给 `range`、`len`、`where` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上条数和预期不符 | 拿到的是当前 pager 的子集，不是全站 | 用 [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/) 看总数、[`TotalPages`](/methods/pager/totalpages/) 看页数 |
| 没报错但结果不对 | 按组分页时列表整块空白 | 按组分页的 pager 把内容放在 `PageGroups` 里，`.Pages` 为空 | 改用 [`PageGroups`](/methods/pager/pagegroups/) |
| 没报错但结果不对 | 首页第一页内容不是最新的 | 待分页集合没有排序 | 在 `Paginate` 之前用 `ByDate`、`ByWeight` 等显式排序 |
| 报错看不懂 | `error calling Paginate: pagination not supported for this page` | 在普通内容页上调用 `Paginate` | 只在 `home` / `section` / `taxonomy` / `term` 模板里分页 |

更多排查入口见[故障排查](/troubleshooting/)。
