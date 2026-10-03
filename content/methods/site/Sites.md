+++
title = "Sites"
linkTitle = "Sites"
description = "返回所有维度的所有站点组成的集合。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/methods/site/sites/"

[params.functions_and_methods]
signatures = ["SITE.Sites"]
returnType = "page.Sites"
+++

## 这一页解决什么问题

**（0.156.0 起弃用）**

请改用 [`hugo.Sites`](/functions/hugo/sites/) 函数。

`Sites` 返回**项目中所有站点**的集合：语言 × 版本 × 角色三个[维度](g)的每一种组合都是一个站点。它是做「语言/版本切换器」时遍历全部站点、并找到默认站点（`.Default`）的入口。

**上游未说明替代方法之外的其他细节**：上游页面只给出上面这一句替代说明；替代函数 `hugo.Sites` 的行为见 [functions/hugo/sites](/functions/hugo/sites/)。

## 什么时候用，什么时候别用

**该用**：

- 用 [`hugo.Sites`](/functions/hugo/sites/) 遍历所有站点、生成语言或版本文档的切换器；
- 需要「默认站点」时用 `hugo.Sites.Default`（它是语言、版本、角色三者都默认的那个站点）。

**别用**：

- `.Site.Sites`：0.156.0 起弃用，新模板请写 `hugo.Sites`；
- 只想取当前站点的语言/版本/角色 → 用 [`Site.Language`](/methods/site/language/)、[`Site.Version`](/methods/site/version/)、[`Site.Role`](/methods/site/role/)；
- 想判断「当前是不是默认站点」→ 用 [`Site.IsDefault`](/methods/site/isdefault/)。

## 完整示例（实测）

配置：2 种语言（`de` weight 1、`en` weight 2，`defaultContentLanguage = 'en'`、`defaultContentLanguageInSubdir = true`）、3 个版本（`v1.0.0`、`v2.0.0`、`v3.0.0`）、2 个角色（`guest`、`member`）。

在 home 模板里渲染上游风格的切换器：

```go-html-template {file="layouts/index.html"}
<ul>
  {{ range hugo.Sites }}
    <li><a href="{{ .Home.RelPermalink }}">{{ .Title }} {{ .Version.Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染为（共 12 个站点；此处照录，`range` 的空白已省略）：

```html
<ul>
  <li><a href="/de/">Projekt Dokumentation v3.0.0</a></li>
  <li><a href="/member/de/">Projekt Dokumentation v3.0.0</a></li>
  <li><a href="/v2.0.0/de/">Projekt Dokumentation v2.0.0</a></li>
  <li><a href="/member/v2.0.0/de/">Projekt Dokumentation v2.0.0</a></li>
  <li><a href="/v1.0.0/de/">Projekt Dokumentation v1.0.0</a></li>
  <li><a href="/member/v1.0.0/de/">Projekt Dokumentation v1.0.0</a></li>
  <li><a href="/en/">Project Documentation v3.0.0</a></li>
  <li><a href="/member/en/">Project Documentation v3.0.0</a></li>
  <li><a href="/v2.0.0/en/">Project Documentation v2.0.0</a></li>
  <li><a href="/member/v2.0.0/en/">Project Documentation v2.0.0</a></li>
  <li><a href="/v1.0.0/en/">Project Documentation v1.0.0</a></li>
  <li><a href="/member/v1.0.0/en/">Project Documentation v1.0.0</a></li>
</ul>
```

默认站点：`{{ with hugo.Sites.Default }}{{ .Title }} / {{ .Language.Name }} / {{ .Version.Name }} / {{ .Role.Name }}{{ end }}` → `Project Documentation / en / v3.0.0 / guest`。

**你应当看到什么**：德语站点排在前面（语言 `weight` 1 < 2），同语言内按版本从高到低；`.Site.Sites` 与 `hugo.Sites` 在实测中得到相同的 12 项，但前者已弃用。默认站点是 `en`（配置的 `defaultContentLanguage`）× `v3.0.0`（默认版本）× `guest`（默认角色），与它在集合中的位置无关。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；分别测量单语言无维度站点与 2×3×2 矩阵站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 单语言、无 `[versions]` / `[roles]` 的项目 | 集合长度为 1 | 否 |
| 2 语言 × 3 版本 × 2 角色的项目 | 集合长度为 12，与 `hugo.Sites` 一致 | 否 |
| `.Site.Sites`（弃用写法） | 实测仍可用，内容与 `hugo.Sites` 相同 | 否 |
| `hugo.Sites.Default` | 默认语言 × 默认版本 × 默认角色的那个站点 | 否 |
| 站点集合是否为空 | 至少含当前站点，不会为空 | 否 |
| `printf "%T" .Site.Sites` | `page.Sites` | 否 |
