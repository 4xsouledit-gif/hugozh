+++
title = "relref"
linkTitle = "relref"
description = "用 relref 短代码插入相对永久链接：与 ref 的唯一差别、必须用 Markdown 记法的原因、参数表与报错处理。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/shortcodes/relref/"

[params.teach]
difficulty = "入门"
time = "8 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0）。",
  "读过 [ref](/shortcodes/ref/)——本页只讲差别，其余规则完全相同。",
]
outcomes = [
  "说出 `ref` 与 `relref` 输出地址的唯一差别，并判断自己的场景该用哪一个；",
  "用 `relref` 写出站内链接，并在产物里核对它确实是根相对地址；",
  "知道什么时候 `relref` 反而不合适（需要绝对地址的场合，例如 RSS 与外部引用）。",
]
next = ["/shortcodes/ref/", "/render-hooks/links/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `relref` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

> [!NOTE]
> 在 Markdown 内容中，这个短代码已经过时。要正确解析 Markdown 的链接目标地址，请改用[内置链接渲染钩子][]，或自行编写。
>
> 在默认配置下，Hugo 对多语言单主机（multilingual single-host）项目会自动使用内置链接渲染钩子，前提是[共享页面资源复制][]功能处于禁用状态，这也是此类项目的默认行为。如果项目、模块或主题定义了自定义链接渲染钩子，则会改用这些钩子。
>
> 也可以配置 Hugo 始终（`always`）使用内置链接渲染钩子、仅作兜底（`fallback`），或从不（`never`）使用，详见[内置链接渲染钩子][]。

## 这一页解决什么问题

站内互链最怕写死域名：`https://example.org/posts/my-post/` 这种地址一旦站点换域名、或者要在本地预览与生产环境之间来回切换，就得全站替换。

`relref` 短代码把「路径」交给 Hugo 去查，但输出**不含站点地址的根相对地址**（relative permalink），例如 `/posts/my-post/`。页面搬到哪个域名下都能用，这也正是它与 [ref](/shortcodes/ref/) 的唯一差别。

## 用法

`relref` 短代码接受单个位置参数（路径），或者一个或多个命名参数，见下表。

## 参数

`path`
: （`string`）目标页面的路径。不以斜杠（`/`）开头的路径先相对当前页面解析，再相对站点其余部分解析。

`lang`
: （`string`）目标页面的语言。默认为当前语言。可选。

`outputFormat`
: （`string`）目标页面的输出格式。默认为当前输出格式。可选。

## 示例

`relref` 短代码的典型用途是为 Markdown 链接提供目标地址。

> [!NOTE]
> 调用这个短代码时，务必使用 [Markdown 写法][]。

下面的例子给出站点英文版页面上的渲染结果：

```md
[Link A]({{%/* relref "/books/book-1" */%}})

[Link B]({{%/* relref path="/books/book-1" */%}})

[Link C]({{%/* relref path="/books/book-1" lang="de" */%}})

[Link D]({{%/* relref path="/books/book-1" lang="de" outputFormat="json" */%}})
```

渲染结果：

```html
<a href="/en/books/book-1/">Link A</a>

<a href="/en/books/book-1/">Link B</a>

<a href="/de/books/book-1/">Link C</a>

<a href="/de/books/book-1/index.json">Link D</a>
```

地址里没有 `https://example.org`——这就是 `relref`。

### 为什么必须用 Markdown 记法

与 `ref` 同理：`relref` 的输出要落在 Markdown 链接的**目标地址位置**上，而目标地址由 Markdown 渲染器解析，所以短代码必须在 Markdown 渲染**之前**完成，也就是用 `%` 定界符。

**实测（Hugo 0.167）**：`[Link]({{%/* relref "/books/book-1" */%}})` 渲染为 `<a href="/books/book-1/">Link</a>`；改用标准记法时 `href` 解析为空。短代码单独成行时两种记法都能用，但 Markdown 记法的输出会被渲染器自动包成链接，标准记法输出纯文本。

## ref 与 relref 的差别

两个短代码接受的参数完全相同，解析路径的方式也相同，区别只在输出的地址形式：`ref` 输出包含站点地址的永久链接（permanent link），`relref` 输出相对于站点根目录的地址（relative permalink）。前者适合需要绝对地址的场合，例如站点摘要或外部引用；后者不写死域名，便于在测试环境与生产环境之间迁移。

实测（Hugo 0.167）同一个路径的输出对照：

| 调用 | 输出 |
| --- | --- |
| `{{</* ref "/books/book-1" */>}}` | `https://example.org/en/books/book-1/` |
| `{{</* relref "/books/book-1" */>}}` | `/en/books/book-1/` |

> [!TIP]
> **怎么选**：正文里给人点的站内链接用 `relref`（换域名不用改）；要放进 **RSS、sitemap、邮件、第三方摘要**这类离开本站的上下文，用 `ref`——那里的地址必须是绝对地址。

## 错误处理

默认情况下，Hugo 无法解析路径时会抛出错误并让构建失败。可以在项目配置中改为警告，并指定无法解析路径时返回的地址：

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```

`relref` 与 `ref` 共用这两个配置项。**实测（Hugo 0.167）**：把 `refLinksErrorLevel` 设为 `'warning'` 并设置 `refLinksNotFoundURL` 后，路径不存在时构建只打印

```text
WARN [en] REF_NOT_FOUND: Ref "/books/nope": "…/content/example.md:26:1": page not found
```

并把地址替换成 `refLinksNotFoundURL` 的值；警告里的 `文件:行:列` 直接指向出问题的调用。只改级别而不设 `refLinksNotFoundURL` 会产生空 `href`，**构建是绿的但链接全废**，生产环境建议保留默认的 `ERROR`。

## 什么时候用，什么时候别用

**该用**：

- 正文里的站内互链，希望地址与域名解耦；
- 本地开发、预览环境与生产环境共用同一份内容；
- 需要链接到另一个语言版本（`lang`）或非 HTML 输出格式（`outputFormat`）。

**别用**：

- 地址需要**绝对**形式（RSS、sitemap、站外分发）→ 用 [ref](/shortcodes/ref/)；
- Markdown 内容里的普通链接 → 优先用[链接渲染钩子](/render-hooks/links/)；
- 链接站外地址 → `relref` 只管站内路径。

## 验证方法

1. 在内容里写一次调用：

   ```md {file="content/example.md"}
   参见 [另一篇文章]({{%/* relref "/posts/my-post" */%}})。
   ```

2. 构建并查看产物：

   ```bash
   hugo
   ```

3. 打开 `public/example/index.html`，搜索 `my-post`。

**你应当看到什么**：`<a href="/posts/my-post/">另一篇文章</a>`——**以 `/` 开头、没有域名**。

- 如果 `href` 里带了 `https://…`，说明你用的是 `ref`；
- 如果 `href` 为空，检查是不是用了标准记法，或路径写错；
- 如果构建失败并提示 `REF_NOT_FOUND`，按报错里的 `文件:行:列` 去改路径。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 链接点不动，`href=""` | 用标准记法调用，且短代码嵌在 Markdown 链接的目标地址里 | 改用 Markdown 记法（`%` 定界符） |
| 没报错但结果不对 | RSS 或第三方摘要里的链接打不开 | 那里需要绝对地址，`relref` 给的是根相对地址 | 在这些场合改用 [ref](/shortcodes/ref/) |
| 没报错但结果不对 | 本地预览正常、部署后 404 | 站点部署在子路径下，而根相对地址是按 `baseURL` 的路径前缀生成的 | 确认 `baseURL` 与实际部署路径一致 |
| 报错看不懂 | `REF_NOT_FOUND` | 路径不存在；不以 `/` 开头的路径先相对当前页面解析，容易基准不对 | 用根相对路径（以 `/` 开头）最稳妥 |
| 报错看不懂 | 警告里出现你没想到的语言（如 `[de]`） | `lang` 指向的语言里没有该页面或其输出格式 | 确认目标语言里确实有这一页 |
| 报错看不懂 | 构建成功但线上是旧链接 | 改了 URL 结构却没重新构建，或部署了旧的 `public/` | 重新构建并检查部署目录 |

更多排查入口见[故障排查](/troubleshooting/)。

[Markdown 写法]: /shortcodes/
[内置链接渲染钩子]: /render-hooks/
[共享页面资源复制]: /content-management/page-resources/
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/relref.html
