+++
title = "Title"
linkTitle = "Title"
description = "返回项目配置中定义的标题。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/methods/site/title/"

[params.functions_and_methods]
signatures = ["SITE.Title"]
returnType = "string"
+++

## 这一页解决什么问题

`Title` 返回配置里 `title` 的值，也就是**站点名**。它最常见的用途是 `base` 模板的 `<title>`：站点名与页面标题拼接，例如 `页面标题 | 站点名`；页头 logo 旁的文字、RSS 的 `<title>` 也用它。

它是站点级字段，与页面标题（页面上的 `.Title` / `.LinkTitle`）不是一回事——两者经常一起出现，别混用。

## 什么时候用，什么时候别用

**该用**：

- `<title>`、Open Graph 的 `og:site_name`、feed 标题；
- 需要在站点名与页面标题之间做拼接或分隔时。

**别用**：

- 想取当前页面的标题 → 用页面的 `.Title` / `.LinkTitle`（见 [methods/page](/methods/page/)）；
- 想给每个页面加固定后缀而不改页面标题 → 在模板里拼，不要在内容里手写；
- 多语言站点想只维护一份标题 → `title` 属于各语言自己的配置，实测两种语言可以（也应当）各写一份（`en` → `Project Documentation`，`de` → `Projekt Dokumentation`）。

## 用法

项目配置：

```toml
title = 'My Documentation Site'
```

模板：

```go-html-template
{{ .Site.Title }} → My Documentation Site
```

## 完整示例（实测）

配置 `title = 'My Documentation Site'`，`base` 模板中的典型写法：

```go-html-template {file="layouts/_default/baseof.html"}
<title>{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} | {{ .Site.Title }}{{ end }}</title>
```

首页渲染为：

```html
<title>My Documentation Site</title>
```

一个标题为 `Jamaica Inn` 的页面渲染为：

```html
<title>Jamaica Inn | My Documentation Site</title>
```

**你应当看到什么**：首页不带后缀（`if .IsHome` 分支），其它页面是「页面标题 | 站点名」。`{{ with .Site.Title }}` 在未配置标题时**不会**渲染——这时 `<title>` 会退化成空，所以公共主题里通常还要给一个兜底值。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 配置了 `title` | 原样返回该字符串 | 否 |
| 未配置 `title` | 空字符串（`with` / `if` 判为假） | 否 |
| 多语言项目 | 返回**当前站点**语言的 `title`（实测 en → `Project Documentation`，de → `Projekt Dokumentation`） | 否 |
| 内容里含 `&`、`<` 等字符 | 在 HTML 模板中按上下文自动转义 | 否 |
| 返回类型 | `string` | 否 |
