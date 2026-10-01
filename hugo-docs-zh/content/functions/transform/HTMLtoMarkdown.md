+++
title = "transform.HTMLToMarkdown"
linkTitle = "HTMLToMarkdown"
description = "返回转换为 Markdown 后的给定 HTML。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/transform/htmltomarkdown/"

[params.functions_and_methods]
signatures = ["transform.HTMLToMarkdown INPUT"]
returnType = "string"
+++

（0.151.0 新增）

> [!NOTE]
> 该函数是实验性的，其 API 将来可能变化。

`transform.HTMLToMarkdown` 函数借助 [`html-to-markdown`][] Go 包把 HTML 转换为 Markdown。

## 用法

```go-html-template
{{ .Content | transform.HTMLToMarkdown | safeHTML }}
```

## 插件

转换过程由以下 `html-to-markdown` 插件实现：

插件|说明
:--|:--
Base|实现基本的共享功能
CommonMark|按 [CommonMark][] 规范实现 Markdown
Table|按 [GitHub 风格 Markdown][] 规范实现表格

[CommonMark]: https://spec.commonmark.org/current/
[GitHub 风格 Markdown]: https://github.github.com/gfm/
[`html-to-markdown`]: https://github.com/JohannesKaufmann/html-to-markdown?tab=readme-ov-file#readme
