+++
title = "Pagers"
linkTitle = "Pagers"
description = "返回分页器集合。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/pager/pagers/"

[params.functions_and_methods]
signatures = ["PAGER.Pagers"]
returnType = "page.pagers"
+++

## 这一页解决什么问题

`Pagers` 返回**全部分页器**的集合（包含当前这个），用来渲染 `1 2 3 …` 那样的数字页码条。集合里的每个元素都是 Pager 对象，所以 [`URL`](/methods/pager/url/)、[`PageNumber`](/methods/pager/pagenumber/)、[`HasNext`](/methods/pager/hasnext/) 等本章方法在 `range` 里都可用。

实测 7 条、每页 3 条的站点上，每个分页页看到的 `.Pagers` 都是同一份 `[1 2 3]`——实测长度为 3。

## 什么时候用，什么时候别用

**该用**：

- 渲染数字页码条（`{{ range .Pagers }}`）；
- 需要从任意一页拿到「第一页/最后一页」的地址：`index $paginator.Pagers 0`。

**别用**：

- 只要当前页的页面 → 用 [`Pages`](/methods/pager/pages/)；
- 只要总页数（一个数字）→ 用 [`TotalPages`](/methods/pager/totalpages/)；
- 只想跳到相邻页 → 用 [`Prev`](/methods/pager/prev/) / [`Next`](/methods/pager/next/)；
- 想按页码算地址 → 不要手工拼 `/page/N/`，直接取 pager 的 [`URL`](/methods/pager/url/)。

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

## 完整示例：数字页码条

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}
<ul>
  {{ range $paginator.Pagers }}
    <li><a href="{{ .URL }}">{{ .PageNumber }}</a></li>
  {{ end }}
</ul>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`，`[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。`/` 渲染为（`range` 会留下空行，这里省略）：

```html
<ul>
    <li><a href="/">1</a></li>
    <li><a href="/page/2/">2</a></li>
    <li><a href="/page/3/">3</a></li>
</ul>
```

**你应当看到什么**：`/page/2/`、`/page/3/` 上渲染出的页码条与此**完全相同**——`.Pagers` 是整个集合，不随当前页变化；要知道「当前在哪一页」得用 [`PageNumber`](/methods/pager/pagenumber/)。注意第 1 页的地址是 `/`，不是 `/page/1/`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 7 条、每页 3 条 | 长度 3：`/`、`/page/2/`、`/page/3/` | 否 |
| 单页分页（7 条、每页 100） | 长度 1，只含当前页 | 否 |
| 空集合分页 | **长度 1**，但 [`TotalPages`](/methods/pager/totalpages/) 是 **0**——集合里有一个「空 pager」，所以不要用 `len .Pagers` 当页数 | 否 |
| 元素可用方法 | 与其他 Pager 对象一致（`URL`、`PageNumber`、`HasNext`…） | 否 |
| 返回类型 | `page.pagers`，可 `range`、`len`、`index` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 空列表也渲染出「1」这个页码 | 空集合时 `.Pagers` 长度为 1 | 用 [`TotalPages`](/methods/pager/totalpages/) 判断是否渲染页码条 |
| 没报错但结果不对 | 每个分页页上「当前页」都高亮成 1 | 拿 `.Pagers` 直接渲染，没有与当前页比较 | 在循环里比较 `.PageNumber` 与 `$paginator.PageNumber` |
| 没报错但结果不对 | 第 1 页链接指到 `/page/1/` 而 404 | 手工拼了分页地址 | 用 pager 的 [`URL`](/methods/pager/url/)，它会给 `/` |
| 报错看不懂 | 提示找不到 `Pagers` 字段 | 把 `.Pagers` 用在了非分页器对象上（例如页面） | 先用 `.Paginate` 拿到分页器，再 `range` 它的 `.Pagers` |

更多排查入口见[故障排查](/troubleshooting/)。
