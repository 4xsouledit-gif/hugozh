+++
title = "Paginator"
linkTitle = "Paginator"
description = "返回对上下文中收到的常规页面集合分页后得到的分页器。"
date = 2026-10-02
weight = 500
source = "https://gohugo.io/methods/page/paginator/"

[params.functions_and_methods]
signatures = ["PAGE.Paginator"]
returnType = "page.Pager"
+++

## 这一页解决什么问题

`.Paginator` 是分页的最短写法：把**当前列表页上下文里已有的页面集合**切成多个分页器，返回当前这一页的那一个，`.Pages` 就是本页要显示的页面。

它不接受参数，也不能先过滤或排序；每页条数完全来自项目配置。所以「分页」这件事，先用 `.Paginator` 试试，一旦需要筛选就换成 [`.Paginate`](/methods/page/paginate/)。

## 什么时候用，什么时候别用

**该用**：

- section / 首页 / taxonomy / term 模板里，直接对上下文集合分页；
- 只关心「第几页、共几页」和翻页链接。

**别用**：

- 需要先 `where` 过滤或 `.ByDate`/`.ByTitle` 排序 → 用 [`.Paginate`](/methods/page/paginate/)（上游也强烈推荐它）；
- 需要只为某一页改每页条数 → 用 `.Paginate`；
- 在常规内容页上调用 → 实测报错 `pagination not supported for this page`。

**两者对照（实测，测试站 `pagerSize = 2`）**：

| 场景 | `.Paginator` | `.Paginate` |
| --- | --- | --- |
| 集合来源 | 上下文里的常规页面集合，不可改 | 你传入的集合，可先 `where`/排序 |
| 每页条数 | 只能用配置值 | 可以传第二个参数覆盖 |
| `/posts/`（10 个常规页面） | `TotalPages = 5`，第一页 = `post-1`、`post-2` | 传 `3` 时 `TotalPages = 4` |

## 用法

分页（pagination）是指把一个列表页面拆分成两个或多个分页器（pager），每个分页器包含页面集合的一个子集，以及指向其他分页器的导航链接。

每个分页器上的元素个数由你的[项目配置][]决定，默认值为 `10`。

你可以在[首页][home]、[section][section]、[分类法][taxonomy]和[术语][term]模板中调用分页。这些模板都会在[上下文](g)中接收一个常规页面集合。调用 `Paginator` 方法时，它会对上下文中收到的页面集合进行分页。

```go-html-template {file="layouts/section.html"}
{{ range .Paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
{{ partial "pagination.html" . }}
```

在上例中，内嵌的分页模板会在分页器之间创建导航链接。

> [!NOTE]
> 尽管调用起来很简单，但 `Paginator` 方法既不能过滤也不能排序页面集合。它只作用于上下文中收到的页面集合。
>
> [`Paginate`][] 方法更灵活，强烈推荐使用。

> [!NOTE]
> 请注意，分页结果会被缓存。一旦调用了 `Paginator` 或 `Paginate` 方法，分页后的集合就不可更改。再次调用这些方法不会产生任何效果。

## 完整示例：section 列表分页

测试站配置 `pagerSize = 2`，section 模板：

```go-html-template {file="layouts/_default/list.html"}
{{ $pager := .Paginator }}
<ul>
  {{ range $pager.Pages }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
<p>第 {{ $pager.PageNumber }} / {{ $pager.TotalPages }} 页，共 {{ $pager.TotalNumberOfElements }} 条</p>
```

实测（Hugo 0.167.0）：

| 渲染的页面 | `TotalPages` | 第一页的 `.Pages` | `TotalNumberOfElements` |
| --- | --- | --- | --- |
| `/posts/` | 5 | `/posts/post-1`、`/posts/post-2` | 10 |
| `/tags/alpha/`（term 页） | 2 | `/posts/post-1`、`/posts/post-3` | 3 |
| `/docs/`（只有 1 个常规页面） | 1 | `/docs/ref` | 1 |

**你应当看到什么**：`TotalPages` 是「总条数 ÷ 每页条数」向上取整（10 ÷ 2 = 5；3 ÷ 2 = 2；1 ÷ 2 → 1）。每页条数完全由配置决定——想改成 3 就必须用 `.Paginate`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 列表页（home/section/taxonomy/term） | `page.Pager` | 否 |
| 集合为空 | `.TotalPages` 为 `0`、`.Pages` 长度为 0（实测 `.Paginate` 空集合时如此；`.Paginator` 同为 0） | 否 |
| 集合条数少于每页条数 | `.TotalPages` 为 1 | 否 |
| 常规内容页 | —— | 是：`error calling Paginator: pagination not supported for this page`，构建退出码 1 |
| 先 `.Paginator` 再 `.Paginate` | 分页已缓存，第二次调用不生效（上游已说明） | 否 |
| 返回类型 | `page.Pager` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Paginate`]: /methods/page/paginate/
[home]: /templates/types/#home
[project configuration]: /configuration/pagination/
[section]: /templates/types/#section
[taxonomy]: /templates/types/#taxonomy
[term]: /templates/types/#term
