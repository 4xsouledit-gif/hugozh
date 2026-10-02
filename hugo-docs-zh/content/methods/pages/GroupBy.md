+++
title = "GroupBy"
linkTitle = "GroupBy"
description = "返回给定页面集合按指定字段升序分组后的结果。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/pages/groupby/"

[params.functions_and_methods]
signatures = ["PAGES.GroupBy FIELD [SORT]"]
returnType = "page.PagesGroup"
+++

## 这一页解决什么问题

把页面集合**分组**：按某个字段的取值切成若干组，每组带一个 `.Key`（组名）和自己的 `.Pages`（组内页面集合）。按月归档、按分区列目录、按类型分栏都用它。

返回类型是 `page.PagesGroup`，`range` 出来的是 `page.PageGroup` 对象（实测类型 `page.PageGroup`），它的 `.Key` 是 `string`，`.Pages` 是 `page.Pages`。

`FIELD` 是**页面上的字段名**（`Section`、`Type`、`Kind` 等），不是任意参数名——要按自定义参数分组请用 [`GroupByParam`](/methods/pages/groupbyparam/)。

## 什么时候用，什么时候别用

**该用**：

- 按 `Section`、`Type`、`Kind` 这类内置字段做分栏/归档；
- 需要「组名 + 组内页面」的两层结构。

**别用**：

- 按**日期**分组 → 用 [`GroupByDate`](/methods/pages/groupbydate/) 及同族的 `GroupByLastmod`/`GroupByExpiryDate`/`GroupByPublishDate`（它们能把一个时间点格式化成 `2024-01` 这样的组名）；
- 按**自定义参数**分组 → 用 [`GroupByParam`](/methods/pages/groupbyparam/)（注意：缺少该参数的页面会被**丢掉**）；
- 只想**排序** → 用 [`ByWeight`](/methods/pages/byweight/) 等；
- 只想**筛选** → 用 [`collections.Where`](/functions/collections/where/)。

## 用法

可选的排序顺序用 `asc` 指定升序，或用 `desc` 指定降序。

```go-html-template
{{ range .Pages.GroupBy "Section" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

要把各组改为降序排列：

```go-html-template
{{ range .Pages.GroupBy "Section" "desc" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：按 Section 分组

示例沿用本章首页的[示例站点结构](/methods/pages/)。在首页模板里用 `site.RegularPages` 才能同时拿到 `books` 与 `posts` 两个分区（在 `posts` 的 section 模板里，`.Pages` 全是 `posts`，只会得到一组）：

```go-html-template {file="layouts/index.html"}
{{ range site.RegularPages.GroupBy "Section" }}{{ .Key }}({{ .Pages.Len }}):{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
```

Hugo 渲染为：

```html
books(2):book-one book-two |posts(4):alpha bravo charlie delta |
```

**你应当看到什么**：两组，组名分别是 `books`、`posts`（**升序**）；`.Pages.Len` 给出组内数量（2 与 4）；组内顺序沿用页面集合的默认顺序。把 `"desc"` 传进去，两组顺序变成 `posts`、`books`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `GroupBy "Section"`（两个分区） | 2 组，升序 `books`、`posts`；组内 `.Pages` 可继续接排序方法 | 否 |
| 元素类型 | 组对象是 `page.PageGroup`；`.Key` 是 `string`；`.Pages` 是 `page.Pages` | 否 |
| 传 `"desc"` | 组顺序反转（`posts`、`books`） | 否 |
| 传其它字符串（`"up"`） | **不报错**，按默认（升序）处理（实测与不传一致） | 否 |
| 字段名不存在（`GroupBy "nope"`） | —— | 是：`error calling GroupBy: reflect: Elem of invalid type page.Page` |
| `GroupBy "Kind"` | 可用：一页一组名为 `page` 的组（实测 6 页同组） | 否 |
| **空集合** | 得到空的分组切片；`range` 无输出，在 `if` 里判为假 | 否 |
| 某组内只有一个页面 | 正常，`.Pages.Len` 为 1 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `reflect: Elem of invalid type page.Page` | `FIELD` 写的不是页面字段名（例如写成了 `"nope"`，或用它去分自定义参数） | 只用页面上的字段名；自定义参数改用 [`GroupByParam`](/methods/pages/groupbyparam/) |
| 没报错但结果不对 | 只有一个组，组名是当前 section | 用 `.Pages` 分组时集合只含本 section 的页面 | 需要跨分区就用 [`site.RegularPages`](/methods/site/regularpages/) 或 [`site.Pages`](/methods/site/pages/) |
| 没报错但结果不对 | 传了拼错的排序词却没报错，顺序也没变 | 无法识别的排序值被忽略，退回默认顺序 | 只写 `asc` / `desc`，写错不会提示 |
| 没报错但结果不对 | 组内页面顺序不是自己想要的 | 分组只决定「怎么分组」，组内顺序沿用原集合 | 在 `.Pages` 上再调排序方法，例如 `range .Pages.ByTitle` |

更多排查入口见[故障排查](/troubleshooting/)。
