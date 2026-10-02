+++
title = "Rotate"
linkTitle = "Rotate"
description = "返回沿指定维度变化、而在其他维度上与当前页面取值相同的一组页面（含当前页面），并按该维度的默认排序顺序排列。"
date = 2026-10-02
weight = 720
source = "https://gohugo.io/methods/page/rotate/"

[params.functions_and_methods]
signatures = ["PAGE.Rotate DIMENSION"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

多语言站点的语言切换器、多版本文档的版本切换器，都需要「**当前这一页在别的语言/版本/角色下的对应页面**」。逐个语言去 `site.GetPage` 拼路径很繁琐，`.Rotate` 一步到位：给定维度（`language`、`version`、`role`），返回沿着这个维度展开的一组页面，**且其他维度保持不变**。

结果**包含当前页面自己**（实测如此），所以渲染切换器时通常要判断 `.Language.Lang` 是否等于当前语言，从而标出「当前项」。

## 什么时候用，什么时候别用

**该用**：

- 语言切换器：`{{ range .Rotate "language" }}`；
- 多版本文档的版本切换器（`"version"`）、多角色（`"role"`）内容。

**别用**：

- 只想列出所有语言（不管版本/角色）→ 用 `hugo.Sites` 或 [`.Translations`](/methods/page/translations/)（`Translations` 会**排除当前语言**，正好互补）；
- 只要「这一页有没有其他语言版本」→ 用 [`.IsTranslated`](/methods/page/istranslated/) 更直接；
- 维度名写错 → 会直接报错（见下）。

**`.Rotate` 与 `.Translations` 的差别（实测）**：

| 方法 | 是否含当前页面 | 维度 |
| --- | --- | --- |
| `.Rotate "language"` | **含**（实测 `/posts/post-2/` 返回 `en`、`zh` 两项） | language / version / role |
| [`.Translations`](/methods/page/translations/) | **不含**（同页返回 `zh` 一项） | 仅语言 |

## 用法

**（0.153.0 新增）**

页面对象上的 rotate 方法返回沿指定[维度](g)变化的一组页面，其他维度保持不变。结果包含当前页面，并按指定维度的规则排序。例如，沿[语言](g)旋转会返回所有与当前页面共享同一[版本](g)和[角色](g)的语言变体。

`DIMENSION` 参数必须是 `language`、`version` 或 `role` 之一。

### 排序顺序

用以下规则来理解 Hugo 如何对 `Rotate` 方法返回的集合排序。

| 维度 | 主排序 | 次排序 |
| :--- | :--- | :--- |
| Language | 权重升序 | 字典序升序 |
| Version | 权重升序 | 语义化版本降序 |
| Role | 权重升序 | 字典序升序 |

### 示例

要渲染当前页面各语言变体的列表（含当前页面），且这些变体共享当前版本和角色：

```go-html-template
{{/* Returns languages sorted by weight ascending, then lexicographically ascending */}}
{{ range .Rotate "language" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要渲染当前页面各版本变体的列表（含当前页面），且这些变体共享当前语言和角色：

```go-html-template
{{/* Returns versions sorted by weight ascending, then semantic version descending */}}
{{ range .Rotate "version" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要渲染当前页面各角色变体的列表（含当前页面），且这些变体共享当前语言和版本：

```go-html-template
{{/* Returns roles sorted by weight ascending, then lexicographically ascending */}}
{{ range .Rotate "role" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：语言切换器

测试站有两个语言（`en` 权重 1、`zh` 权重 2），`/posts/post-2/` 有对应的 `/zh/posts/post-2/`，而 `/docs/ref/` 只有英文。

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
<ul class="lang-switcher">
  {{ range .Rotate "language" }}
    <li{{ if eq .Language.Lang $.Language.Lang }} class="current"{{ end }}>
      <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
    </li>
  {{ end }}
</ul>
```

实测（Hugo 0.167.0）：

| 渲染的页面 | `range .Rotate "language"` 得到 |
| --- | --- |
| `/posts/post-2/` | `en` → `/posts/post-2/`、`zh` → `/posts/post-2/` |
| `/zh/posts/post-2/` | 同上两项（顺序按语言 weight） |
| `/docs/ref/`（没有中文版） | 只有 `en` → `/docs/ref/` 一项 |

**你应当看到什么**：结果里**包含当前页面**，所以切换器里会出现「当前语言」那一项；没有对应翻译的页面只返回自己一项（不是空集合）。要排除当前项，用 `{{ if ne .Language.Lang $.Language.Lang }}` 过滤。`version`/`role` 维度需要在项目配置里定义版本/角色，本站未配置，故不列实测输出。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `"language"`，页面有翻译 | 所有语言变体（含当前页），按语言 weight 升序（实测 2 项） | 否 |
| `"language"`，页面没有翻译 | 只含当前页面一项（实测 `/docs/ref/`） | 否 |
| `"version"` / `"role"` | 上游说明可用；需要配置相应维度，本站未配置 | 否 |
| 维度名拼错（如 `"bogus"`） | —— | 是：`error calling Rotate: failed to parse dimension "bogus": unknown dimension "bogus"`，构建退出码 1 |
| 不传参数 | —— | 是：`wrong number of args for Rotate: want 1 got 0` |
| 返回类型 | `page.Pages`（可 `range`，可再 `where`） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
