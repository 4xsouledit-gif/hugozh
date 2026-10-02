+++
title = "ref"
linkTitle = "ref"
description = "用 ref 短代码插入指向指定页面的永久链接：路径解析规则、必须用 Markdown 记法的原因、参数表与报错处理。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/shortcodes/ref/"

[params.teach]
difficulty = "入门"
time = "10 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0），站内有至少两个页面可以互链。",
  "读过[短代码](/shortcodes/)里「两种记法」一节，知道 Markdown 记法与标准记法的区别。",
]
outcomes = [
  "写出指向站内页面的 `ref` 调用，并说清它输出的是绝对地址还是相对地址；",
  "判断什么时候必须用 Markdown 记法调用（放进 Markdown 链接里时），并知道用错会出什么现象；",
  "配置 `refLinksErrorLevel` / `refLinksNotFoundURL`，让找不到页面时的行为符合你的发布流程。",
]
next = ["/shortcodes/relref/", "/render-hooks/links/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `ref` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

> [!NOTE]
> 在 Markdown 内容中，这个短代码已经过时。要正确解析 Markdown 的链接目标地址，请改用[内置链接渲染钩子][]，或自行编写。
>
> 在默认配置下，Hugo 对多语言单主机（multilingual single-host）项目会自动使用内置链接渲染钩子，前提是[共享页面资源复制][]功能处于禁用状态，这也是此类项目的默认行为。如果项目、模块或主题定义了自定义链接渲染钩子，则会改用这些钩子。
>
> 也可以配置 Hugo 始终（`always`）使用内置链接渲染钩子、仅作兜底（`fallback`），或从不（`never`）使用，详见[内置链接渲染钩子][]。

## 这一页解决什么问题

正文里要链接到另一篇内容，直接写 `/posts/my-post/` 行不行？在这个站点里行得通，但一旦改了 URL 结构、换了 `baseURL`、或者做多语言，这个写死的地址就静默失效了——**Markdown 不会告诉你链接坏了**。

`ref` 短代码把「路径」交给 Hugo 去查：你写内容文件在站内的逻辑路径，Hugo 在构建时把它解析成**包含站点地址的永久链接（permanent link）**。地址写错时 Hugo 会报错（可配置成警告），而不是安静地生成一个死链。

要的是「不含域名、便于迁移的相对地址」时，用 [relref](/shortcodes/relref/)，两者参数与解析规则完全相同。

## 用法

`ref` 短代码接受单个位置参数（路径），或者一个或多个命名参数，见下表。

## 参数

`path`
: （`string`）目标页面的路径。不以斜杠（`/`）开头的路径先相对当前页面解析，再相对站点其余部分解析。也可以直接写带扩展名的文件名，例如 `book-1.md`（实测可用）。

`lang`
: （`string`）目标页面的语言。默认为当前语言。可选。

`outputFormat`
: （`string`）目标页面的输出格式。默认为当前输出格式。可选。

## 示例

`ref` 短代码的典型用途是为 Markdown 链接提供目标地址。

> [!NOTE]
> 调用这个短代码时，务必使用 [Markdown 写法][]。

下面的例子给出站点英文版页面上的渲染结果：

```md
[Link A]({{%/* ref "/books/book-1" */%}})

[Link B]({{%/* ref path="/books/book-1" */%}})

[Link C]({{%/* ref path="/books/book-1" lang="de" */%}})

[Link D]({{%/* ref path="/books/book-1" lang="de" outputFormat="json" */%}})
```

渲染结果：

```html
<a href="https://example.org/en/books/book-1/">Link A</a>

<a href="https://example.org/en/books/book-1/">Link B</a>

<a href="https://example.org/de/books/book-1/">Link C</a>

<a href="https://example.org/de/books/book-1/index.json">Link D</a>
```

### 为什么必须用 Markdown 记法

上面那条 `[Markdown 写法][]` 的提醒不是格式洁癖，而是**能不能解析出链接的硬条件**：`ref` 的输出要落在 Markdown 链接的**目标地址位置**上，而目标地址是 Markdown 渲染器负责解析的，所以短代码必须在 Markdown 渲染**之前**就把地址填进去。

**实测（Hugo 0.167，单语言站点）** 在同一段内容里对比几种写法，结果如下：

> 对照阅读请注意**测量条件不同**：上面「渲染结果」取自上游的多语言示例站点，地址带默认语言前缀 `/en/`；下表实测跑在**单语言**站点上，因此没有语言前缀。两者验证的都是「这种写法能否解析出链接」，与地址前缀无关。

| 写法 | 渲染结果 |
| --- | --- |
| `[Link A]({{%/* ref "/books/book-1" */%}})` | `<a href="https://example.org/books/book-1/">Link A</a>`（正常） |
| `[Link B]({{</* ref "/books/book-1" */>}})` | `href` 为空（解析失败） |
| `[Link D]({{%/* relref "/books/book-1" */%}})` | `<a href="/books/book-1/">Link D</a>`（正常，相对地址） |

- 用 Markdown 记法（A、D）→ 链接正常；
- 用标准记法（B）→ `href` 解析为空，因为地址是 Markdown 渲染完之后才填进去的，渲染器已经错过它了；
- 短代码**单独成行**时（不在链接里），两种记法都能用。但结果略有差别：Markdown 记法的输出会被 Markdown 渲染器当成裸网址，自动包成链接；标准记法输出的是纯文本。

## 错误处理

默认情况下，Hugo 无法解析路径时会抛出错误并让构建失败。可以在项目配置中改为警告，并指定无法解析路径时返回的地址：

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```

两个配置项的行为要分清：

| 配置 | 默认值 | 作用 |
| --- | --- | --- |
| `refLinksErrorLevel` | `ERROR` | 找不到目标页面时的日志级别；`ERROR` 会让**构建失败**，改成 `warning` 则只打印警告 |
| `refLinksNotFoundURL` | 未设置 | 解析失败时用来替换的地址 |

**实测（Hugo 0.167，`refLinksErrorLevel = 'warning'` 且设置了 `refLinksNotFoundURL`）**：

| 情况 | 构建输出 | 页面上的地址 |
| --- | --- | --- |
| 路径不存在（`/books/nope`） | `WARN [en] REF_NOT_FOUND: Ref "/books/nope": "…/content/_index.en.md:26:1": page not found` | 替换成 `refLinksNotFoundURL` 的值 |
| `outputFormat` 在当前语言下不存在（如只要 HTML 输出却写 `outputFormat="json"`） | `WARN [de] REF_NOT_FOUND: Ref "/books/book-1" from page "/": output format "json"` | 同样替换成 `refLinksNotFoundURL` 的值 |

两个警告都带 `文件:行:列`，可以直接定位到出问题的调用。

> [!WARNING]
> 只把 `refLinksErrorLevel` 改成 `warning`、却不设 `refLinksNotFoundURL`，会产生**空 `href`**（`<a href="">`）——构建是绿的，链接全废。生产环境更推荐保留默认的 `ERROR`，让坏链接在构建时就暴露。

## 什么时候用，什么时候别用

**该用**：

- 正文里做站内互链，又想避免写死地址；
- 链接目标需要跨语言（`lang`）或指向非 HTML 输出格式（`outputFormat`）；
- 用 `refLinksErrorLevel = 'ERROR'`（默认）当作「链接检查器」，让坏路径在构建时失败。

**别用**：

- Markdown 内容里的普通链接 → 优先用[链接渲染钩子](/render-hooks/links/)：它同样解析 Markdown 目标地址，而且不需要在链接里嵌短代码（本页开头的提示正是这个意思）；
- 链接到**站外**地址 → 直接写 Markdown 链接，`ref` 只管站内路径；
- 想要的是不含域名的地址 → 用 [relref](/shortcodes/relref/)；
- 目标页面当前构建中不存在（草稿、未来日期、被 `build.render` 关掉）→ `ref` 会解析失败，先确认那页真的会被渲染。

## 验证方法

1. 在内容里写一次调用，把它放进 Markdown 链接：

   ```md {file="content/example.md"}
   参见 [另一篇文章]({{%/* ref "/posts/my-post" */%}})。
   ```

2. 构建：

   ```bash
   hugo
   ```

3. 打开 `public/example/index.html`，搜索 `my-post`。

**你应当看到什么**：`<a href="https://你的域名/posts/my-post/">另一篇文章</a>`——地址里带域名（这是 `ref` 与 `relref` 的唯一区别）。

- 如果 `href` 是空的 → 检查是不是用了标准记法，或页面路径写错了；
- 如果构建直接失败并提示 `REF_NOT_FOUND` → 说明这个路径确实不存在，按报错里的 `文件:行:列` 去改；
- 如果产物里还有短代码定界符的字样 → 定界符被转义了，或这段内容没被渲染。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 链接点不动，`href=""` | 用标准记法调用，且短代码嵌在 Markdown 链接的目标地址里 | 改用 Markdown 记法（`%` 定界符） |
| 没报错但结果不对 | `href` 整段不见了 | 同上，或目标页面不会被渲染（草稿、未来日期、被 `build.render` 关掉） | 确认该页确实会被构建出来 |
| 报错看不懂 | `REF_NOT_FOUND` | 路径在站点里不存在；路径是相对当前页面解析的，可能基准不对 | 用根相对路径（以 `/` 开头）最稳妥；多语言站点确认 `lang` |
| 报错看不懂 | 警告里出现你没想到的语言（如 `[de]`） | `lang` 指向的语言没有该页面或其输出格式 | 确认目标语言里确实有这一页 |
| 报错看不懂 | 构建成功，但线上链接 404 | 改了 URL 结构却没重新构建，或部署了旧的 `public/` | 重新构建并检查部署目录 |

更多排查入口见[故障排查](/troubleshooting/)。

[Markdown 写法]: /shortcodes/
[内置链接渲染钩子]: /render-hooks/
[共享页面资源复制]: /content-management/page-resources/
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/ref.html
