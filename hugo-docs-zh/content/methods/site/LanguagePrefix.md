+++
title = "LanguagePrefix"
linkTitle = "LanguagePrefix"
description = "返回给定站点的 URL 语言前缀（如果有）。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/methods/site/languageprefix/"

[params.functions_and_methods]
signatures = ["SITE.LanguagePrefix"]
returnType = "string"
+++

## 这一页解决什么问题

`LanguagePrefix` 返回**当前站点 URL 的语言前缀**：多语言项目里是 `/en`、`/de` 这样的片段，单语言项目或默认语言的根目录下是空字符串 `""`。

它是给「手工拼 URL」准备的——例如 URL 来自数据文件、或者你要把某个外部路径接在当前语言下。**站内页面之间的链接不该用它**：页面自己的 `.RelPermalink` 已经带好了语言前缀。

## 什么时候用，什么时候别用

**该用**：

- 要把一个不含语言前缀的路径转成当前语言的路径，例如 `{{ .Site.LanguagePrefix }}/contact/`；
- 需要在语言切换器里显示或比较各语言的前缀。

**别用**：

- 站内页面链接 → 用页面的 `.RelPermalink`，或 [`relLangURL`](/functions/urls/rellangurl/) / [`absLangURL`](/functions/urls/abslangurl/)；
- 想取语言代码 → 用 [`Site.Language`](/methods/site/language/)`.Name`（前缀是 URL 片段，不是语言标签）；
- 想当然地给结果补斜杠 → 实测返回值是 `/en` 这种**不带结尾斜杠**的片段；`""` 直接拼接会得到一个以 `/` 开头的路径，需要自己保证拼接正确。

## 用法

考虑如下项目配置：

```toml
defaultContentLanguage = 'de'
defaultContentLanguageInSubdir = false

[languages.de]
direction = 'ltr'
label = 'Deutsch'
locale = 'de-DE'
title = 'Projekt Dokumentation'
weight = 1

[languages.en]
direction = 'ltr'
label = 'English'
locale = 'en-US'
title = 'Project Documentation'
weight = 2
```

访问德语站点时：

```go-html-template
{{ .Site.LanguagePrefix }} → ""
```

访问英语站点时：

```go-html-template
{{ .Site.LanguagePrefix }} → /en
```

如果把 `defaultContentLanguageInSubdir` 改为 `true`，那么访问德语站点时：

```go-html-template
{{ .Site.LanguagePrefix }} → /de
```

`LanguagePrefix` 方法既可用于单语言项目，也可用于多语言项目。

## 完整示例（实测）

**单语言站点**（无 `[languages]`）里，把结果放进方括号以便看清空值：

```go-html-template {file="layouts/index.html"}
<p>[{{ .Site.LanguagePrefix }}]</p>
```

实测渲染为：

```html
<p>[]</p>
```

**多语言站点**（`defaultContentLanguageInSubdir = true`，语言 `de`（weight 1）与 `en`（weight 2），默认语言 `en`）里用同一模板：

| 产物路径 | 当前语言 | 实测输出 |
| --- | --- | --- |
| `/en/` | en（默认语言，且在子目录） | `<p>[/en]</p>` |
| `/de/` | de | `<p>[/de]</p>` |

**你应当看到什么**：前缀来自「当前站点在 URL 里所在的那一段」，而不是语言代码本身；默认语言若没被放进子目录，它的前缀是空字符串。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 单语言项目 | `""`（空字符串） | 否 |
| 多语言 + `defaultContentLanguageInSubdir = false` + 当前是默认语言 | `""` | 否 |
| 多语言 + 非默认语言 | 形如 `/en` 的前缀（无结尾斜杠） | 否 |
| 多语言 + `defaultContentLanguageInSubdir = true` | 默认语言也得到 `/de` 这类前缀 | 否 |
| 返回值类型 | `string` | 否 |
