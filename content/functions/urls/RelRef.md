+++
title = "urls.RelRef"
linkTitle = "RelRef"
description = "返回具有给定路径、语言与输出格式的页面的相对 URL。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/urls/relref/"

[params.functions_and_methods]
returnType = "string"
aliases = ["relref"]
+++

## 这一页解决什么问题

要在模板里给出指向站内页面的**相对地址**（`/en/books/book-1/` 这种，不带域名）。与 [`urls.Ref`](/functions/urls/ref/) 一样，它会查出目标页面的真实地址、支持跨语言与跨输出格式，并且**在目标不存在时让构建失败**——写错的链接不会溜到线上。

## 什么时候用，什么时候别用

**该用**：

- 模板里生成 `<a href>`，且希望地址不带域名；
- 需要校验目标页面是否存在，或需要指定 `lang`、`outputFormat`。

**别用**：

- 需要完整地址（RSS、OG、结构化数据）→ 用 [`urls.Ref`](/functions/urls/ref/) 或 [`urls.AbsURL`](/functions/urls/absurl/)；
- 只想给静态资源（CSS、图片）填地址 → 用 [`urls.RelURL`](/functions/urls/relurl/)（多语言用 [`urls.RelLangURL`](/functions/urls/rellangurl/)）：它们不要求目标是一个页面；
- 内容 Markdown 里的站内链接 → 用 `ref`/`relref` 短代码或[链接渲染钩子](/render-hooks/links/)。

## 用法

`relref` 函数接受两个参数：

1. 用于解析相对路径的上下文（通常是当前页面）。
1. 目标页面的路径，或一个选项映射（见下文）。

### 选项

`path`
: （`string`）目标页面的路径。不以斜杠（`/`）开头的路径会先相对于当前页面解析，再相对于站点其余部分解析。

`lang`
: （`string`）目标页面的语言。默认为当前语言。可选项。

`outputFormat`
: （`string`）目标页面的输出格式。默认为当前输出格式。可选项。

### 示例

下面的示例展示英语版站点上某个页面的渲染输出：

```go-html-template
{{ relref . "/books/book-1" }} → /en/books/book-1/

{{ $opts := dict "path" "/books/book-1" }}
{{ relref . $opts }} → /en/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" }}
{{ relref . $opts }} → /de/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" "outputFormat" "json" }}
{{ relref . $opts }} → /de/books/book-1/index.json
```

### 错误处理

默认情况下，如果 Hugo 无法解析该路径，就会抛出错误并导致构建失败。你可以在项目配置中把它改成警告，并指定一个路径无法解析时返回的 URL。

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```

## 完整示例（实测）

测量站点：`baseURL = "https://example.org/"`，`defaultContentLanguage='en'`、`defaultContentLanguageInSubdir=true`，语言 `en`、`es`，内容含 `content/books/book-1.md` 与对应的 `book-1.es.md`。

```go-html-template {file="layouts/_partials/relref-demo.html"}
[{{ relref . "/books/book-1" }}]
[{{ relref . (dict "path" "/books/book-1" "lang" "es") }}]
```

Hugo 0.167.0 实测输出：

```text
[/en/books/book-1/]
[/es/books/book-1/]
```

**你应当看到什么**：地址不带域名（这是它相对 [`urls.Ref`](/functions/urls/ref/) 的唯一区别），`lang` 选项同样生效：第二行指向了 `es` 的对应页面。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；配置同上。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 目标存在（实测 `relref . "/books/book-1"`） | `/en/books/book-1/` | 否 |
| 指定 `lang`（实测 `dict "path" … "lang" "es"`） | `/es/books/book-1/` | 否 |
| 目标不存在 | —— | **是，构建失败**：与 [`urls.Ref`](/functions/urls/ref/) 相同，报 `REF_NOT_FOUND: Ref "…" from page "…": page not found` |
| 配了 `refLinksErrorLevel = 'warning'` | 上游说明可降级为警告并返回 `refLinksNotFoundURL`；**未实测** | 上游未给出实测输出 |
| `outputFormat` 选项 | 上游示例给出 `/de/books/book-1/index.json`；**未实测** | 上游未给出实测输出 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `REF_NOT_FOUND`，整站构建失败 | 路径写错或页面不存在 | 对照 `content/` 真实路径；需要容忍缺失就用 `refLinksErrorLevel` 降级 |
| 没报错但结果不对 | 语言前缀不对 | 没写 `lang`，默认跟随当前语言 | 跨语言时显式传 `lang` |
| 报错看不懂 | 给 CSS/图片用了 `relref` 导致构建失败 | `relref` 只解析**页面**，静态资源不是页面 | 静态资源用 [`urls.RelURL`](/functions/urls/relurl/) |
| 报错看不懂 | 在内容 Markdown 里写了 `{{ relref ... }}` | 内容不是模板 | 内容里用 `relref` 短代码 |

更多排查入口见[故障排查](/troubleshooting/)。
