+++
title = "Dimension"
linkTitle = "Dimension"
description = "返回给定站点中指定维度的维度对象。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/site/dimension/"

[params.functions_and_methods]
signatures = ["SITE.Dimension DIMENSION"]
returnType = "page.SiteDimension"
+++

## 这一页解决什么问题

**（0.153.0 新增）**

Hugo 0.153 起，一个项目可以沿三个[维度](g)展开成多个站点：语言（language）、版本（version）、角色（role）。`Dimension` 是**按名字取维度对象**的统一入口——它不产生新信息，只是让「维度名」可以来自变量。

什么时候需要它：你要写一个 partial，让调用方传 `"language"` / `"version"` / `"role"` 中的一个；或者要写遍历三种维度、输出同一套信息的主题代码。固定只用一个维度时，直接写 `.Site.Language` 更清楚。

## 什么时候用，什么时候别用

**该用**：

- 维度名是运行时才知道的（partial 参数、数据文件驱动）；
- 需要把三个维度一视同仁地处理（例如统一取 `.Name` 与 `.IsDefault`）。

**别用**：

- 只取某个固定维度 → 直接用 [`Site.Language`](/methods/site/language/)、[`Site.Version`](/methods/site/version/)、[`Site.Role`](/methods/site/role/)，意图更明确、也不会因拼错名字构建失败；
- 想判断「是不是默认站点」→ 用 [`Site.IsDefault`](/methods/site/isdefault/)（它同时看三个维度）；
- 想遍历所有站点 → 用 [`hugo.Sites`](/functions/hugo/sites/)。

## 用法

`Site` 对象上的 `Dimension` 方法返回给定[维度](g)的维度对象。

`DIMENSION` 参数必须是 `language`、`version` 或 `role` 之一。

示例|返回值|等价于
:--|:--|:--
`{{ .Site.Dimension "language" }}`|`langs.Language`|`{{ .Site.Language }}`
`{{ .Site.Dimension "version" }}`|`version.Version`|`{{ .Site.Version }}`
`{{ .Site.Dimension "role" }}`|`roles.Role`|`{{ .Site.Role }}`

```go-html-template
{{ $languageObject := .Site.Dimension "language" }}
{{ $languageObject.IsDefault }} → true
{{ $languageObject.Name }} → en

{{ $versionObject := .Site.Dimension "version" }}
{{ $versionObject.IsDefault }} → true
{{ $versionObject.Name }} → v1.0.0

{{ $roleObject := .Site.Dimension "role" }}
{{ $roleObject.IsDefault }} → true
{{ $roleObject.Name }} → guest
```

## 完整示例（实测）

最小站点里配置语言与版本（`[languages]` 与 `[versions]` 见 [配置 versions](/configuration/versions/)）：

```toml
defaultContentLanguage = 'en'
defaultContentLanguageInSubdir = true

[languages.de]
label = 'Deutsch'
locale = 'de-DE'
weight = 1

[languages.en]
label = 'English'
locale = 'en-US'
weight = 2

[versions.'v1.0.0']
[versions.'v2.0.0']
[versions.'v3.0.0']
```

home 模板：

```go-html-template {file="layouts/index.html"}
{{ $d := "language" }}
{{ with .Site.Dimension $d }}
  <p>维度 {{ .Name }}，locale {{ .Locale }}，默认：{{ .IsDefault }}</p>
{{ end }}
<p>版本：{{ (.Site.Dimension "version").Name }}</p>
<p>角色：{{ (.Site.Dimension "role").Name }}</p>
```

在默认站点（en + v3.0.0 + guest）渲染为：

```html
<p>维度 en，locale en-US，默认：true</p>
<p>版本：v3.0.0</p>
<p>角色：guest</p>
```

**你应当看到什么**：`.Name` 是配置键的小写形式（`en`、`v3.0.0`、`guest`），`.IsDefault` 为 `true`。在德语站点（`/de/`）同一模板输出 `维度 de，locale de-DE，默认：false`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；一个只配语言（de/en）的站点与一个配了 `[versions]`、`[roles]` 的站点分别测。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `"language"` | 语言对象：`.Name`、`.Locale`、`.Label`、`.Direction`、`.IsDefault` 可用 | 否 |
| `"version"` | 版本对象：`.Name`、`.IsDefault` 可用 | 否 |
| `"role"` | 角色对象：`.Name`、`.IsDefault` 可用 | 否 |
| 项目未定义 `[versions]` | 仍返回默认版本对象，实测 `Name` → `v1.0.0`、`IsDefault` → `true` | 否 |
| 项目未定义 `[roles]` | 仍返回默认角色对象，实测 `Name` → `guest`、`IsDefault` → `true` | 否 |
| 传其它字符串（如 `"bogus"`） | —— | 是：`error calling Dimension: unknown dimension "bogus"` |
| 传入非字符串（如 `1`） | —— | 是：`executing "index.html" at <1>: expected string; found 1` |
