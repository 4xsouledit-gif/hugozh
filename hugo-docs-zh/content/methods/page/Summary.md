+++
title = "Summary"
linkTitle = "Summary"
description = "返回给定页面的摘要。"
date = 2026-10-02
weight = 810
source = "https://gohugo.io/methods/page/summary/"

[params.functions_and_methods]
signatures = ["PAGE.Summary"]
returnType = "template.HTML"
+++

<!-- Do not remove the manual summary divider below. -->
<!-- If you do, you will break its first literal usage on this page. -->

<!--more-->

你可以手动定义[摘要][]，也可以在前置元数据中定义，或者让它自动生成。手动摘要优先于前置元数据摘要，前置元数据摘要优先于自动摘要。

要在列出某个 section 中的页面时，在每个链接下方附上摘要：

```go-html-template
{{ range .Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
{{ end }}
```

> [!WARNING]
> 自动生成的 `.Summary` 可能会从中间截断块级标签（例如 `blockquote`），导致浏览器去补全结束标签。详情以及避免该问题的方法请参见[自动摘要][]。

取决于内容长度和摘要的定义方式，摘要可能等同于内容本身。要判断内容长度是否超过摘要长度，请使用 `Page` 对象上的 [`Truncated`][] 方法。这在需要有条件地渲染“阅读更多”链接时很有用：

```go-html-template
{{ range .Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
  {{ if .Truncated }}
    <a href="{{ .RelPermalink }}">Read more...</a>
  {{ end }}
{{ end }}
```

> [!NOTE]
> 如果你在前置元数据中定义摘要，`Truncated` 方法会返回 `false`。

[`Truncated`]: /methods/page/truncated/
[automatic summary]: /content-management/summaries/#automatic-summary
[summary]: /content-management/summaries/
