+++
title = "Sites"
linkTitle = "Sites"
description = "返回所有维度的所有站点组成的集合。"
date = 2026-10-02
weight = 780
source = "https://gohugo.io/methods/page/sites/"

[params.functions_and_methods]
signatures = ["PAGE.Sites"]
returnType = "page.Sites"
+++

## 这一页解决什么问题

`.Sites` 用来列出**所有语言（以及所有维度）的站点**——做全局语言切换器、统计各语言页面数、生成跨语言链接时会用到。它返回的是一个站点集合，每个元素都是一个完整的 `Site` 对象。

**但它已经弃用了**：从 Hugo v0.156.0 起，`.Sites`（以及 `.Site.Sites`）被标记为弃用，替代品是全局函数 [`hugo.Sites`](/functions/hugo/sites/)。新代码请直接用 `hugo.Sites`。

## 什么时候用，什么时候别用

**该用**：

- ——新代码没有理由用它，直接用 [`hugo.Sites`](/functions/hugo/sites/)（返回内容相同）；
- 维护旧主题时，可以暂时保留 `.Sites`，但构建时会看到弃用警告。

**别用**：

- 想知道「当前页面有哪些翻译」→ 用 [`.Translations`](/methods/page/translations/) 或 [`.Rotate "language"`](/methods/page/rotate/)；
- 想拿当前语言的站点对象 → 用 [`.Site`](/methods/page/site/)；
- 想遍历所有语言站点 → 用 `hugo.Sites`。

**对照（实测）**：

```go-html-template
{{/* 旧写法：会产生弃用警告 */}}
{{ range .Sites }}{{ .Language.Lang }} {{ end }}

{{/* 新写法：推荐 */}}
{{ range hugo.Sites }}{{ .Language.Lang }} {{ end }}
```

两者实测结果都为 `en zh`（本站有两种语言）。

## 用法

**（0.156.0 起弃用）**

请改用 [`hugo.Sites`](/functions/hugo/sites/) 函数。

## 完整示例：迁移到 hugo.Sites

模板（`layouts/index.html`）：

```go-html-template {file="layouts/index.html"}
<ul class="site-switcher">
  {{ range hugo.Sites }}
    <li><a href="{{ .Home.RelPermalink }}">{{ .Title }}（{{ .Language.Lang }}）</a></li>
  {{ end }}
</ul>
```

实测（Hugo 0.167.0，站点有两种语言 `en`、`zh`）：

```html
<ul class="site-switcher">
  <li><a href="/">MP EN（en）</a></li>
  <li><a href="/zh/">MP ZH（zh）</a></li>
</ul>
```

`range .Sites` 的实测结果与上面一致（`en`、`zh`），但构建时会输出这条警告：

```text
WARN  deprecated: .Site.Sites and .Page.Sites was deprecated in Hugo v0.156.0 and will be removed in a future release. Use hugo.Sites instead.
```

**你应当看到什么**：功能没坏，只是多了一条警告。把 `.Sites` 换成 `hugo.Sites` 后警告消失、结果不变——这是最省事的迁移方式（一处替换，无需改参数）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 单语言站点 | 只含一个站点 | 否 |
| 多语言站点 | 每个语言一个站点（实测 `en`、`zh`） | 否 |
| 使用 `.Sites` | 有值，但输出弃用警告 | 否（仅警告） |
| 使用 `hugo.Sites` | 结果相同且无警告 | 否 |
| 元素类型 | `Site` 对象（可用 `.Title`、`.Home`、`.Language.Lang` 等） | 否 |
| 返回类型 | `page.Sites`（弃用签名） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
