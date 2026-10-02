+++
title = "RelRef"
linkTitle = "RelRef"
description = "返回具有给定路径、语言和输出格式的页面的相对 URL。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/methods/shortcode/relref/"

[params.functions_and_methods]
signatures = ["SHORTCODE.RelRef OPTIONS"]
returnType = "string"
+++

## 这一页解决什么问题

`RelRef` 把「页面路径」解析成**根相对 URL**（如 `/posts/post-1/`），解析失败则让构建失败。它是**站内链接**的正确来源：相对路径在本地预览、子路径部署、更换域名时都不需要改动，而写错的路径会在构建时就被拦下。

与 [`Ref`](/methods/shortcode/ref/) 只差一点：`Ref` 给绝对 URL（带域名），`RelRef` 给相对 URL。**站内一律用 `RelRef`。**

## 什么时候用，什么时候别用

**该用**：

- 任何站内链接：导航、正文里的交叉引用、卡片、列表；
- 需要在构建阶段**校验**目标页面存在；
- 需要链接到**另一种输出格式**的同一页面（如 `.json`）。

**别用**：

- 站外链接 → 直接写 URL；
- 需要**绝对 URL**（RSS/Atom、结构化数据、邮件）→ 用 [`Ref`](/methods/shortcode/ref/) 或 [`Permalink`](/methods/resource/permalink/)；
- **在内容文件里**写站内链接：那里用 Markdown 链接，或 `relref` **短代码**（写法见下文），不必在模板里调方法；
- 指向资源文件（图片/附件）→ 用 [`RelPermalink`](/methods/resource/relpermalink/)。

## 用法

`RelRef` 方法需要单个参数：一个选项映射。

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
{{ .RelRef $opts }} → /en/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" }}
{{ .RelRef $opts }} → /de/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" "outputFormat" "json" }}
{{ .RelRef $opts }} → /de/books/book-1/index.json
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，**单语言**最小站点，目标页面 `content/posts/post-1.md` 存在。

模板 `layouts/_shortcodes/refs-demo.html`：

```go-html-template {file="layouts/_shortcodes/refs-demo.html"}
<a href="{{ .RelRef (dict "path" "/posts/post-1") }}">用绝对路径</a>
<a href="{{ .RelRef (dict "path" "posts/post-1") }}">用相对路径</a>
<a href="{{ .RelRef (dict "path" "posts/post-1.md") }}">带扩展名</a>
<a href="{{ .Ref (dict "path" "/posts/post-1") }}">对照：Ref</a>
```

内容 `content/about.md`：

```md {file="content/about.md"}
{{</* refs-demo */>}}
```

Hugo 渲染为（实测）：

```html
<a href="/posts/post-1/">用绝对路径</a>
<a href="/posts/post-1/">用相对路径</a>
<a href="/posts/post-1/">带扩展名</a>
<a href="https://example.org/posts/post-1/">对照：Ref</a>
```

**你应当看到什么**：四种写法都解析到了同一个页面——前三个 `href` 都是根相对的 `/posts/post-1/`，最后一个（`Ref`）带上了域名。单语言站点的路径里**没有**语言段（多语言站点会带上，如上游示例的 `/en/books/book-1/`）。

如果你在**内容文件**里而不是模板里写站内链接，用的是 `relref` 短代码（与本方法同名、同源）：

```md {file="content/about.md"}
[第一篇](/posts/post-1/)
见 {{</* relref "posts/post-1.md" */>}}
```

## 错误处理

默认情况下，如果 Hugo 无法解析路径，它会抛出错误并让构建失败。你可以在项目配置中把它改成警告，并指定无法解析路径时要返回的 URL。

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 存在的页面 | 根相对 URL（单语言实测 `/posts/post-1/`） | 否 |
| `path` 不以 `/` 开头 | 先相对当前页面解析（实测得到同一 URL） | 否 |
| `path` 带 `.md` 扩展名 | 同样能解析 | 否 |
| 页面不存在 | 记录 `REF_NOT_FOUND` | 是：构建失败（默认 `refLinksErrorLevel = 'error'`） |
| `lang` 指向不存在的语言 | 记录 `REF_NOT_FOUND: … no site found with lang "de"` | 是：构建失败 |
| `outputFormat` 指向未启用的格式 | 记录 `REF_NOT_FOUND: … output format "json"` | 是：构建失败 |
| 用 `try` 包住 | 接不住（属于站点构建错误） | 是：构建失败 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 站内链接带上了域名 | 用了 `Ref` | 站内改用 `RelRef` |
| 构建失败 | `REF_NOT_FOUND: … page not found` | 路径写错，或目标页面不参与构建 | 核对路径；检查 `draft` 与 `build` 选项 |
| 没报错但结果不对 | 多语言站点里链接跳到了错误语言 | 依赖默认 `lang` | 显式传 `dict "path" … "lang" …` |
| 没报错但结果不对 | 内容里写了 `{{</* relref */>}}` 却报短代码不存在 | 该站点/版本未启用 `relref` 短代码，或写法有误 | 用 Markdown 链接，或改在模板里用 `.RelRef` |

更多排查入口见[故障排查](/troubleshooting/)。
