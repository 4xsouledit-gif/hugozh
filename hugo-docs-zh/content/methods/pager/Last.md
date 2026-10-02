+++
title = "Last"
linkTitle = "Last"
description = "返回分页器集合中的最后一个分页器。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/pager/last/"

[params.functions_and_methods]
signatures = ["PAGER.Last"]
returnType = "page.Pager"
+++

## 这一页解决什么问题

`Last` 返回分页器集合里的**最后一个分页器**，用来生成「末页」链接。它同样是集合级的：实测第 1、2、3 页上，`.Last` 的 `URL` 都是 `/page/3/`、`PageNumber` 都是 3。

## 什么时候用，什么时候别用

**该用**：

- 生成「末页 / 最后一页」链接；
- 需要最后一页的编号或地址：`$paginator.Last.PageNumber`、`$paginator.Last.URL`。

**别用**：

- 判断「当前是不是最后一页」→ 用 [`HasNext`](/methods/pager/hasnext/)：实测 `.Last` **永远有值**，在最后一页上它就是当前 pager；
- 生成相邻页链接 → 用 [`Prev`](/methods/pager/prev/) / [`Next`](/methods/pager/next/)；
- 生成数字页码条 → 用 [`Pagers`](/methods/pager/pagers/)。

## 基本用法

使用 `Last` 方法在分页器之间构建导航。

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

`/page/2/` 与 `/page/3/` 渲染的结果与此**完全相同**；把编号打印出来，实测三页都是：

```text
First: URL=[/] PageNumber=[1]
Last: URL=[/page/3/] PageNumber=[3]
```

**你应当看到什么**：末页地址在每一页上都一样。要注意「末页」是**集合的最后一页**，不是「比当前页更靠后的那一页」——后者是 [`Next`](/methods/pager/next/)。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 第 1、2、3 页 | 都返回第 3 个 pager：`URL` 为 `/page/3/`、`PageNumber` 为 3 | 否 |
| 单页分页（7 条、每页 100） | 返回当前 pager 自身：`URL` 为 `/`、`PageNumber` 为 1 | 否 |
| 空集合分页 | 仍返回一个 pager（`URL` 为 `/`、`PageNumber` 为 1，而 [`TotalPages`](/methods/pager/totalpages/) 为 0），**不是 nil** | 否 |
| 在 `with` 里判断 | 永远为真——不要用它做条件 | 否 |
| 返回类型 | `page.Pager`，永远有值；取 `.URL`、`.PageNumber` 都安全 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 最后一页上仍渲染出「末页」链接 | `.Last` 在最后一页上就是当前页，永远有值 | 用 [`HasNext`](/methods/pager/hasnext/) 判断 |
| 没报错但结果不对 | 点「末页」跳到了 `/page/1/`（404） | 手工拼了分页地址 | 用 pager 的 [`URL`](/methods/pager/url/) |
| 没报错但结果不对 | 空列表页也出现「末页」链接 | 空集合仍有一个 pager | 用 [`TotalPages`](/methods/pager/totalpages/) 判断 |
| 没报错但结果不对 | 末页地址不是预期的那一页 | 每页条数（[`PagerSize`](/methods/pager/pagersize/)）与预期不同 | 先打印 `PagerSize` 与 `TotalPages` 核对 |

更多排查入口见[故障排查](/troubleshooting/)。
