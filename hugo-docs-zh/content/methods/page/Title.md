+++
title = "Title"
linkTitle = "Title"
description = "返回给定页面的标题。"
date = 2026-10-02
weight = 830
source = "https://gohugo.io/methods/page/title/"

[params.functions_and_methods]
signatures = ["PAGE.Title"]
returnType = "string"
+++

## 这一页解决什么问题

`.Title` 返回页面标题，用于 `<h1>`、`<title>`、列表项文字。它和 [`.LinkTitle`](/methods/page/linktitle/) 的区别是：`.LinkTitle` 优先取 front matter 里的 `linkTitle`（没有才回退到 `title`），适合导航这种「空间有限」的位置；`.Title` 永远取 `title`。

第二个要点：**不是所有页面都有 front matter**。taxonomy、term 这类由 Hugo 生成的页面**没有** `_index.md`，`.Title` 由 Hugo 按规则推导（首字母大写、复数化等）。

## 什么时候用，什么时候别用

**该用**：

- `<h1>`、页面标题、`<title>` 标签；
- 列表里显示完整标题。

**别用**：

- 导航菜单/列表项（希望短一些）→ 用 [`.LinkTitle`](/methods/page/linktitle/)；
- 想要 URL 友好的名字 → 用 [`.Slug`](/methods/page/slug/) 或 [`urlize`](/functions/urls/urlize/)；
- 想要文件名 → 用 [`.File`](/methods/page/file/)。

**`.Title` 与 `.LinkTitle` 的取舍**：本站 `content/posts/post-1.md` 只写了 `title = "第一篇"`，两者的值相同。若同时写 `linkTitle = "一"`，导航里就会用「一」。列表用 `.LinkTitle`、详情页标题用 `.Title` 是最省事的做法。

## 用法

对于由文件支撑的页面，`Title` 方法返回前置元数据中定义的 `title` 字段：

```toml
title = 'About us'
```

```go-html-template
{{ .Title }} → About us
```

当页面不是由文件支撑时，`Title` 方法返回的值取决于页面的[类型](g)。

页面类型|页面不是由文件支撑时的页面标题
:--|:--
home|站点标题
section|section 名称（首字母大写并复数化）
taxonomy|分类法名称（首字母大写）
term|术语名称（首字母大写）

你可以在项目配置中禁用自动首字母大写与复数化：

```toml
capitalizeListTitles = false
pluralizeListTitles = false
```

你可以在项目配置中把首字母大写风格改为 `ap`、`chicago`、`go`、`firstupper` 或 `none` 之一。例如：

```toml
titleCaseStyle = "firstupper"
```

详见[说明][]。

## 完整示例：有文件支撑与没有文件支撑的页面

测试站结构：`/tags/` 是分类法（由 `tags` 生成，没有 `_index.md`），`/tags/alpha/` 是术语页（同样没有文件）。

模板（`layouts/_default/list.html` 与 `single.html` 共用）：

```go-html-template
<h1>{{ .Title }}</h1>
```

实测（Hugo 0.167.0）：

| 渲染的页面 | kind | `.Title` | 来源 |
| --- | --- | --- | --- |
| `/posts/post-2/` | page | `第二篇` | front matter |
| `/posts/` | section | `文章` | front matter 的 `_index.md` |
| `/` | home | `MP 首页` | front matter 的 `_index.md` |
| `/tags/` | taxonomy | `Tags` | 由分类法名推导（首字母大写） |
| `/tags/alpha/` | term | `Alpha` | 由术语名推导（首字母大写） |

**你应当看到什么**：前三个页面都有 `title` 字段，原样返回；后两个页面**没有**对应的内容文件，Hugo 把 `tags` 变成 `Tags`、把 `alpha` 变成 `Alpha`——推导规则由 `capitalizeListTitles`、`pluralizeListTitles`、`titleCaseStyle` 控制。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有 front matter `title` | 原样返回（实测 `第二篇`、`文章`、`MP 首页`） | 否 |
| taxonomy 页（无文件） | 分类法名首字母大写（实测 `Tags`） | 否 |
| term 页（无文件） | 术语名首字母大写（实测 `Alpha`） | 否 |
| 有 front matter 但没写 `title` | 回退到自动推导规则（上游表格） | 否 |
| 关闭 `capitalizeListTitles` / `pluralizeListTitles` | 按配置改变推导结果（上游说明） | 否 |
| 返回类型 | `string` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[details]: /configuration/all/#title-case-style
