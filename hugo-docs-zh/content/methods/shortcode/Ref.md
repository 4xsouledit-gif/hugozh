+++
title = "Ref"
linkTitle = "Ref"
description = "返回具有给定路径、语言和输出格式的页面的绝对 URL。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/shortcode/ref/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Ref OPTIONS"]
returnType = "string"
+++

## 这一页解决什么问题

`Ref` 在**构建时**把「页面路径」解析成**绝对 URL**，解析失败就让构建失败。它同时解决两件事：

1. **拿到完整地址**（带协议与域名），供 feed、结构化数据、邮件模板等站外场景使用；
2. **顺带校验链接**——路径写错不再是线上 404，而是构建时报错，改完才能发布。

这与直接写 `<a href="/books/book-1/">` 的区别正在于第 2 点：手写路径没有任何校验。

## 什么时候用，什么时候别用

**该用**：

- 需要**绝对 URL**：RSS/Atom、JSON-LD、`og:` 元数据、邮件；
- 需要在构建阶段**验证**「这个页面路径真的存在」；
- 需要引用**其他语言**或**其他输出格式**的页面 URL。

**别用**：

- 站内 `<a href>` / `<img src>` → 用 [`RelRef`](/methods/shortcode/relref/)（相对 URL），本站所有站内链接都应是根相对的；
- 目标是**外部网址** → 直接把 URL 写进模板/内容；
- 目标是资源文件（图片、附件）而不是页面 → 用 [`RelPermalink`](/methods/resource/relpermalink/) / [`Permalink`](/methods/resource/permalink/)；
- 想在**内容文件**里写站内链接 → 直接写 Markdown 链接或 `ref`/`relref` 短代码，不必绕到模板方法。

## 用法

`Ref` 方法需要单个参数：一个选项映射。

## 选项

`path`
: （`string`）目标页面的路径。不以斜杠（`/`）开头的路径先相对于当前页面解析，再相对于站点的其余部分解析。

`lang`
: （`string`）目标页面的语言。默认是当前语言。可选。

`outputFormat`
: （`string`）目标页面的输出格式。默认是当前输出格式。可选。

## 示例

下面的示例展示了站点英文版本中某个页面的渲染输出：

```go-html-template
{{ $opts := dict "path" "/books/book-1" }}
{{ .Ref $opts }} → https://example.org/en/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" }}
{{ .Ref $opts }} → https://example.org/de/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" "outputFormat" "json" }}
{{ .Ref $opts }} → https://example.org/de/books/book-1/index.json
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，**单语言**最小站点（`baseURL = 'https://example.org/'`），目标页面 `content/posts/post-1.md` 存在。

```go-html-template {file="layouts/_shortcodes/refs-demo.html"}
<p>Ref：{{ .Ref (dict "path" "/posts/post-1") }}</p>
<p>RelRef：{{ .RelRef (dict "path" "/posts/post-1") }}</p>
<p>RelRef 用相对路径：{{ .RelRef (dict "path" "posts/post-1") }}</p>
<p>RelRef 带扩展名：{{ .RelRef (dict "path" "posts/post-1.md") }}</p>
```

```md {file="content/about.md"}
{{</* refs-demo */>}}
```

Hugo 渲染为（实测）：

```html
<p>Ref：https://example.org/posts/post-1/</p>
<p>RelRef：/posts/post-1/</p>
<p>RelRef 用相对路径：/posts/post-1/</p>
<p>RelRef 带扩展名：/posts/post-1/</p>
```

**你应当看到什么**：

- `Ref` 给出**绝对 URL**（`https://example.org/…`），`RelRef` 给出根相对路径——这是两者唯一稳定的差别；
- `path` 写成 `posts/post-1`（不以斜杠开头）或 `posts/post-1.md`（带扩展名）都能解析到同一页；单语言站点里路径**不带**语言段。

## 错误处理

默认情况下，如果 Hugo 无法解析路径，它会抛出错误并让构建失败。你可以在项目配置中把它改成警告，并指定无法解析路径时要返回的 URL。

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```

实测三种失败情形（本站在单语言站点上运行，短代码调用位于 `content/sc-lab.md`）：

```text
{{ .Ref (dict "path" "/no-such-page") }}
→ ERROR [en] REF_NOT_FOUND: Ref "/no-such-page": "…\content\sc-lab.md:67:1": page not found

{{ .Ref (dict "path" "/posts/post-1" "lang" "de") }}
→ ERROR [en] REF_NOT_FOUND: Ref "/posts/post-1": no site found with lang "de"

{{ .Ref (dict "path" "/posts/post-1" "outputFormat" "json") }}
→ ERROR [en] REF_NOT_FOUND: Ref "/posts/post-1" from page "/sc-lab": output format "json"
```

三种情况都会让构建以非零码退出。注意它们**不是模板运行时错误**：`try` 接不住，必须在配置里改成 `warning`，或修正路径。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 存在的页面，绝对路径 | 绝对 URL（单语言实测 `https://example.org/posts/post-1/`） | 否 |
| `path` 不以 `/` 开头 | 先相对当前页面解析（实测 `posts/post-1` 得到同一 URL） | 否 |
| `path` 带 `.md` 扩展名 | 同样能解析 | 否 |
| 页面不存在 | 记录 `REF_NOT_FOUND` | 是：构建失败（默认 `refLinksErrorLevel = 'error'`） |
| `lang` 指向不存在的语言 | 记录 `REF_NOT_FOUND: … no site found with lang "de"` | 是：构建失败 |
| `outputFormat` 指向未启用的格式 | 记录 `REF_NOT_FOUND: … output format "json"` | 是：构建失败 |
| 用 `try` 包住 | **接不住**（错误由站点构建记录，不在返回值里） | 是：构建失败 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建失败 | `REF_NOT_FOUND: … page not found` | 路径写错，或页面被 `draft`/`build` 选项排除 | 核对路径；确认目标页面会参与构建 |
| 构建失败 | `no site found with lang "de"` | 站点没有该语言 | 去掉 `lang`，或在配置中启用该语言 |
| 构建失败 | `output format "json"` | 目标页面没有该输出格式 | 在配置里为目标页面启用，或去掉 `outputFormat` |
| 没报错但结果不对 | 站内链接变成带域名的绝对地址 | 站内引用也用了 `Ref` | 站内用 `RelRef` |
| 报错看不懂 | `try` 明明包住了却仍失败 | 这是构建期记录的站点错误，不是模板错误 | 改配置 `refLinksErrorLevel = 'warning'`，或修路径 |

更多排查入口见[故障排查](/troubleshooting/)。
