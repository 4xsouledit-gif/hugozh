+++
title = "urls.AbsLangURL"
linkTitle = "AbsLangURL"
description = "返回带语言前缀（如果有）的绝对 URL。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/urls/abslangurl/"

[params.functions_and_methods]
signatures = ["urls.AbsLangURL INPUT"]
returnType = "string"
aliases = ["absLangURL"]
+++

## 这一页解决什么问题

多语言站点里需要完整地址的场合（RSS、Open Graph、结构化数据、邮件），地址还必须带上当前语言的**语言前缀**。用 [`urls.AbsURL`](/functions/urls/absurl/) 会漏掉前缀，读者点开就会被带到默认语言版本；`urls.AbsLangURL` 会按当前渲染的语言补上前缀。

## 什么时候用，什么时候别用

**该用**：

- 多语言站点的 RSS、OG、结构化数据、邮件模板；
- 单语言站点也可以放心使用（没有语言前缀时结果与 [`urls.AbsURL`](/functions/urls/absurl/) 同类，但统一写法更省心）。

**别用**：

- 站内相对地址 → 用 [`urls.RelLangURL`](/functions/urls/rellangurl/)；
- 明确不需要语言前缀（例如全站共用的静态资源）→ 用 [`urls.AbsURL`](/functions/urls/absurl/) 或 [`urls.RelURL`](/functions/urls/relurl/)；
- 页面之间的链接 → 用 [`urls.Ref`](/functions/urls/ref/)（它还能指定 `lang` 与 `outputFormat`）。

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

如果输入不以斜杠开头，结果 URL 中的路径相对于项目配置里的 `baseURL`。

以 `baseURL = https://example.org/` 渲染 `en` 站点时

```go-html-template
{{ absLangURL "" }}           → https://example.org/en/
{{ absLangURL "articles" }}   → https://example.org/en/articles
{{ absLangURL "style.css" }}  → https://example.org/en/style.css
```

以 `baseURL = https://example.org/docs/` 渲染 `en` 站点时

```go-html-template
{{ absLangURL "" }}           → https://example.org/docs/en/
{{ absLangURL "articles" }}   → https://example.org/docs/en/articles
{{ absLangURL "style.css" }}  → https://example.org/docs/en/style.css
```

### 输入以斜杠开头

如果输入以斜杠开头，结果 URL 中的路径相对于项目配置里 `baseURL` 的协议加主机部分。

以 `baseURL = https://example.org/` 渲染 `en` 站点时

```go-html-template
{{ absLangURL "/" }}          → https://example.org/en/
{{ absLangURL "/articles" }}  → https://example.org/en/articles
{{ absLangURL "/style.css" }} → https://example.org/en/style.css
```

以 `baseURL = https://example.org/docs/` 渲染 `en` 站点时

```go-html-template
{{ absLangURL "/" }}          → https://example.org/en/
{{ absLangURL "/articles" }}  → https://example.org/en/articles
{{ absLangURL "/style.css" }} → https://example.org/en/style.css
```

> [!NOTE]
> 正如上面的例子所示，带前导斜杠的写法很少是你想要的，而且可能导致意外的结果。几乎在所有情况下都应省略前导斜杠。

## 完整示例（实测）

```go-html-template {file="layouts/_partials/feed-link.html"}
[{{ absLangURL "" }}]|[{{ absLangURL "articles" }}]|[{{ absLangURL "/articles" }}]
```

Hugo 0.167.0 实测输出（项目配置同上，渲染 `en` 站点），`baseURL = "https://example.org/"` 时：

```text
[https://example.org/en/]|[https://example.org/en/articles]|[https://example.org/en/articles]
```

`baseURL = "https://example.org/docs/"` 时：

```text
[https://example.org/docs/en/]|[https://example.org/docs/en/articles]|[https://example.org/en/articles]
```

**你应当看到什么**：语言前缀 `/en/` 始终存在；但与 [`urls.AbsURL`](/functions/urls/absurl/) 一样，**带前导斜杠的第三项丢掉了 `/docs/`**，退回到「协议 + 主机 + 语言前缀」。子路径部署时这一项会 404。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；多语言配置 `defaultContentLanguage='en'`、`defaultContentLanguageInSubdir=true`，语言 `en`、`es`；渲染 `en` 站点。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `""` | `baseURL` + 语言前缀（实测为 `https://example.org/en/`） | 否 |
| `"articles"` | `https://example.org/en/articles` | 否 |
| `"/articles"` | `https://example.org/en/articles`；`baseURL` 为 `/docs/` 时是 `https://example.org/en/articles`，**丢掉** `/docs/` | 否 |
| `"/"` | `https://example.org/en/` | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | RSS 里的链接指向默认语言 | 用了 [`urls.AbsURL`](/functions/urls/absurl/)，它不加语言前缀 | 改用本函数 |
| 没报错但结果不对 | 子路径部署后前导斜杠那项 404 | 输入带前导斜杠，丢掉了站点子路径（实测） | 省略前导斜杠 |
| 没报错但结果不对 | 语言前缀没出现 | `defaultContentLanguageInSubdir` 为 `false`，默认语言本来就不带前缀 | 按需在配置里打开该选项，或接受默认语言无前缀的结果 |

更多排查入口见[故障排查](/troubleshooting/)。
