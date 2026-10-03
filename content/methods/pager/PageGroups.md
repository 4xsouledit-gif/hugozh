+++
title = "PageGroups"
linkTitle = "PageGroups"
description = "返回当前分页器中的页面分组。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/pager/pagegroups/"

[params.functions_and_methods]
signatures = ["PAGER.PageGroups"]
returnType = "page.PagesGroup"
+++

## 这一页解决什么问题

日期归档页有两层结构：外层按月份分组（`2024 年 7 月`），内层是文章列表。文章一多，外层还要翻页——`PageGroups` 就是为这种「**分页 + 分组**」准备的：它返回当前这一页里的分组集合，每个分组有 `.Key`（组名）与 `.Pages`（该组在本页中的页面）。

顺序上要抓住一句话：**Hugo 先把分组后的集合摊平成页面来切页，再按当前页的页面重新分组**。实测把 7 篇文章按 `"2006"` 分成 1 组再分页，仍然得到 3 个 pager，每页的 `PageGroups` 都是同一个 `key=2024`，只是 `.Pages` 分别只有 3、3、1 篇。

## 什么时候用，什么时候别用

**该用**：

- 日期归档页：按月（`"Jan 2006"`）或按年（`"2006"`）分组，同时分页；
- 需要「本页有哪些分组、每组哪些文章」的完整结构。

**别用**：

- 只需要分组、不需要分页 → 直接用分组方法的结果 `range`（见 [`PAGES.GroupByDate`](/methods/pages/groupbydate/)），不必经过分页器；
- 只需要平铺的页面列表 → 用 [`Pages`](/methods/pager/pages/)（实测按组分页时 `.Pages` 是**空的**，不能用来取内容）；
- 想数「这一页几篇文章」→ 用 [`NumberOfElements`](/methods/pager/numberofelements/)：实测按组分页时它仍然计页面数（3 / 3 / 1）。

## 基本用法

把 `PageGroups` 方法与任意[分组方法][grouping methods]配合使用。

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate ($pages.GroupByDate "Jan 2006") }}

{{ range $paginator.PageGroups }}
  <h2>{{ .Key }}</h2>
  {{ range .Pages }}
    <h3><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h3>
  {{ end }}
{{ end }}

{{ partial "pagination.html" . }}
```

## 完整示例：按月归档 + 分页

```go-html-template {file="layouts/home.html"}
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate ($pages.GroupByDate "Jan 2006") }}
{{ range $paginator.PageGroups }}
  <h2>{{ .Key }}</h2>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`（日期 2024-01 至 2024-07，每月一篇），`[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。

`/`（第 1 页）渲染为（`range` 会留下空行，这里省略）：

```html
  <h2>Jul 2024</h2>
  <ul>
      <li><a href="/posts/p7/">Post 7</a></li>
  </ul>

  <h2>Jun 2024</h2>
  <ul>
      <li><a href="/posts/p6/">Post 6</a></li>
  </ul>

  <h2>May 2024</h2>
  <ul>
      <li><a href="/posts/p5/">Post 5</a></li>
  </ul>
```

`/page/3/`（最后一页）渲染为：

```html
  <h2>Jan 2024</h2>
  <ul>
      <li><a href="/posts/p1/">Post 1</a></li>
  </ul>
```

**你应当看到什么**：第 1 页装了 3 个分组（每页 3 条），最后一页只剩 1 个分组。分组名来自 `GroupByDate` 的布局字符串（`"Jan 2006"` → `Jul 2024`），不要自己拼。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `.Paginate ($pages.GroupByDate "Jan 2006")`（7 个月 → 7 组） | 3 个 pager；第 1 页 3 个分组、第 3 页 1 个分组，每个分组 `.Pages` 长度 1 | 否 |
| `.Paginate ($pages.GroupByDate "2006")`（7 篇 → 1 组） | **仍是 3 个 pager**；每页的 `PageGroups` 都是 `key=2024`，`.Pages` 分别长 3、3、1 | 否 |
| 按组分页时同页的 [`Pages`](/methods/pager/pages/) | 空（`len` 为 0）——内容只在这里 | 否 |
| 按组分页时 [`NumberOfElements`](/methods/pager/numberofelements/) / [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/) | 仍是页面数（3 / 3 / 1，总数 7），不是分组数 | 否 |
| 用**未分组**的集合分页（`.Paginate $pages`） | 空集合（`len` 为 0），`range` 什么也不输出 | 否 |
| 空集合分页 | 空集合（`len` 为 0） | 否 |
| 返回类型 | `page.PagesGroup`（分组切片），元素有 `.Key` 与 `.Pages` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上什么都没有，也不报错 | `.Paginate` 收到的是普通页面集合，没有分组可返回 | 传分组结果：`.Paginate ($pages.GroupByDate "Jan 2006")` |
| 没报错但结果不对 | 用 `range $paginator.Pages` 取内容，结果空白 | 按组分页时 `.Pages` 为空 | 改用 `range $paginator.PageGroups`，再 `range .Pages` |
| 没报错但结果不对 | 同一个分组标题在每一页都出现 | 一个组被拆到了多页（实测按 `"2006"` 分组时，3 个分页页上都出现 `2024`） | 预期行为；想避免就改用不分页的归档页，或换更细的分组粒度 |

更多排查入口见[故障排查](/troubleshooting/)。

[grouping methods]: /methods/pages/groupbydate/
