+++
title = "NumberOfElements"
linkTitle = "NumberOfElements"
description = "返回当前分页器中的页面数量。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/pager/numberofelements/"

[params.functions_and_methods]
signatures = ["PAGER.NumberOfElements"]
returnType = "int"
+++

## 这一页解决什么问题

`NumberOfElements` 返回**当前这一页有几条内容**。实测 7 条、每页 3 条时，`/` 是 3、`/page/2/` 是 3、`/page/3/` 是 **1**——最后一页通常不满，这正是它和 [`PagerSize`](/methods/pager/pagersize/)（配置的每页条数）的差别。

它也是 [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/) 的「本页分量」：一个说总数，一个说本页。

## 什么时候用，什么时候别用

**该用**：

- 显示「本页 3 条」这类实际条数；
- 判断本页是否为空（实测空集合分页时为 0）；
- 与 [`Pages`](/methods/pager/pages/) 配合：普通分页下二者一致，可用它做长度断言。

**别用**：

- 想知道**配置的每页条数** → 用 [`PagerSize`](/methods/pager/pagersize/)（末页两者不相等）；
- 想知道**集合总数** → 用 [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/)；
- 想数**页数** → 用 [`TotalPages`](/methods/pager/totalpages/)；
- 不要假设它等于 `len .Pages`：实测**按组分页时 `.Pages` 为空、而 `NumberOfElements` 仍计数**（见下表）。

## 基本用法

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  {{ .NumberOfElements }}
{{ end }}
```

## 完整示例：本页条数 / 每页条数 / 总条数

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}
<p>本页 {{ $paginator.NumberOfElements }} 条，每页 {{ $paginator.PagerSize }} 条，共 {{ $paginator.TotalNumberOfElements }} 条</p>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`，`[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。`/` 渲染为：

```html
<p>本页 3 条，每页 3 条，共 7 条</p>
```

`/page/3/` 渲染为：

```html
<p>本页 1 条，每页 3 条，共 7 条</p>
```

**你应当看到什么**：只有第一个数字在末页变小（7 = 3 + 3 + 1），另外两个是全集合与配置的量，每页都一样。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 7 条、每页 3 条 | 第 1、2 页为 3，第 3 页为 1 | 否 |
| 单页分页（7 条、每页 100） | 7 | 否 |
| 空集合分页 | 0（在 `if` 里判为假） | 否 |
| 普通分页下与 `len .Pages` 的关系 | 相等（实测 3 与 3、1 与 1） | 否 |
| 按组分页（`.Paginate ($pages.GroupByDate "2006")`） | 仍为 3 / 3 / 1，而 `len .Pages` 是 **0** | 否 |
| 返回类型 | `int`，不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 用 `NumberOfElements` 去除以总数算进度，末页结果怪 | 末页条数少于每页条数 | 进度用 [`PageNumber`](/methods/pager/pagenumber/) / [`TotalPages`](/methods/pager/totalpages/) |
| 没报错但结果不对 | 以为它等于 `len .Pages`，按组分页时对不上 | 按组分页的内容在 `PageGroups` 里，`.Pages` 为空 | 按组分页时用 [`PageGroups`](/methods/pager/pagegroups/) 取内容 |
| 没报错但结果不对 | 把「本页条数」当成了「每页条数」 | 两者只在最后一页不同 | 配置值用 [`PagerSize`](/methods/pager/pagersize/) |
| 报错看不懂 | 在分页器之外取 `.NumberOfElements` | 该字段只在 Pager 对象上 | 先用 `.Paginate` 取出分页器 |

更多排查入口见[故障排查](/troubleshooting/)。
