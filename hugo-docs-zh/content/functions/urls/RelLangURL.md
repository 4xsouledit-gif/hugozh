+++
title = "urls.RelLangURL"
linkTitle = "RelLangURL"
description = "返回带语言前缀（如果有）的相对 URL。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/urls/rellangurl/"

[params.functions_and_methods]
signatures = ["urls.RelLangURL INPUT"]
returnType = "string"
aliases = ["relLangURL"]
+++

## 这一页解决什么问题

多语言站点里给 `<a href>`、样式、脚本、图片填地址时，既要跟随 `baseURL`，又不能丢掉当前语言的**语言前缀**。用 [`urls.RelURL`](/functions/urls/relurl/) 会漏掉前缀，读者一点就跳到默认语言版本；`urls.RelLangURL` 会把语言前缀补上。

## 什么时候用，什么时候别用

**该用**：

- 多语言站点的站内资源与站内链接（`href`、`src`）；
- 单语言站点也可用它（没有语言前缀时结果与 [`urls.RelURL`](/functions/urls/relurl/) 一致）。

**别用**：

- 需要完整地址（RSS、OG、结构化数据、邮件）→ 用 [`urls.AbsLangURL`](/functions/urls/abslangurl/)；
- 明确不需要语言前缀（全站共用资源）→ 用 [`urls.RelURL`](/functions/urls/relurl/)；
- 页面之间的链接 → 用 [`urls.RelRef`](/functions/urls/relref/) 或 [`urls.Ref`](/functions/urls/ref/)，它们会校验目标是否存在。

## 用法

单语言与多语言配置都可以使用该函数。返回的 URL 取决于：

- 输入是否以斜杠（`/`）开头
- 项目配置中的 `baseURL`
- 语言前缀（如果有）

下文示例使用这份项目配置：

```toml
defaultContentLanguage = 'en'
defaultContentLanguageInSubdir = true
[languages.en]
weight = 1
[languages.es]
weight = 2
```

### 输入不以斜杠开头

如果输入不以斜杠开头，结果 URL 相对于项目配置里的 `baseURL`。

以 `baseURL = https://example.org/` 渲染 `en` 站点时

```go-html-template
{{ relLangURL "" }}                         → /en/
{{ relLangURL "articles" }}                 → /en/articles
{{ relLangURL "style.css" }}                → /en/style.css
{{ relLangURL "https://example.org" }}      → https://example.org
{{ relLangURL "https://example.org/" }}     → /en
{{ relLangURL "https://www.example.org" }}  → https://www.example.org
{{ relLangURL "https://www.example.org/" }} → https://www.example.org/
```

以 `baseURL = https://example.org/docs/` 渲染 `en` 站点时

```go-html-template
{{ relLangURL "" }}                           → /docs/en/
{{ relLangURL "articles" }}                   → /docs/en/articles
{{ relLangURL "style.css" }}                  → /docs/en/style.css
{{ relLangURL "https://example.org" }}        → https://example.org
{{ relLangURL "https://example.org/" }}       → https://example.org/
{{ relLangURL "https://example.org/docs" }}   → https://example.org/docs
{{ relLangURL "https://example.org/docs/" }}  → /docs/en
{{ relLangURL "https://www.example.org" }}    → https://www.example.org
{{ relLangURL "https://www.example.org/" }}   → https://www.example.org/
```

### 输入以斜杠开头

如果输入以斜杠开头，结果 URL 相对于项目配置里 `baseURL` 的协议加主机部分。

以 `baseURL = https://example.org/` 渲染 `en` 站点时

```go-html-template
{{ relLangURL "/" }}          → /en/
{{ relLangURL "/articles" }}  → /en/articles
{{ relLangURL "/style.css" }} → /en/style.css
```

以 `baseURL = https://example.org/docs/` 渲染 `en` 站点时

```go-html-template
{{ relLangURL "/" }}          → /en/
{{ relLangURL "/articles" }}  → /en/articles
{{ relLangURL "/style.css" }} → /en/style.css
```

> [!NOTE]
> 正如上面的例子所示，带前导斜杠的写法很少是你想要的，而且可能导致意外的结果。几乎在所有情况下都应省略前导斜杠。

## 完整示例（实测）

```go-html-template {file="layouts/_partials/nav.html"}
[{{ relLangURL "" }}]|[{{ relLangURL "articles" }}]|[{{ relLangURL "/articles" }}]
```

Hugo 0.167.0 实测输出（渲染 `en` 站点），`baseURL = "https://example.org/"` 时：

```text
[/en/]|[/en/articles]|[/en/articles]
```

`baseURL = "https://example.org/docs/"` 时：

```text
[/docs/en/]|[/docs/en/articles]|[/en/articles]
```

**你应当看到什么**：前两项带上了 `/docs/en/`，**第三项只有 `/en/`**——前导斜杠让子路径 `/docs/` 被丢掉。另外上游表格里那条 `relLangURL "https://example.org/"`（`baseURL` 为根时）得 `/en`，看起来不像地址，正是上游提示「很少是你想要的」的原因。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；多语言配置 `defaultContentLanguage='en'`、`defaultContentLanguageInSubdir=true`，语言 `en`、`es`；渲染 `en` 站点。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `""` | `/en/`（`baseURL` 带子路径时为 `/docs/en/`） | 否 |
| `"articles"` | `/en/articles`（`/docs/en/articles`） | 否 |
| `"/articles"`（前导斜杠） | `/en/articles`——相对「协议 + 主机」，**丢掉** `/docs/` | 否 |
| `"https://example.org"` | `https://example.org` 原样返回 | 否 |
| `"https://example.org/"` | 根部署得 `/en`；子路径部署得 `https://example.org/` | 否 |
| `"https://www.example.org"`（别的子域） | 原样返回 | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 子路径部署后样式、图片 404 | 输入带前导斜杠，语言前缀与子路径的组合被破坏（实测丢 `/docs/`） | 省略前导斜杠 |
| 没报错但结果不对 | 切换语言后站内链接没变 | 用了 [`urls.RelURL`](/functions/urls/relurl/)，没有语言前缀 | 改用本函数 |
| 没报错但结果不对 | 站内链接变成完整域名 | 输入本身是完整地址，或与 `baseURL` 主机路径一致时被折叠 | 只传站内路径 |

更多排查入口见[故障排查](/troubleshooting/)。
