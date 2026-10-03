+++
title = "Plain"
linkTitle = "Plain"
description = "返回给定页面渲染后的内容，并移除所有 HTML 标签。"
date = 2026-10-02
weight = 560
source = "https://gohugo.io/methods/page/plain/"

[params.functions_and_methods]
signatures = ["PAGE.Plain"]
returnType = "string"
+++

## 这一页解决什么问题

要拿页面的纯文本——做 `<meta name="description">`、做搜索结果摘要、做纯文本输出格式（`text/plain`）、给外部分类/检索系统喂数据——都需要「内容去掉标签」。`.Plain` 一次做完：先把 Markdown 和短代码渲染成 HTML，再把 HTML 标签剥离。

它**不剥离 HTML 实体**：`&amp;` 依然是 `&amp;`（上游已说明，下方实测确认）。因此最常用的组合是：

```go-html-template
{{ .Plain | htmlUnescape }}
```

## 什么时候用，什么时候别用

**该用**：

- 纯文本输出：`<meta name="description">`、JSON 输出、检索索引；
- 字符数/词数统计（[`.PlainWords`](/methods/page/plainwords/) 就是在它基础上切词）；
- 需要在模板里安全地显示大段纯文本（标签已被移除）。

**别用**：

- 想要**带 HTML** 的正文 → 用 [`.Content`](/methods/page/content/)；
- 想要渲染后的摘要 → 用 [`.Summary`](/methods/page/summary/)（可以用 `<!--more-->` 或 front matter 控制长度）；
- 想要原文（含 Markdown 标记、短代码未渲染）→ 用 [`.RawContent`](/methods/page/rawcontent/)；
- 想把任意字符串转成纯文本 → 用 [`transform.Plainify`](/functions/transform/plainify/)（对字符串操作，不依附页面）。

**一句话区分**：`.Content`（HTML）→ `.Summary`（可截断的 HTML）→ `.Plain`（无标签文本）→ `.PlainWords`（文本切片）→ `.RawContent`（未渲染原文）。

## 用法

`Page` 对象上的 `Plain` 方法会把 Markdown 和[短代码](g)渲染为 HTML，然后剥离 HTML [标签][]。它不会剥离 HTML [实体][]。

要阻止 Go 的 [`html/template`][] 包转义 HTML 实体，请把结果传给 [`htmlUnescape`][] 函数。

```go-html-template
{{ .Plain | htmlUnescape }}
```

## 完整示例：打印纯文本

测试站的内容文件 `content/posts/plain-short.md`：

```md {file="content/posts/plain-short.md"}
+++
title = "Plain 短例"
+++
这是**加粗**文字，链接 [文档](/docs/)，实体 &amp; 与 &copy; 混合。

{{</* note */>}}短代码里的内容{{</* /note */>}}

## 小节标题
小节正文。
```

这里 `note` 是测试站自定义的一个短代码（模板 `layouts/_shortcodes/note.html`），因此这段内容能同时验证「短代码会被渲染」和「渲染出的标签也会被剥离」。在内容页模板中：

```go-html-template {file="layouts/_default/single.html"}
<p class="plain">{{ .Plain }}</p>
<p class="plain-unescaped">{{ .Plain | htmlUnescape }}</p>
```

实测（Hugo 0.167.0），`.Plain` 的值（`\n`、`\r` 为控制字符，这里显式写出）：

```text
这是加粗文字，链接 文档，实体 &amp; 与 © 混合。\n短代码里的内容\r小节标题 小节正文。\n
```

`.Plain | htmlUnescape` 的值：

```text
这是加粗文字，链接 文档，实体 & 与 © 混合。\n短代码里的内容\r小节标题 小节正文。\n
```

**你应当看到什么**：

- `**加粗**` 的 `*` 与 `<strong>` 都没了，只剩「加粗」两个字；`[文档](/docs/)` 只剩「文档」；
- 短代码**已经被渲染**（`{{</* note */>}}` 里的内容按短代码模板输出），但输出的 `<div>` 标签同样被剥离；
- `&amp;` **原样保留**（这就是「不剥离实体」）；而 `&copy;` 在 Markdown 渲染阶段就已经变成字符 `©`；
- 直接用 `{{ .Plain }}` 输出时，值里的 `&amp;` 会被 Go 模板再转义一次，HTML 源码中显示为 `&amp;amp;`；加 `htmlUnescape` 之后源码里是 `&amp;`、浏览器显示 `&`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| Markdown 标签（`<strong>`、`<a>`、`<h2>`） | 标签被剥离，文字保留 | 否 |
| HTML 实体 `&amp;` | 值中保留为 `&amp;`（上游已说明；实测确认） | 否 |
| `&copy;` 等实体 | 在 Markdown 渲染阶段已解码为 `©` | 否 |
| 短代码 | 渲染结果参与输出，其 HTML 标签被剥离（实测短代码文本出现在结果中） | 否 |
| 块级元素之间 | 只隔一个换行/回车（实测 `<h2>` 前为 `\r`），文字可能粘连 | 否 |
| 正文为空（只有 front matter） | 空字符串（实测 `printf "%q"` 得 `""`） | 否 |
| 返回类型 | `string`（不是 `template.HTML`，所以会被自动转义） | 否 |
| 需要保留实体 | —— | 否，但要显式 `htmlUnescape` |

> [!NOTE]
> 由于返回值是 `string` 而不是 `template.HTML`，模板会转义其中的 `&`、`<`、`>`。这正是「直接输出看到 `&amp;amp;`」的原因，不是内容坏了。

更多排查入口见[故障排查](/troubleshooting/)。

[`html/template`]: https://pkg.go.dev/html/template
[`htmlUnescape`]: /functions/transform/htmlunescape/
[entities]: https://developer.mozilla.org/en-US/docs/Glossary/Entity
[tags]: https://developer.mozilla.org/en-US/docs/Glossary/Tag
