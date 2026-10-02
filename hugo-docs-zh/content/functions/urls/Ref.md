+++
title = "urls.Ref"
linkTitle = "Ref"
description = "返回具有给定路径、语言与输出格式的页面的绝对 URL。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/urls/ref/"

[params.functions_and_methods]
returnType = "string"
aliases = ["ref"]
+++

## 这一页解决什么问题

要在模板里给出指向**站内某个页面**的完整地址，又不想把域名和语言前缀写死。`ref` 接受「当前上下文 + 目标路径」，由 Hugo 查出目标页面的真实地址。它的额外好处是**会校验目标是否存在**：路径写错时直接让构建失败，而不是悄悄产出一个 404 链接。

它还是指定「跨语言」「跨输出格式」时最直接的写法。

## 什么时候用，什么时候别用

**该用**：

- 模板里生成指向站内页面的完整地址；
- 目标页面可能来自另一种语言，或需要指定输出格式（如页面另有 JSON 输出）。

**别用**：

- 站内相对地址（`<a href>` 用路径即可）→ 用 [`urls.RelRef`](/functions/urls/relref/)；
- 已知固定路径、不需要校验、也不涉及语言 → 用 [`urls.AbsURL`](/functions/urls/absurl/) 更轻；
- 内容 Markdown 里写站内链接 → 用 `ref`/`relref` 短代码或[链接渲染钩子](/render-hooks/links/)，不要在内容里调用模板函数；
- 站外链接 → 直接写完整地址。

## 用法

`ref` 函数接受两个参数：

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
{{ ref . "/books/book-1" }} → https://example.org/en/books/book-1/

{{ $opts := dict "path" "/books/book-1" }}
{{ ref . $opts }} → https://example.org/en/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" }}
{{ ref . $opts }} → https://example.org/de/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" "outputFormat" "json" }}
{{ ref . $opts }} → https://example.org/de/books/book-1/index.json
```

### 错误处理

默认情况下，如果 Hugo 无法解析该路径，就会抛出错误并导致构建失败。你可以在项目配置中把它改成警告，并指定一个路径无法解析时返回的 URL。

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```

## 完整示例（实测）

测量站点：`baseURL = "https://example.org/"`，`defaultContentLanguage='en'`、`defaultContentLanguageInSubdir=true`，语言 `en`、`es`，内容含 `content/books/book-1.md` 与对应的 `book-1.es.md`。

```go-html-template {file="layouts/_partials/ref-demo.html"}
[{{ ref . "/books/book-1" }}]
[{{ ref . (dict "path" "/books/book-1") }}]
[{{ ref . (dict "path" "/books/book-1" "lang" "es") }}]
```

Hugo 0.167.0 实测输出：

```text
[https://example.org/en/books/book-1/]
[https://example.org/en/books/book-1/]
[https://example.org/es/books/book-1/]
```

**你应当看到什么**：前两项结果相同（路径写法与选项写法等价）；第三项带上了 `es` 语言前缀——即使当前渲染的是 `en` 站点，`lang` 选项也能指向另一语言的页面。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；配置同上。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 目标存在（实测 `ref . "/books/book-1"`） | `https://example.org/en/books/book-1/` | 否 |
| 指定 `lang`（实测 `dict "path" … "lang" "es"`） | `https://example.org/es/books/book-1/` | 否 |
| 目标不存在（实测 `ref . "/nope/missing"`） | —— | **是，构建失败**，报错原文：`ERROR [en] REF_NOT_FOUND: Ref "/nope/missing" from page "/": page not found`，随后 `error building site: logged 1 error(s)` |
| 配了 `refLinksErrorLevel = 'warning'` | 上游说明可降级为警告并返回 `refLinksNotFoundURL`；**未实测** | 上游未给出实测输出 |
| `outputFormat` 选项 | 上游示例给出 `…/index.json`；**未实测**（需要为页面配置额外输出格式） | 上游未给出实测输出 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `REF_NOT_FOUND`，整站构建失败 | 路径写错、页面不存在、或路径没写对（如漏了前导斜杠又不在当前页面附近） | 对照 `content/` 下的真实路径；确需容忍缺失时用 `refLinksErrorLevel` 降级 |
| 没报错但结果不对 | 链接指向了错误的语言 | 没写 `lang`，默认跟随当前语言 | 明确需要跨语言时传 `lang` |
| 没报错但结果不对 | 地址少了语言前缀 | 站点的 `defaultContentLanguageInSubdir` 为 `false`，默认语言本就不带前缀 | 这是配置行为，不是函数错误；需要统一带前缀就打开该选项 |
| 报错看不懂 | 在内容 Markdown 里写了 `{{ ref ... }}` | 内容不是模板 | 内容里用 `ref`/`relref` 短代码，模板里才用函数 |

更多排查入口见[故障排查](/troubleshooting/)。
