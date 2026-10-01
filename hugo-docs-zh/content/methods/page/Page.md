+++
title = "Page"
linkTitle = "Page"
description = "返回给定页面的 Page 对象。"
date = 2026-10-02
weight = 470
source = "https://gohugo.io/methods/page/page/"

[params.functions_and_methods]
signatures = ["PAGE.Page"]
returnType = "page.Page"
+++

这是一个便捷方法，当_局部模板_同时被_短代码_和其他模板类型调用时很有用。

```go-html-template {file="layouts/_shortcodes/foo.html"}
{{ partial "my-partial.html" . }}
```

当_短代码_模板调用该_局部模板_时，会把当前[上下文](g)（即点号）传递过去。该上下文包含 `Page`、`Params`、`Inner`、`Name` 等标识符。

```go-html-template {file="layouts/page.html"}
{{ partial "my-partial.html" . }}
```

当_页面_模板调用该_局部模板_时，也会传递当前上下文（即点号）。但此时点号_就是_ `Page` 对象。

```go-html-template {file="layouts/_partials/my-partial.html"}
The page title is: {{ .Page.Title }}
```

要同时处理这两种情况，_局部模板_必须能通过 `Page.Page` 访问 `Page` 对象。

> [!NOTE]
> 是的，这意味着你也可以写 `.Page.Page.Page.Page.Title`。
>
> 但别这么干。
