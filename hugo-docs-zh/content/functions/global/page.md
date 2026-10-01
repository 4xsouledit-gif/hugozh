+++
title = "page"
linkTitle = "page"
description = "返回当前页面的 Page 对象，在任何上下文中都可访问。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/global/page/"

[params.functions_and_methods]
signatures = ["page"]
returnType = "page.Page"
+++

## 用法

在上下文接收 `Page` 对象的模板顶层，以下写法等价：

```go-html-template
{{ .Params.foo }}
{{ .Page.Params.foo }}
{{ page.Params.foo }}
```

当上下文里没有 `Page` 对象时，可以使用全局 `page` 函数：

```go-html-template
{{ page.Params.foo }}
```

> [!NOTE]
> 不要在短代码（shortcode）、由短代码调用的*局部模板*（partial），以及被缓存的*局部模板*中使用全局 `page` 函数。参见下文[示例](#示例)。

Hugo 几乎总是将 `Page` 作为数据上下文传给顶层模板（例如 `baseof.html`）。唯一的例外是多主机（multihost）的 sitemap 模板。这意味着你可以在模板中用 `.` 访问当前页面。

然而，当模板深度嵌套在[局部模板](g)或[渲染钩子](g)中时，访问 `Page` 对象并不总是可行或方便。

使用全局 `page` 函数可以在任何模板的任何位置访问 `Page` 对象。

## 示例

以下示例演示使用全局 `page` 函数时常见的陷阱。

### 注意顶层上下文

全局 `page` 函数访问的是传入顶层模板的 `Page` 对象。

有这样的内容结构：

```tree
content/
├── posts/
│   ├── post-1.md
│   ├── post-2.md
│   └── post-3.md
└── _index.md      <-- title is "My Home Page"
```

以及 _home_ 模板中的这段代码：

```go-html-template {file="layouts/home.html"}
{{ range site.Sections }}
  {{ range .Pages }}
    {{ page.Title }}
  {{ end }}
{{ end }}
```

渲染输出将会是：

```text
My Home Page
My Home Page
My Home Page
```

在上面的示例中，全局 `page` 函数访问的是传入 _home_ 模板的 `Page` 对象，而不是被迭代页面的 `Page` 对象。

### 注意缓存

不要在以下位置使用全局 `page` 函数：

- 短代码
- 由短代码调用的*局部模板*
- 被 [`partialCached`][] 函数缓存的*局部模板*

Hugo 会缓存渲染后的短代码。如果在短代码中使用全局 `page` 函数，而页面内容要在两个或更多模板中渲染，那么缓存的短代码可能是不正确的。

看看这个 _section_ 模板：

```go-html-template {file="layouts/section.html"}
{{ range .Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
{{ end }}
```

当你调用 [`Summary`][] 方法时，Hugo 会渲染页面内容，其中包括短代码。此时，在短代码内部，全局 `page` 函数访问的是 section 页面的 `Page` 对象，而不是内容页面的。

如果 Hugo 先渲染 section 页面再渲染内容页面，缓存的已渲染短代码就会不正确。由于并发的原因，你无法控制渲染顺序。

[`Summary`]: /methods/page/summary/
[`partialCached`]: /functions/partials/includecached/
