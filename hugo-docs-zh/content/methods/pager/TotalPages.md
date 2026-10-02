+++
title = "TotalPages"
linkTitle = "TotalPages"
description = "返回分页器集合中的分页器数量。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/pager/totalpages/"

[params.functions_and_methods]
signatures = ["PAGER.TotalPages"]
returnType = "int"
+++

## 这一页解决什么问题

`TotalPages` 返回**一共有几个分页器**，也就是「共几页」。实测 7 条、每页 3 条时是 3（3 + 3 + 1）。它和 [`NumberOfElements`](/methods/pager/numberofelements/) / [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/) 一起回答分页的四个数量问题：

| 想知道 | 用 |
| --- | --- |
| 共几页 | `TotalPages` |
| 第几页 | [`PageNumber`](/methods/pager/pagenumber/) |
| 每页几条（配置值） | [`PagerSize`](/methods/pager/pagersize/) |
| 本页几条 / 一共几条 | [`NumberOfElements`](/methods/pager/numberofelements/) / [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/) |

## 什么时候用，什么时候别用

**该用**：

- 显示「第 N 页 / 共 M 页」；
- 决定「要不要渲染分页导航」：实测空集合时它是 0，这正是隐藏导航的判据。

**别用**：

- 想数**一共有多少条内容** → 用 [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/)（实测 7 条、每页 3 条时 `TotalPages` 是 3，`TotalNumberOfElements` 是 7）；
- 想数**分页器集合的长度** → 小心：实测空集合时 `TotalPages` 是 0，而 [`Pagers`](/methods/pager/pagers/) 的长度是 1，两者不等价；
- 想判断「还有没有下一页」→ 用 [`HasNext`](/methods/pager/hasnext/)。

## 基本用法

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  <p>Pager {{ .PageNumber }} of {{ .TotalPages }}</p>
  <ul>
    {{ with .First }}
      <li><a href="{{ .URL }}">First</a></li>
    {{ end }}
    {{ with .Prev }}
      <li><a href="{{ .URL }}">Previous</a></li>
    {{ end }}
    {{ with .Next }}
      <li><a href="{{ .URL }}">Next</a></li>
    {{ end }}
    {{ with .Last }}
      <li><a href="{{ .URL }}">Last</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：一句话说明分页进度

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}
<p>共 {{ $paginator.TotalPages }} 页，{{ $paginator.TotalNumberOfElements }} 条内容，当前第 {{ $paginator.PageNumber }} 页</p>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`，`[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。`/` 渲染为：

```html
<p>共 3 页，7 条内容，当前第 1 页</p>
```

`/page/3/` 渲染为：

```html
<p>共 3 页，7 条内容，当前第 3 页</p>
```

**你应当看到什么**：前两个数字在每一页上都相同（全集合的量），只有 `PageNumber` 变——这就是「总量 vs 位置」的分工。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 7 条、每页 3 条 | 3（3 + 3 + 1） | 否 |
| 7 条、每页 2 条（`.Paginate $pages 2`） | 4（2 + 2 + 2 + 1） | 否 |
| 7 条、每页 100 条（`.Paginate $pages 100`） | 1 | 否 |
| 空集合分页 | **0**，但此时仍存在一个 pager（[`PageNumber`](/methods/pager/pagenumber/) 为 1、[`Pagers`](/methods/pager/pagers/) 长度为 1） | 否 |
| 在 `if` / `with` 里判断 | 0 判为假，可以用来隐藏分页导航 | 否 |
| 返回类型 | `int`，不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 把「共 3 页」当成了「共 3 条」 | `TotalPages` 数的是分页器，不是页面 | 条数用 [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/) |
| 没报错但结果不对 | 空列表页仍渲染出空的分页条 | 用 `len .Pagers` 当页数（空集合时长度为 1） | 用 `TotalPages` 判断 |
| 没报错但结果不对 | 显示的页数与预期不符 | 每页条数来自配置或 `Paginate` 的第二个参数 | 用 [`PagerSize`](/methods/pager/pagersize/) 核对实际取值 |
| 没报错但结果不对 | 改了小集合的每页条数，页数却没变 | 同一页面上第二次 `Paginate` 调用被静默忽略 | 每次分页只用一次 `Paginate`（见 [methods/page/paginate](/methods/page/paginate/)） |

更多排查入口见[故障排查](/troubleshooting/)。
