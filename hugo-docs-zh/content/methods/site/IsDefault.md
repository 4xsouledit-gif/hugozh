+++
title = "IsDefault"
linkTitle = "IsDefault"
description = "报告给定站点在所有维度上是否为默认站点。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/site/isdefault/"

[params.functions_and_methods]
signatures = ["SITE.IsDefault"]
returnType = "bool"
+++

## 这一页解决什么问题

**（0.156.0 新增）**

当一个项目沿[语言](g)、[版本](g)、[角色](g)三个[维度](g)展开时，Hugo 会把内容构建成**多个站点**。每个站点都会执行你的模板——包括那些本该「整站只做一次」的事情（初始化变量、写入全局资源、登记需要去重的数据）。

`IsDefault` 回答的就是「我是不是那个唯一的默认站点」：它对**三个维度同时成立**的站点返回 `true`。实测一个 2 语言 × 3 版本 × 2 角色的项目会生成 12 个站点，其中只有 1 个 `IsDefault` 为 `true`。

## 什么时候用，什么时候别用

**该用**：

- 包住「每次构建只该跑一次」的初始化 partial（上游给出的正是这种用法）；
- 需要往全局作用域写数据、或以站点为单位做去重时。

**别用**：

- 想判断「当前页是不是首页」→ 用页面上的 `.IsHome`，这是完全不同的概念；
- 想区分开发/生产环境 → 用 [`hugo.IsDevelopment`](/functions/hugo/isdevelopment/) 或 [`hugo.Environment`](/functions/hugo/environment/)；
- 只想取某个维度的默认对象 → 用维度对象自己的 `.IsDefault`，例如 `.Site.Language.IsDefault`、[`Site.Version`](/methods/site/version/)`.`IsDefault`、[`Site.Role`](/methods/site/role/)`.`IsDefault`；
- 需要遍历所有站点 → 用 [`hugo.Sites`](/functions/hugo/sites/) / [`Site.Sites`](/methods/site/sites/)。

## 用法

`Site` 对象上的 `IsDefault` 方法报告给定站点在所有维度上是否为[默认站点](g)，这些维度包括[语言](g)、[版本](g)和[角色](g)。要确保某段代码在每次构建中只执行一次，无论你的[维度](g)生成了多少个[站点](g)，这个方法都很有用。

例如，下面的配置定义了一个横跨语言和版本两个维度的站点矩阵。

```toml
[languages.de]
contentDir = 'content/de'
direction = 'ltr'
label = 'Deutsch'
locale = 'de-DE'
title = 'Projekt Dokumentation'
weight = 1

[languages.en]
contentDir = 'content/en'
direction = 'ltr'
label = 'English'
locale = 'en-US'
title = 'Project Documentation'
weight = 2

[versions.'v1.0.0']
[versions.'v2.0.0']
[versions.'v3.0.0']
```

如果你调用一个初始化_局部模板_来处理一次性构建逻辑或全局变量设置，请用这个函数把该调用包在 [`if`][] 语句中。这样可以避免该逻辑在每个维度变体上都执行一次。

```go-html-template
{{ if .Site.IsDefault }}
  {{ partial "init.html" . }}
{{ end }}
```

在这种配置下，代码块只会为英语 v3.0.0 站点执行。选择英语是因为没有定义 [`defaultContentLanguage`][] 设置，英语因而成为[默认语言](g)。选择 v3.0.0 版本是因为没有定义 [`defaultContentVersion`][] 设置，v3.0.0 因而成为[默认版本](g)。

## 完整示例（实测）

我用一个 2 语言 × 3 版本 × 2 角色的项目实测（与上面的配置同构，省略 `contentDir` 以便两种语言共用同一份 `content/`，并设 `defaultContentLanguageInSubdir = true`；另加 `[roles.guest]`、`[roles.member]`）。在 home 模板里打印每个站点自己的判定：

```go-html-template {file="layouts/index.html"}
{{ .Site.Title }} / {{ .Site.Language.Name }} / {{ .Site.Version.Name }} / {{ .Site.Role.Name }}
IsDefault → {{ .Site.IsDefault }}
```

各站点产物（`public/` 下对应目录）实测结果：

| 产物路径 | 语言 / 版本 / 角色 | `.Site.IsDefault` |
| --- | --- | --- |
| `/en/` | en / v3.0.0 / guest | `true` |
| `/de/` | de / v3.0.0 / guest | `false` |
| `/v1.0.0/en/` | en / v1.0.0 / guest | `false` |
| `/member/en/` | en / v3.0.0 / member | `false` |
| `/member/v1.0.0/de/` | de / v1.0.0 / member | `false` |

同一次构建共生成 12 个站点（`len hugo.Sites` → 12），其中 `hugo.Sites.Default` 指向 `/en/`。

**你应当看到什么**：只有默认语言 × 默认版本 × 默认角色那一个站点是 `true`。把语言、版本或角色任意换掉一个，它立刻变成 `false`——这正是「三个维度同时默认」的含义。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 单语言、未配置 `[versions]` / `[roles]` 的项目 | `true`（唯一的站点就是默认站点） | 否 |
| 多语言项目中的默认语言站点 | `true`（版本、角色也须默认） | 否 |
| 非默认语言 / 非默认版本 / 非默认角色的站点 | `false` | 否 |
| 一次构建中 `true` 的站点数 | 恰好 1 个 | 否 |
| 返回值类型 | `bool` | 否 |

[`defaultContentLanguage`]: /configuration/all/#defaultcontentlanguage
[`defaultContentVersion`]: /configuration/all/#defaultcontentversion
[`if`]: /functions/go-template/if/
