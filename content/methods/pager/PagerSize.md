+++
title = "PagerSize"
linkTitle = "PagerSize"
description = "返回每个分页器的页面数量。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/pager/pagersize/"
aliases = ["/methods/pager/pagesize/"]

[params.functions_and_methods]
signatures = ["PAGER.PagerSize"]
returnType = "int"
+++

## 这一页解决什么问题

`PagerSize` 返回**每个分页器装多少条**——不是本页实际有几条。这个数字来自两处：调用 [`Paginate`](/methods/page/paginate/) 时传入的第二个参数；没传就用项目配置里的 `pagerSize`。

两者的差别在末页最明显：实测 7 条、每页 3 条时，`/page/3/` 的 `PagerSize` 是 3，而 [`NumberOfElements`](/methods/pager/numberofelements/) 是 1。

## 什么时候用，什么时候别用

**该用**：

- 显示「每页 3 条」这类配置说明；
- 排查「页数为什么和我算的不一样」：先用它确认实际生效的每页条数，再看 [`TotalPages`](/methods/pager/totalpages/)；
- 需要在模板里按每页条数计算偏移、序号（`($paginator.PageNumber - 1) * $paginator.PagerSize`）。

**别用**：

- 想知道**本页实际条数** → 用 [`NumberOfElements`](/methods/pager/numberofelements/)（末页两者不等）；
- 想知道**总条数** → 用 [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/)；
- 不要指望它被「夹」到实际条数：实测 7 条内容、`.Paginate $pages 100` 时它仍然是 `100`。

## 基本用法

每个分页器的页面数量由传给 [`Paginate`][] 方法的可选第二个参数决定；如果未传入，则回退到[项目配置][project configuration]中定义的 `pagerSize`。

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  {{ .PagerSize }}
{{ end }}
```

## 完整示例：确认实际生效的每页条数

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") 2 }}
<p>每页 {{ $paginator.PagerSize }} 条，共 {{ $paginator.TotalPages }} 页</p>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`，项目配置里 `[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。第二个参数 `2` 覆盖了配置值，Hugo 渲染为：

```html
<p>每页 2 条，共 4 页</p>
```

把第二个参数去掉（`{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}`）后，实测同一段模板变成：

```html
<p>每页 3 条，共 3 页</p>
```

**你应当看到什么**：第二个参数优先于配置；每页条数一变，总页数随之变（7 条：每页 2 → 4 页，每页 3 → 3 页）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 配置 `pagerSize = 3`，`.Paginate $pages` | 3 | 否 |
| 第二个参数 2：`.Paginate $pages 2` | 2（覆盖配置），`TotalPages` 为 4 | 否 |
| 第二个参数 100：`.Paginate $pages 100` | **100**（不按实际条数收缩），`TotalPages` 为 1 | 否 |
| 末页 | 仍是配置值（3），不是本页实际条数（1） | 否 |
| 空集合分页 | 仍是配置值（3），而 [`TotalPages`](/methods/pager/totalpages/) 为 0 | 否 |
| 返回类型 | `int`，永远不会是 `nil`；非法值（如 0、负数）不在本页承诺范围，实测未覆盖 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 末页条数与 `PagerSize` 不一致，以为是 bug | `PagerSize` 是配置值，不是本页条数 | 本页条数用 [`NumberOfElements`](/methods/pager/numberofelements/) |
| 没报错但结果不对 | 改了 `Paginate` 的第二个参数，页数没变 | 同一页面第二次 `Paginate` 被静默忽略，沿用了第一次的 pager | 每次分页只调用一次，把参数写在唯一那次调用上 |
| 没报错但结果不对 | 页数比预期多/少 | 实际生效的是第二个参数或配置里的 `pagerSize` | 用本方法打印实际值，再对照 [`TotalPages`](/methods/pager/totalpages/) |
| 报错看不懂 | 提示找不到 `PagerSize` 字段 | 对象不是 Pager（例如直接对页面取） | 先用 `.Paginate` 取出分页器 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Paginate`]: /methods/page/paginate/
[project configuration]: /templates/pagination/
