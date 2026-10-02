+++
title = "PageNumber"
linkTitle = "PageNumber"
description = "返回当前分页器在分页器集合中的编号。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/pager/pagenumber/"

[params.functions_and_methods]
signatures = ["PAGER.PageNumber"]
returnType = "int"
+++

## 这一页解决什么问题

`PageNumber` 返回当前分页器的编号，**从 1 开始**：首页是 1，`/page/2/` 是 2……它是「第几页」这个问题的答案，用在「第 3 页 / 共 7 页」的提示文字里，也用来在页码条上高亮当前页。

实测 7 条、每页 3 条时：`/` 得到 1、`/page/2/` 得到 2、`/page/3/` 得到 3。

## 什么时候用，什么时候别用

**该用**：

- 显示「第 N 页 / 共 M 页」：配 [`TotalPages`](/methods/pager/totalpages/)；
- 在 `range .Pagers` 里高亮当前页：比较 `.PageNumber` 与 `$paginator.PageNumber`；
- 判断能否往前/往后翻页（与 1 和 `TotalPages` 比较）。

**别用**：

- 判断「有没有上一页/下一页」→ 用 [`HasPrev`](/methods/pager/hasprev/) / [`HasNext`](/methods/pager/hasnext/)，比手写比较更贴合语义；
- 想要地址 → 用 [`URL`](/methods/pager/url/)；
- 想要条数 → 用 [`NumberOfElements`](/methods/pager/numberofelements/) / [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/)；
- 别假设它从 0 开始：实测空集合分页时它仍然是 1（而 `TotalPages` 是 0）。

## 基本用法

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  <ul>
    {{ range .Pagers }}
      <li><a href="{{ .URL }}">{{ .PageNumber }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：显示当前页码

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}
<p>第 {{ $paginator.PageNumber }} 页 / 共 {{ $paginator.TotalPages }} 页</p>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`，`[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。三个分页页分别渲染为：

```html
<p>第 1 页 / 共 3 页</p>
```

```html
<p>第 2 页 / 共 3 页</p>
```

```html
<p>第 3 页 / 共 3 页</p>
```

**你应当看到什么**：同一段模板在三份产物里给出三个不同的编号——`.PageNumber` 是**每个分页页各自**的上下文，不是全站共享的值。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 7 条、每页 3 条 | `/` 为 1、`/page/2/` 为 2、`/page/3/` 为 3 | 否 |
| 单页分页（7 条、每页 100） | 1（没有 `/page/2/`） | 否 |
| 空集合分页 | **1**，而 [`TotalPages`](/methods/pager/totalpages/) 是 0——两者组合会出现「第 1 页 / 共 0 页」 | 否 |
| 与 `Pagers` 里各元素的关系 | 实测 `$paginator.Pagers` 中每个元素的 `.PageNumber` 与它在集合中的位置一致（1、2、3） | 否 |
| 返回类型 | `int`，从 1 开始，不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 用 `eq .PageNumber 0` 判断首页，永远不成立 | 编号从 1 开始 | 用 `eq .PageNumber 1`，或直接用 [`HasPrev`](/methods/pager/hasprev/) |
| 没报错但结果不对 | 空列表页显示「第 1 页 / 共 0 页」 | 空集合仍有一个 pager，`PageNumber` 为 1、`TotalPages` 为 0 | 用 `TotalPages` 判断要不要渲染整个分页条 |
| 没报错但结果不对 | 页码条上所有项都高亮 | 循环里没有比较当前页 | 比较 `.PageNumber` 与 `$paginator.PageNumber` |
| 报错看不懂 | 在分页器之外（例如页面上下文）取 `.PageNumber` | 该字段只在 Pager 对象上 | 先用 `.Paginate` 取出分页器 |

更多排查入口见[故障排查](/troubleshooting/)。
