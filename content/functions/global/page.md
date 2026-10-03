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

## 这一页解决什么问题

模板越往深处走（局部模板、渲染钩子、被 `range` 包住的代码），越容易拿不到当前页面的 `Page` 对象。全局 `page` 函数让「当前页面」在任何位置都能取到：`{{ page.Title }}`、`{{ page.Params.xxx }}`。

但它的语义有个关键前提：`page` 返回的是**传入顶层模板的那个 `Page` 对象**，而不是「正在迭代的那个页面」。所以它既能在嵌套模板里救急，也能在循环里给出「错误」的答案——本页「示例」演示的正是后者。

## 什么时候用，什么时候别用

**该用**：

- 深层局部模板 / 渲染钩子里需要当前页面，但上下文里没有 `.`；
- 顶部模板里用 `page` 让写法统一（`page.Params.x` 与 `.Params.x` 等价）。

**别用**：

- 在 `range` 循环里想取「当前被迭代的页面」→ 用 `.`（迭代元素本身），`page` 会一直返回顶层页面；
- 在短代码、被短代码调用的局部模板、以及 [`partialCached`](/functions/partials/includecached/) 缓存的局部模板里 → 上游明确要求不要用（缓存会导致结果错乱）；
- 多主机（multihost）的 sitemap 模板 → 上游指出这是顶层模板不传 `Page` 的唯一例外。

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

## 完整示例（实测）

最小站点：`title = "Teach Test"`，`content/posts/post-1.md`、`post-2.md` 两篇文章。

```go-html-template
{{ page.Title }}
{{ range site.RegularPages }}{{ page.Title }}/{{ .Title }}; {{ end }}
```

Hugo 0.167.0 实测渲染：

```text
Teach Test
Teach Test/Post Two; Teach Test/Post One; 
```

**你应当看到什么**：第一行是首页标题；循环里 `page.Title` **每一轮都还是首页标题**（`Teach Test`），只有 `.Title` 才依次是 `Post Two`、`Post One`。这就是上游「注意顶层上下文」一节要提醒的陷阱。

在局部模板里也一样——实测从 `layouts/index.html` 调用的局部模板中，`page.Title` 与 `.Title` 都取到首页：

```text
PAGE-IN-PARTIAL: page=Teach Test dot=Teach Test
```

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 顶层模板上下文是页面 | `page` 与该页面对象相同（`page.Title` 与 `.Title` 一致） | 否 |
| 在 `range` 循环内 | 仍返回顶层页面（实测两轮都得到首页标题） | 否 |
| 在普通局部模板内 | 返回顶层页面对象 | 否 |
| 在短代码 / 短代码调用的局部模板 / `partialCached` 缓存的局部模板内 | 上游要求不要使用（缓存结果可能不正确） | 否（但结果可能错） |
| 返回类型 | `page.Page` | 否 |
