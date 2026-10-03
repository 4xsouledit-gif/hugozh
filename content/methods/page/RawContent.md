+++
title = "RawContent"
linkTitle = "RawContent"
description = "返回给定页面的原始内容。"
date = 2026-10-02
weight = 610
source = "https://gohugo.io/methods/page/rawcontent/"

[params.functions_and_methods]
signatures = ["PAGE.RawContent"]
returnType = "string"
+++

## 这一页解决什么问题

`.RawContent` 返回**未经渲染的正文**：不含前置元数据、Markdown 标记原样保留、短代码也没有被渲染。典型用途是把页面原样输出为纯文本输出格式（例如给 AI/检索系统喂原文、提供 `.md` 下载），或者做「复制 Markdown 源码」按钮。

它和相邻方法的区别：

| 方法 | 包含什么 | 短代码 |
| --- | --- | --- |
| `.Content` | 渲染后的 HTML | 已渲染 |
| `.RawContent` | 原始正文（Markdown 标记保留） | **未**渲染 |
| [`.RenderShortcodes`](/methods/page/rendershortcodes/) | 原始 Markdown + 已渲染的短代码 | 已渲染 |
| [`.Plain`](/methods/page/plain/) | 渲染后再剥离标签的纯文本 | 已渲染 |

## 什么时候用，什么时候别用

**该用**：

- 纯文本输出格式（`text/plain`、`.md` 下载）；
- 需要「原文」的检索/AI 场景，不希望混入渲染后的 HTML；
- 调试：确认内容文件里到底写了什么。

**别用**：

- 想在页面上显示正文 → 用 [`.Content`](/methods/page/content/)；
- 想显示正文但**短代码要渲染** → 用 [`.RenderShortcodes`](/methods/page/rendershortcodes/)；
- 想要纯文本 → 用 [`.Plain`](/methods/page/plain/)。

## 用法

`Page` 对象上的 `RawContent` 方法返回原始内容。原始内容不包含前置元数据。

```go-html-template
{{ .RawContent }}
```

在以纯文本[输出格式](g)渲染页面时，这很有用。

> [!NOTE]
> 内容中的[短代码](g)不会被渲染。要获得短代码已渲染后的原始内容，请使用 `Page` 对象上的 [`RenderShortcodes`][] 方法。

## 完整示例：打印原文

内容文件 `content/posts/post-1.md`：

```md {file="content/posts/post-1.md"}
+++
title = "第一篇"
+++
第一篇的开场段落。

<!--more-->

## 第一节
正文内容甲。
```

模板：

```go-html-template {file="layouts/_default/single.html"}
<pre>{{ .RawContent }}</pre>
```

实测（Hugo 0.167.0），`.RawContent` 的值（`\n`、`\r` 为控制字符，这里显式写出）：

```text
第一篇的开场段落。\n\n<!--more-->\n\n## 第一节\n正文内容甲。\r\n
```

**你应当看到什么**：

- 前置元数据（`+++` 与 `title`）**不在**返回值里；
- `## 第一节` 的 `##` 原样保留（没有被渲染成 `<h2>`）；
- `<!--more-->` 也原样保留；
- 末尾有一个换行（Windows 下文件以 `\r\n` 结尾，实测值末尾为 `\r\n`）。

含短代码的页面更直观：`content/posts/plain-demo.md` 里写着 `{{</* note */>}}短代码里的内容{{</* /note */>}}`，实测 `.RawContent` 中该段仍是**调用原文**（`{{</* note */>}}` 与 `{{</* /note */>}}` 原样保留），而 [`.RenderShortcodes`](/methods/page/rendershortcodes/) 的同一处已经变成了短代码渲染结果。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 前置元数据 | 不含（实测返回值从第一段正文开始） | 否 |
| Markdown 标记 | 保留原文（`##`、`**` 等，实测） | 否 |
| 短代码 | **不渲染**，保留调用原文（实测） | 否 |
| `<!--more-->` 摘要分隔符 | 原样保留（实测） | 否 |
| 行尾 | 保留文件中的换行；Windows 下文件末尾为 `\r\n`（实测） | 否 |
| 返回值类型 | `string`（会被 HTML 转义；要原样输出用 `{{ .RawContent | safeHTML }}` 或放进输出格式模板） | 否 |
| 正文为空 | 空字符串（本站未单独实测，逻辑上与「不含 front matter 的正文」一致） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`RenderShortcodes`]: /methods/page/rendershortcodes/
