+++
title = "First"
linkTitle = "First"
description = "返回分页器集合中的第一个分页器。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/pager/first/"

[params.functions_and_methods]
signatures = ["PAGER.First"]
returnType = "page.Pager"
+++

## 这一页解决什么问题

`First` 返回分页器集合里的**第一个分页器**，用来生成「首页」链接。它是全集合的第一个，与你当前在哪一页无关：实测第 1、2、3 页上，`.First` 的 `URL` 都是 `/`、`PageNumber` 都是 1。

## 什么时候用，什么时候别用

**该用**：

- 生成「首页 / 第一页」链接；
- 需要跳到集合开头（例如「回到最新内容」）；
- 需要第一页的编号或地址：`$paginator.First.PageNumber`、`$paginator.First.URL`。

**别用**：

- 判断「当前是不是第一页」→ 用 [`HasPrev`](/methods/pager/hasprev/)：实测 `.First` **永远有值**，在第 1 页上它等于当前 pager，无法据此区分；
- 生成相邻页链接 → 用 [`Prev`](/methods/pager/prev/) / [`Next`](/methods/pager/next/)；
- 生成数字页码条 → 用 [`Pagers`](/methods/pager/pagers/)。

## 基本用法

使用 `First` 方法在分页器之间构建导航。

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
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

## 完整示例：首页与末页两个链接

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}
<nav>
  {{ with $paginator.First }}<a href="{{ .URL }}">首页</a>{{ end }}
  {{ with $paginator.Last }}<a href="{{ .URL }}">末页</a>{{ end }}
</nav>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`，`[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。`/` 渲染为：

```html
<nav>
  <a href="/">首页</a>
  <a href="/page/3/">末页</a>
</nav>
```

`/page/3/`（最后一页）渲染的结果与此**完全相同**。把两个 pager 的编号也打印出来，实测三个分页页上都是：

```text
First: URL=[/] PageNumber=[1]
Last: URL=[/page/3/] PageNumber=[3]
```

**你应当看到什么**：两个地址不随当前页变化——`.First` / `.Last` 描述的是集合的边界，不是「你旁边那一页」。这正是它与 [`Prev`](/methods/pager/prev/) / [`Next`](/methods/pager/next/) 的区别。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 第 1、2、3 页 | 都返回第 1 个 pager：`URL` 为 `/`、`PageNumber` 为 1 | 否 |
| 单页分页（7 条、每页 100） | 返回当前 pager 自身：`URL` 为 `/`、`PageNumber` 为 1 | 否 |
| 空集合分页 | 仍返回一个 pager（`URL` 为 `/`、`PageNumber` 为 1，而 [`TotalPages`](/methods/pager/totalpages/) 为 0），**不是 nil** | 否 |
| 在 `with` 里判断 | 永远为真——不要用它做条件 | 否 |
| 返回类型 | `page.Pager`，永远有值；取 `.URL`、`.PageNumber` 都安全 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 第 1 页上仍渲染出「首页」链接，点了没反应 | `.First` 在第 1 页上就是当前页，永远有值 | 用 [`HasPrev`](/methods/pager/hasprev/) 判断要不要渲染 |
| 没报错但结果不对 | 「首页」链接指向 `/page/1/`（404） | 手工拼了分页地址 | 用 pager 的 [`URL`](/methods/pager/url/)，第 1 页会给出 `/` |
| 没报错但结果不对 | 空列表页也出现「末页」链接 | 空集合仍有一个 pager | 用 [`TotalPages`](/methods/pager/totalpages/) 判断 |
| 报错看不懂 | 在分页器之外取 `.First` | 该方法只在 Pager 对象上 | 先用 `.Paginate` 取出分页器 |

更多排查入口见[故障排查](/troubleshooting/)。
