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
+++

```go-html-template
<h2>{{ .Title | markdownify }}</h2>
```

如果生成的 HTML 只有一个段落，Hugo 会去掉包裹的 `p` 标签，按上面示例的需要输出行内 HTML。

要为单个段落保留包裹的 `p` 标签，请使用 `Page` 对象上的 [`RenderString`][] 方法，并把 `display` 选项设为 `block`。

> [!NOTE]
> 尽管 `markdownify` 函数在把 Markdown 渲染为 HTML 时会遵循 [Markdown 渲染钩子][]，但如果有渲染钩子需要访问 `.Page` 上下文，请改用 `RenderString` 方法而不是 `markdownify`。详见 issue [#9692][]。

[#9692]: https://github.com/gohugoio/hugo/issues/9692
[Markdown 渲染钩子]: /render-hooks/
[`RenderString`]: /methods/page/renderstring/
