+++
title = "TotalNumberOfElements"
linkTitle = "TotalNumberOfElements"
description = "返回分页器集合中的页面数量。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/pager/totalnumberofelements/"

[params.functions_and_methods]
signatures = ["PAGER.TotalNumberOfElements"]
returnType = "int"
+++

## 这一页解决什么问题

`TotalNumberOfElements` 返回**整个分页集合里一共有多少条内容**——不是本页条数，也不是页数。实测 7 条、每页 3 条时，每个分页页上它都是 7。

它常用来做「共 N 篇」的文案，或者判断集合是否为空（实测空集合时为 0）。它与三个数字容易混淆，对照如下：

| 想知道 | 用 | 实测（7 条、每页 3 条） |
| --- | --- | --- |
| 一共几条 | `TotalNumberOfElements` | 7 |
| 本页几条 | [`NumberOfElements`](/methods/pager/numberofelements/) | 3 / 3 / 1 |
| 共几页 | [`TotalPages`](/methods/pager/totalpages/) | 3 |
| 每页几条 | [`PagerSize`](/methods/pager/pagersize/) | 3 |

## 什么时候用，什么时候别用

**该用**：

- 显示「共 7 篇」这类总量文案；
- 判断集合是否为空：实测空集合时为 0，在 `if` 里判为假。

**别用**：

- 想数**页数** → 用 [`TotalPages`](/methods/pager/totalpages/)；
- 想数**本页条数** → 用 [`NumberOfElements`](/methods/pager/numberofelements/)；
- 不要把「按组分页时的组数」当成它：实测按组分页时它仍然是**内容条数**（7），不是分组数（1），组数要看 `len .PageGroups`。

## 基本用法

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  {{ .TotalNumberOfElements }}
{{ end }}
```

## 完整示例：给列表页加一行总数说明

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}
<p>共 {{ $paginator.TotalNumberOfElements }} 篇，分 {{ $paginator.TotalPages }} 页，当前第 {{ $paginator.PageNumber }} 页</p>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`，`[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。`/` 渲染为：

```html
<p>共 7 篇，分 3 页，当前第 1 页</p>
```

`/page/2/` 渲染为：

```html
<p>共 7 篇，分 3 页，当前第 2 页</p>
```

**你应当看到什么**：前两个数字每页都相同，只有页号变。若把 `pagerSize` 改成 2，同一段模板会变成「共 7 篇，分 4 页」——总数不变、页数变。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 7 条、每页 3 条 | 7（每个分页页都一样） | 否 |
| 7 条、每页 2 条 | 7 | 否 |
| 单页分页（7 条、每页 100） | 7 | 否 |
| 空集合分页 | 0（`if` 判为假） | 否 |
| 按组分页（`.Paginate ($pages.GroupByDate "2006")`） | 7——**内容条数**，不是分组数 1 | 否 |
| 返回类型 | `int`，不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 「共 N 页」写出了内容条数 | 把本方法与 [`TotalPages`](/methods/pager/totalpages/) 弄混 | 页数用 `TotalPages` |
| 没报错但结果不对 | 文案里「共 7 篇」在每页都出现，被误当成「本页 7 篇」 | 它是全集合的量 | 本页条数用 [`NumberOfElements`](/methods/pager/numberofelements/) |
| 没报错但结果不对 | 按组分页后总数对不上分组数 | 它数的是内容，不是组 | 组数用 `len .PageGroups`，见 [`PageGroups`](/methods/pager/pagegroups/) |
| 报错看不懂 | 在分页器之外取 `.TotalNumberOfElements` | 该字段只在 Pager 对象上 | 先用 `.Paginate` 取出分页器 |

更多排查入口见[故障排查](/troubleshooting/)。
