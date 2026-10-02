+++
title = "RelRef"
linkTitle = "RelRef"
description = "返回具有给定路径、语言和输出格式的页面的相对 URL。"
date = 2026-10-02
weight = 670
source = "https://gohugo.io/methods/page/relref/"

[params.functions_and_methods]
signatures = ["PAGE.RelRef OPTIONS"]
returnType = "string"
+++

## 这一页解决什么问题

`.RelRef` 与 [`.Ref`](/methods/page/ref/) 完全同源：用**逻辑路径**解析目标页面，区别只在返回**相对 URL**（`/posts/post-1/`）。模板里写站内链接时，它比手写路径安全——目标页面被改名或删除时，构建会直接报错，而不是留下 404。

## 什么时候用，什么时候别用

**该用**：

- 模板里生成站内链接，特别是路径由变量拼出、或目标可能被挪动时；
- 需要按语言取对等页面（`lang` 选项）；
- 需要在链接上附加自定义属性/文案时先拿到 URL。

**别用**：

- 需要绝对 URL（RSS、`og:url`）→ 用 [`.Ref`](/methods/page/ref/)；
- 已经有目标页面的 `Page` 对象 → 直接用 [`.RelPermalink`](/methods/page/relpermalink/)；
- 在内容 Markdown 里做链接 → 用 [`ref`/`relref`](/shortcodes/relref/) 短代码（它们最终也走同一套解析）。

**选哪个**：

| 需求 | 用哪个 |
| --- | --- |
| 站内相对链接 | `.RelRef` |
| 绝对 URL | `.Ref` |
| 手上是 `Page` 对象 | `.RelPermalink` / `.Permalink` |
| Markdown 正文里写链接 | `relref` / `ref` 短代码 |

## 用法

`RelRef` 方法只接受一个参数：一个选项映射。

### 选项

`path`
: （`string`）目标页面的路径。不带前导斜杠（`/`）的路径会先相对于当前页面解析，再相对于站点的其余部分解析。

`lang`
: （`string`）目标页面的语言。默认为当前语言。可选。

`outputFormat`
: （`string`）目标页面的输出格式。默认为当前输出格式。可选。

### 示例

以下示例展示的是英文版站点上某个页面的渲染输出：

```go-html-template
{{ $opts := dict "path" "/books/book-1" }}
{{ .RelRef $opts }} → /en/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" }}
{{ .RelRef $opts }} → /de/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" "outputFormat" "json" }}
{{ .RelRef $opts }} → /de/books/book-1/index.json
```

### 错误处理

默认情况下，如果 Hugo 无法解析该路径，它会抛出错误并导致构建失败。你可以在项目配置中把它改为警告，并指定无法解析路径时要返回的 URL。

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```

## 完整示例：生成站内链接

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
<a href="{{ .RelRef (dict "path" "/posts/post-2") }}">相关阅读</a>
<a href="{{ .RelRef (dict "path" "/posts/post-1" "lang" "zh") }}">中文版</a>
```

在 `/posts/post-2/` 上实测（Hugo 0.167.0，`baseURL = 'https://example.org/'`）：

```html
<a href="/posts/post-2/">相关阅读</a>
<a href="/zh/posts/post-1/">中文版</a>
```

把同一次构建改成 `--baseURL 'https://example.org/docs/'` 后，实测输出为：

```html
<a href="/docs/posts/post-2/">相关阅读</a>
<a href="/docs/zh/posts/post-1/">中文版</a>
```

**你应当看到什么**：与 [`.RelPermalink`](/methods/page/relpermalink/) 一样，返回值会带上 `baseURL` 的子路径（`/docs`）与语言段（`/zh`），所以把站点搬进子目录、或多语言切换时都不需要改模板。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `path` 指向存在的页面 | 相对 URL（实测 `/posts/post-2/`） | 否 |
| `path` 不带前导斜杠 | 先相对当前页面解析（实测 `post-1` 命中 `/posts/post-1`，输出用其 slug URL） | 否 |
| `lang` 指向另一语言 | 返回该语言版本的相对 URL（实测 `/zh/posts/post-1/`） | 否 |
| `baseURL` 带子路径 | 结果包含子路径（实测 `/docs/posts/post-2/`） | 否 |
| `path` 不存在 | —— | 是：`REF_NOT_FOUND … page not found`，构建退出码 1；可用 `refLinksErrorLevel = 'warning'` 降级 |
| 返回类型 | `string`（相对 URL，以 `/` 开头） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
