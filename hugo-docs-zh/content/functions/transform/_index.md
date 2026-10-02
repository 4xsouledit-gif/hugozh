+++
title = "转换函数"
linkTitle = "transform"
description = "用这些函数把取值从一种格式转换为另一种格式。"
date = 2026-10-02
weight = 290
source = "https://gohugo.io/functions/transform/"
+++

这一章把「一种表示」变成「另一种表示」：Markdown ↔ HTML、HTML → 纯文本、字符串 → 数据结构、数据结构 → JSON/YAML/TOML/XML、代码 → 高亮 HTML、LaTeX → 公式、Portable Text → Markdown。它们大多**单向且有损**，用之前先确认方向对不对。

本章也是「转义」类问题的集中地：`htmlEscape`、`htmlUnescape`、`transform.XMLEscape` 的返回值都是普通 `string`，在 HTML 模板里会被**再次转义**（实测，见各页完整示例）；而 `markdownify`、`plainify`、`jsonify`、`ToMath`、`Highlight` 等返回 `template.HTML`，不会二次转义。

## 读完本章你应该能够

- 判断「我手上是什么、我要什么」，从而在 Markdownify / HTMLtoMarkdown / Plainify / Unmarshal / Remarshal / Jsonify 之间选对函数；
- 说清 `template.HTML` 与 `string` 返回类型的差别，以及什么时候必须补 `safeHTML`；
- 在自定义代码块渲染钩子里用 `transform.HighlightCodeBlock` 的 `.Wrapped` 与 `.Inner`，并知道语言不被支持时的退路；
- 用 `transform.ToMath` 在构建期渲染公式，并知道 `throwOnError` 与 `try` 两种错误处理方式；
- 用 `transform.Unmarshal` 解析 YAML/JSON/TOML/XML/CSV，并知道 CSV 的 `targetType` 会改变表头语义；
- 用 `transform.PortableText` 把 Sanity 数据转成 Markdown，并知道模板直接造的切片类型会报错、需要过一次 JSON。

## 建议阅读顺序

1. **[transform.Markdownify](/functions/transform/markdownify/)** —— 最常用：把字符串里的 Markdown 渲染成 HTML。
2. **[transform.Plainify](/functions/transform/plainify/)** / **[transform.HTMLToMarkdown](/functions/transform/htmltomarkdown/)** —— 从 HTML 得到文本或 Markdown。
3. **[transform.Unmarshal](/functions/transform/unmarshal/)** / **[transform.Remarshal](/functions/transform/remarshal/)** / **[encoding.Jsonify](/functions/encoding/jsonify/)** —— 结构化数据的进出。
4. **[transform.HTMLEscape](/functions/transform/htmlescape/)** / **[transform.HTMLUnescape](/functions/transform/htmlunescape/)** / **[transform.XMLEscape](/functions/transform/xmlescape/)** —— 转义三兄弟，注意二次转义与 `safeHTML`。
5. **[transform.Emojify](/functions/transform/emojify/)** —— 短代码替换。
6. **[transform.Highlight](/functions/transform/highlight/)** / **[transform.HighlightCodeBlock](/functions/transform/highlightcodeblock/)** / **[transform.CanHighlight](/functions/transform/canhighlight/)** —— 语法高亮。
7. **[transform.ToMath](/functions/transform/tomath/)** —— 构建期渲染数学公式。
8. **[transform.PortableText](/functions/transform/portabletext/)** —— 从 Sanity 这类 CMS 取富文本。

> [!TIP]
> 本章函数的「返回值边界（实测）」表里，凡是写着「是：`error calling …`」的行，都表示会让**整个构建失败**——写模板时优先按这些边界做防护。
