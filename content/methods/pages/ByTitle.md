+++
title = "ByTitle"
linkTitle = "ByTitle"
description = "返回给定页面集合按标题升序排序后的结果。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/pages/bytitle/"

[params.functions_and_methods]
signatures = ["PAGES.ByTitle"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

把页面集合按**完整标题（`Title`）升序**重排：文档目录、术语表、按名称查询的索引页。

排序键是 [`Title`](/methods/page/title/)。如果你希望排序键和侧栏/菜单上显示的名字一致，那通常要的是 [`ByLinkTitle`](/methods/pages/bylinktitle/) 而不是本方法。

**排序按 Unicode 码位**，不是按拼音/字典序：中文标题不会得到拼音顺序，英文则区分大小写（大写字母码位在前）。

## 什么时候用，什么时候别用

**该用**：

- 目录、索引、按名称排列的清单，且页面标题本身就是最自然的排序键；
- 需要和 `title` 显示一致时。

**别用**：

- 想按短名/侧栏名排序 → 用 [`ByLinkTitle`](/methods/pages/bylinktitle/)；
- 想要中文拼音序或其他人工顺序 → 用 [`ByWeight`](/methods/pages/byweight/) 手工指定 `weight`；
- 想按日期/篇幅 → 用 [`ByDate`](/methods/pages/bydate/) / [`ByLength`](/methods/pages/bylength/)。

## 用法

```go-html-template
{{ range .Pages.ByTitle }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByTitle.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

## 完整示例：与 ByLinkTitle 对照

示例沿用本章首页的[示例站点结构](/methods/pages/)：

```go-html-template {file="layouts/_default/list.html"}
按 Title：{{ range .Pages.ByTitle }}{{ .Title }} {{ end }}
按 LinkTitle：{{ range .Pages.ByLinkTitle }}{{ .LinkTitle }} {{ end }}
降序：{{ range .Pages.ByTitle.Reverse }}{{ .Title }} {{ end }}
```

Hugo 渲染为：

```html
按 Title：Alpha Post Bravo Post Charlie Post Delta Post 
按 LinkTitle：alpha bravo charlie delta 
降序：Delta Post Charlie Post Bravo Post Alpha Post 
```

**你应当看到什么**：`ByTitle` 输出的是**完整标题**；`ByLinkTitle` 输出短名；`Reverse` 把顺序整体倒过来（`Delta Post` 在前）。示例数据里两个升序列表顺序相同，换成 `title` 与 `linkTitle` 首字母不同的页面就会分叉。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有 `title` | 按 `title` 升序 | 否 |
| 页面没有 `title` 字段 | `.Title` 为空字符串，**排在最前**（实测输出里对应空的一格） | 否 |
| 大小写混排（`apple`、`Zebra`、`B 中文`） | 排序**不区分大小写**：`apple` 在 `B 中文`、`Zebra` 之前 | 否 |
| 中文标题（`中文页`、`阿标题`） | 按 Unicode 码位：`中文页` 在 `阿标题` 之前（**不是拼音序**，按拼音 `阿` 应在 `中` 之前） | 否 |
| 两个标题相同 | 顺序由内部实现决定，**上游未说明** | 否 |
| 空集合 | 空集合：`range` 无输出，`len` 为 0 | 否 |
| 返回类型 | `page.Pages` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 中文目录没有按拼音排 | 排序按 Unicode 码位（实测 `中文页` 在 `阿标题` 前） | 用 `weight` 手工排序，或自定义排序键 |
| 没报错但结果不对 | 显示的标题与列表顺序对不上 | 页面写了 `linkTitle`，显示的是它，排序的却是 `title` | 用 [`ByLinkTitle`](/methods/pages/bylinktitle/) |
| 没报错但结果不对 | 某页总是排最前，标题还是空的 | 该页没有 `title` 字段，`.Title` 为空字符串 | 补 `title`（或 `linkTitle`），别依赖文件名 |
| 报错看不懂 | `can't evaluate field ByTitle in type ...` | 对象不是页面集合 | 先取集合（`.Pages`、`.RegularPages`） |

更多排查入口见[故障排查](/troubleshooting/)。
