+++
title = "Paginate"
linkTitle = "Paginate"
description = "返回对给定页面集合分页后得到的分页器。"
date = 2026-10-02
weight = 490
source = "https://gohugo.io/methods/page/paginate/"

[params.functions_and_methods]
signatures = ["PAGE.Paginate COLLECTION [N]"]
returnType = "page.Pager"
+++

## 这一页解决什么问题

列表页有几百篇文章时，不能一次全渲染。`Paginate` 把一个**你指定的页面集合**切成多个分页器（pager），返回当前这一页对应的那个分页器；它的 `.Pages` 就是本页要显示的页面。

和 [`.Paginator`](/methods/page/paginator/) 的关键区别：`.Paginate` 接收集合参数，因此**可以先过滤、排序**再分页——这是绝大多数站点需要的写法。

## 什么时候用，什么时候别用

**该用**：

- 文章列表要「先筛选/排序，再分页」：`where`、`.ByDate`、`.ByTitle` 之后再 `.Paginate`；
- 想覆盖每页条数（第二个参数 `N`），而不是用全局默认值。

**别用**：

- 直接对「当前列表页上下文里的集合」分页、不筛选 → 用 [`.Paginator`](/methods/page/paginator/) 更短；
- 想分页一个非页面集合（例如 `hugo.Data` 的切片）→ 分页只接受页面集合（`page.Pages`）；
- 在常规内容页上调用 → 实测报错 `pagination not supported for this page`。

> [!NOTE]
> `Page` 对象上还有一个 `Paginator` 方法，但它既不能过滤也不能排序页面集合。
>
> `Paginate` 方法更加灵活。

## 用法

分页（pagination）是指把一个列表页面拆分成两个或多个分页器（pager），每个分页器包含页面集合的一个子集，以及指向其他分页器的导航链接。

默认情况下，每个分页器上的元素个数由你的[项目配置][]决定，默认值为 `10`。调用 `Paginate` 方法时传入第二个参数（一个整数）即可覆盖该值。

你可以在[首页][home]、[section][section]、[分类法][taxonomy]和[术语][term]模板中调用分页。

```go-html-template {file="layouts/section.html"}
{{ $pages := where .Site.RegularPages "Section" "articles" }}
{{ $pages = $pages.ByTitle }}
{{ range (.Paginate $pages 7).Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
{{ partial "pagination.html" . }}
```

在上例中，我们：

1. 构建一个页面集合
1. 按标题对集合排序
1. 对集合分页，每个分页器含 7 个元素
1. 遍历分页后的页面集合，为每个页面渲染一个链接
1. 调用内嵌的分页模板，在分页器之间创建导航链接

> [!NOTE]
> 请注意，分页结果会被缓存。一旦调用了 `Paginator` 或 `Paginate` 方法，分页后的集合就不可更改。再次调用这些方法不会产生任何效果。

## 完整示例：先筛选再分页

测试站配置：

```toml
[pagination]
pagerSize = 2
```

首页模板（先按 section 过滤，再分页，每页 3 条）：

```go-html-template {file="layouts/index.html"}
{{ $pages := where site.RegularPages "Section" "posts" }}
{{ $pager := .Paginate $pages 3 }}
<ul>
  {{ range $pager.Pages }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
<p>第 {{ $pager.PageNumber }} / {{ $pager.TotalPages }} 页</p>
```

实测（Hugo 0.167.0；`site.RegularPages` 共 14 条，其中 `Section == "posts"` 的有 10 条）：

```html
<ul>
  <li><a href="/posts/post-1/">第一篇</a></li>
  <li><a href="/posts/post-2/">第二篇</a></li>
  <li><a href="/posts/post-3/">第三篇</a></li>
</ul>
<p>第 1 / 4 页</p>
```

**你应当看到什么**：10 条 / 每页 3 条 = 4 页（`TotalPages` 为 4，最后一次调用没有改配置）。第二个参数 `3` 覆盖了配置里的 `pagerSize = 2`——这就是 `.Paginate` 比 `.Paginator` 灵活的地方：可以**只在本页**改变每页条数。

分页结果**不可变**（实测）：同一个模板里先 `.Paginate $pages 3`、再读 `.Paginator`，得到的仍是同一个分页器（`TotalPages` 一致、`.Pages` 一致），第二次调用不会重新分页。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 正常调用 | `page.Pager`：`.Pages`、`.PageNumber`、`.TotalPages`、`.Paginator`、`.Next`、`.Prev` 等 | 否 |
| 每页条数 | 省略时用 `[pagination].pagerSize`（默认 10）；传入 `N` 时覆盖 | 否 |
| 集合为空 | 分页器仍然可用：实测 `.TotalPages` 为 `0`、`.Pages` 长度为 0 | 否 |
| 集合里只有 1 条、每页 3 条 | `.TotalPages` 为 1 | 否 |
| 在同一模板里重复调用 | 第一次的结果被缓存，后续调用不生效（实测） | 否 |
| 在常规内容页上调用 | —— | 是：`error calling Paginate: pagination not supported for this page`，构建退出码 1 |
| 传入非页面集合 | 类型不匹配时模板报错（上游未给出具体报文） | 是 |
| 返回类型 | `page.Pager` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[home]: /templates/types/#home
[project configuration]: /configuration/pagination/
[section]: /templates/types/#section
[taxonomy]: /templates/types/#taxonomy
[term]: /templates/types/#term
