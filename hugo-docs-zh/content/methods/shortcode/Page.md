+++
title = "Page"
linkTitle = "Page"
description = "返回调用该短代码的 Page 对象。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/shortcode/page/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Page"]
returnType = "hugolib.pageForShortcode"
+++

## 这一页解决什么问题

短代码模板里的点号（`.`）是**短代码对象**，不是页面——所以你没法直接写 `.Title`、`.Params`、`.Content` 去拿页面数据。`Page` 方法补上这一环：它返回**调用该短代码的那个页面**，之后就能像在页面模板里一样使用页面的方法与字段。

典型场景：短代码要读取所在页面的前置元数据（作者、ISBN、`weight`）、要访问页面资源、要把 `Inner` 交给 `RenderString` 渲染。

## 什么时候用，什么时候别用

**该用**：

- 需要**所在页面**的数据：`.Page.Title`、`.Page.Params.*`、`.Page.RelPermalink`、`.Page.Date`；
- 需要页面资源：`.Page.Resources.Get "…"`；
- 需要把短代码内容按 Markdown 渲染：`.Page.RenderString`（见 [`Inner`](/methods/shortcode/inner/)）。

**别用**：

- 拿站点级数据（标题、语言、菜单）→ 用 [`Site`](/methods/shortcode/site/)；
- 拿父短代码的参数 → 用 [`Parent`](/methods/shortcode/parent/)；
- 以为 `.Page` 能拿到「短代码参数」→ 参数用 [`Get`](/methods/shortcode/get/) / [`Params`](/methods/shortcode/params/)。

> [!WARNING]
> 在 `{{ with … }}`、`{{ range … }}` 这类会改写点号的块里，`.Page` 会指向别的东西（或失效）。此时要用 `$.Page`——`$` 始终是模板的顶层上下文。

## 用法

内容如下：

```toml
title = 'Les Misérables'
author = 'Victor Hugo'
publication_year = 1862
isbn = '978-0451419439'
```

调用这个短代码：

```md
{{</* book-details */>}}
```

我们可以用 `Page` 方法访问前置元数据中的值：

```go-html-template {file="layouts/_shortcodes/book-details.html"}
<ul>
  <li>Title: {{ .Page.Title }}</li>
  <li>Author: {{ .Page.Params.author }}</li>
  <li>Published: {{ .Page.Params.publication_year }}</li>
  <li>ISBN: {{ .Page.Params.isbn }}</li>
</ul>
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。内容文件 `content/scdoc.md` 的前置元数据里有 `title`、`author`、`publication_year`、`isbn`。

```go-html-template {file="layouts/_shortcodes/book-details.html"}
<ul>
  <li>Title: {{ .Page.Title }}</li>
  <li>Author: {{ .Page.Params.author }}</li>
  <li>Published: {{ .Page.Params.publication_year }}</li>
  <li>ISBN: {{ .Page.Params.isbn }}</li>
  <li>Kind: {{ .Page.Kind }}</li>
</ul>
```

```md {file="content/scdoc.md"}
{{</* book-details */>}}
```

Hugo 渲染为：

```html
<ul>
  <li>Title: SC Doc</li>
  <li>Author: Victor Hugo</li>
  <li>Published: 1862</li>
  <li>ISBN: 978-0451419439</li>
  <li>Kind: page</li>
</ul>
```

**你应当看到什么**：`Title` 来自页面标题，`Author`/`Published`/`ISBN` 来自该页面前置元数据的**自定义字段**（`author`、`publication_year`、`isbn`），`Kind` 说明这是一个普通内容页（`page`）。同一个短代码放在别的页面上，读到的就是那一页的数据——短代码因此可以复用。

在 `with` 块里访问页面时别忘了 `$`：

```go-html-template
{{ with .Get "src" }}
  <li>所属页面：{{ $.Page.Title }}</li>
{{ end }}
```

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 常规内容页 | 调用该短代码的页面对象（`hugolib.pageForShortcode`），实测可读 `Title`、`Params.*`、`Kind` | 否 |
| 前置元数据里没有的字段 | 空值，`with` 判为假 | 否 |
| 短代码来自列表页/首页 | 返回对应的列表页或首页对象 | 否 |
| 在 `with`/`range` 块内写 `.Page` | 点号已被改写，取不到页面 | 可能报错或取到错误对象，需改 `$.Page` |
| 页面参数与资源 | `.Page.Resources.Get "…"` 可用（属于页面对象的方法） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `can't evaluate field Title in type *hugolib.ShortcodeWithPage` | 直接写了 `.Title`，而点号是短代码对象 | 改成 `.Page.Title` |
| 没报错但结果不对 | `with` 块里页面标题变成空 | 块内点号已改写 | 用 `$.Page.Title` |
| 没报错但结果不对 | 参数取到的是短代码自己的参数 | `.Page.Params` 是**页面**的参数，短代码参数在 `.Params` | 短代码参数用 `.Get "…"` |
| 没报错但结果不对 | 页面资源找不到 | 路径不对，或资源不在该页面的包里 | 用 `.Page.Resources.Get` 并核对相对页面包的路径 |

更多排查入口见[故障排查](/troubleshooting/)。
