+++
title = "transform.Markdownify"
linkTitle = "Markdownify"
description = "返回渲染为 HTML 后的给定 Markdown。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/transform/markdownify/"

[params.functions_and_methods]
signatures = ["transform.Markdownify INPUT"]
returnType = "template.HTML"
aliases = ["markdownify"]

[[params.examples]]
id    = "transform/markdownify-inline"
title = "渲染 front matter 里的 Markdown"
note  = "本站配置 `markup.goldmark.renderer.unsafe = true`。"
+++

## 这一页解决什么问题

页面标题、描述、自定义 front matter 字段里经常夹着 Markdown（例如 `**加粗**`、链接）。这些字段是**字符串**，Hugo 不会主动把它们当 Markdown 渲染——直接输出就会在页面上看到字面的 `**加粗**` 和方括号链接。`markdownify` 把这样的字符串按站点的 Markdown 配置渲染成 HTML，返回值被标记为安全 HTML，可以直接放进页面。

它与「渲染页面正文」不是一回事：正文用 `.Content`（Hugo 已按完整管线渲染好），`markdownify` 处理的是零散字符串。

```go-html-template
<h2>{{ .Title | markdownify }}</h2>
```

如果生成的 HTML 只有一个段落，Hugo 会去掉包裹的 `p` 标签，按上面示例的需要输出行内 HTML。

要为单个段落保留包裹的 `p` 标签，请使用 `Page` 对象上的 [`RenderString`][] 方法，并把 `display` 选项设为 `block`。

> [!NOTE]
> 尽管 `markdownify` 函数在把 Markdown 渲染为 HTML 时会遵循 [Markdown 渲染钩子][]，但如果有渲染钩子需要访问 `.Page` 上下文，请改用 `RenderString` 方法而不是 `markdownify`。详见 issue [#9692][]。

## 什么时候用，什么时候别用

**该用**：

- front matter 字段（`.Title`、`.Params.description`、`.Params.subtitle` 等）里写了 Markdown，需要在模板里渲染；
- 字符串来自数据文件、短代码参数或模板拼接，又想复用站点的 Markdown 配置与渲染钩子。

**别用**：

- 渲染页面正文 → 用 `.Content`（已按完整管线渲染，且带页面上下文）；
- 渲染钩子需要访问 `.Page` 上下文 → 用 `Page` 的 [`RenderString`](/methods/page/renderstring/) 方法，而不是 `markdownify`（见上方提示与 issue [#9692][]）；
- 想为单个段落保留外层 `p` 标签 → 同样用 `RenderString` 并把 `display` 设为 `block`（见上方说明）；
- 想得到纯文本（去掉所有标签）→ 用 [`transform.Plainify`](/functions/transform/plainify/)。

## 完整示例：渲染 front matter 里的 Markdown

下面三段是本站构建时**真实执行**的结果（模板文件在 `layouts/partials/examples/transform/markdownify-inline.html`）：

{{< examples >}}

**你应当看到什么**：第一段外层只有 `<div>`，`p` 被去掉了（单段落规则）；第二段是多段落，`p` 被保留；第三段是纯文本，照原样输出。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），`markup.goldmark.renderer.unsafe = true`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 输入空字符串 | 空字符串 | 否 |
| 输入 `nil` | 空字符串 | 否 |
| 输入数字（如 `42`） | 先当字符串处理，输出 `42` | 否 |
| 结果是单个段落 | 去掉外层 `p`，得到行内 HTML | 否 |
| 结果是多个段落、标题或列表 | 保留块级标签；标题还会自动生成 `id`（实测 `# H` → `<h1 id="h">H</h1>`） | 否 |
| 输入含原始（内联）HTML | 取决于 `markup.goldmark.renderer.unsafe`：默认 `false` 时被替换成 `<!-- raw HTML omitted -->`；本站为 `true`，实测原样保留 `<em>b</em>` | 否 |
| 返回类型 | `template.HTML` | 否 |

> [!WARNING]
> 上表「原始 HTML」一行与站点配置有关：上游默认配置（`unsafe = false`）会把 Markdown 里的内联 HTML 吞掉，只在产物里留下 `<!-- raw HTML omitted -->`；本站 `hugo.toml` 里 `unsafe = true`，实测输出保留标签。看到哪一种结果，取决于站点配置，不是版本差异。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上显示字面的 `**加粗**`、方括号链接 | 字符串字段没经过 `markdownify`，Hugo 不会自动渲染它 | 在模板里套一层 `markdownify` |
| 没报错但结果不对 | 输出里出现 `<!-- raw HTML omitted -->` | 输入的 Markdown 含内联 HTML，而站点没开 `unsafe` | 开启 `markup.goldmark.renderer.unsafe = true`（本站已开），或把它改写成纯 Markdown |
| 没报错但结果不对 | 标题里多出一层 `p`，结构成 `<h2><p>…</p></h2>` | 字段里含空行（多个段落），单段落去 `p` 的规则不生效 | 字段只放行内 Markdown，或改用 `RenderString` 的 `display` 选项 |
| 没报错但结果不对 | 在正文 Markdown 里写 `{{ .Params.x | markdownify }}`，页面上原样显示 | 内容文件不是模板，模板语法只在 `layouts/` 下求值 | 把渲染放进模板或局部模板；正文里的动态内容用短代码 |
| 报错看不懂 | 渲染钩子在 `markdownify` 里取 `.Page` 取不到页面上下文 | 这个函数不携带页面上下文（见 issue [#9692][]） | 改用 `Page` 的 `RenderString` 方法 |

更多排查入口见[故障排查](/troubleshooting/)。

[#9692]: https://github.com/gohugoio/hugo/issues/9692
[Markdown 渲染钩子]: /render-hooks/
[`RenderString`]: /methods/page/renderstring/
