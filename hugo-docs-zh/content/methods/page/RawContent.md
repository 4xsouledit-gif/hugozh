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

`Page` 对象上的 `RawContent` 方法返回原始内容。原始内容不包含前置元数据。

```go-html-template
{{ .RawContent }}
```

在以纯文本[输出格式](g)渲染页面时，这很有用。

> [!NOTE]
> 内容中的[短代码](g)不会被渲染。要获得短代码已渲染后的原始内容，请使用 `Page` 对象上的 [`RenderShortcodes`][] 方法。

[`RenderShortcodes`]: /methods/page/rendershortcodes/
