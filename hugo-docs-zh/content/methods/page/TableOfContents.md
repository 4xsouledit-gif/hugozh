+++
title = "TableOfContents"
linkTitle = "TableOfContents"
description = "返回给定页面的目录。"
date = 2026-10-02
weight = 820
source = "https://gohugo.io/methods/page/tableofcontents/"

[params.functions_and_methods]
signatures = ["PAGE.TableOfContents"]
returnType = "template.HTML"
+++

## 这一页解决什么问题

长文档需要一个「本页目录」。`.TableOfContents` 把当前页面里 Markdown 的 `##`、`###` 标题编译成一个嵌套的 `<nav id="TableOfContents">…</nav>`，直接输出即可；锚点也已经生成好（与标题文字的锚点一致）。

它返回的是**完整的一段 HTML**（`template.HTML`），不是列表数据——想自己定制 DOM，就得改用 `.Fragments` 或渲染钩子。

## 什么时候用，什么时候别用

**该用**：

- 文档页/长文右上角或正文开头的目录；
- 想按页面参数控制是否显示目录（例如 `.Param "display_toc"`）。

**别用**：

- 想要结构化标题数据（自己渲染 DOM）→ 用 [`.Fragments`](/methods/page/fragments/) 或 [`.HeadingsFiltered`](/methods/page/headingsfiltered/)；
- 想改目录的级别/有序无序 → 不是方法参数，而是[站点配置 `markup.tableOfContents`](/configuration/markup/)；
- 需要「只有标题够多才显示目录」→ 先用 `.Fragments` 或数一数字符长度再决定。

## 用法

`Page` 对象上的 `TableOfContents` 方法返回页面内容中 Markdown [ATX][] 和 [setext][] 标题构成的有序或无序列表。

这段模板代码：

```go-html-template
{{ .TableOfContents }}
```

会生成这样的 HTML：

```html
<nav id="TableOfContents">
  <ul>
    <li><a href="#section-1">Section 1</a>
      <ul>
        <li><a href="#section-11">Section 1.1</a></li>
        <li><a href="#section-12">Section 1.2</a></li>
      </ul>
    </li>
    <li><a href="#section-2">Section 2</a></li>
  </ul>
</nav>
```

默认情况下，`TableOfContents` 方法返回 2 级和 3 级标题构成的无序列表。你可以在项目配置中调整：

```toml
[markup.tableOfContents]
endLevel = 3
ordered = false
startLevel = 2
```

## 完整示例：渲染本页目录

测试站的内容文件 `content/posts/post-1.md`：

```md {file="content/posts/post-1.md"}
第一篇的开场段落。

<!--more-->

## 第一节
正文内容甲。

## 第二节
正文内容乙。
```

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
{{ .TableOfContents }}
```

实测（Hugo 0.167.0）渲染结果：

```html
<nav id="TableOfContents">
  <ul>
    <li><a href="#第一节">第一节</a></li>
    <li><a href="#第二节">第二节</a></li>
  </ul>
</nav>
```

只有一级标题的 `/posts/bundle-1/` 实测渲染为：

```html
<nav id="TableOfContents">
  <ul>
    <li><a href="#包内标题">包内标题</a></li>
  </ul>
</nav>
```

**你应当看到什么**：`##` 的文本变成了 `<a>` 的文字，锚点是标题文本（本站未开启 `autoHeadingIDs` 之外的自定义处理，中文标题直接用中文字符作锚点）；`#` 的数量决定嵌套层级。页面上不存在 2–3 级标题时（例如 `/posts/post-2/`），返回的是**空的 nav**：

```html
<nav id="TableOfContents"></nav>
```

所以「有没有目录」不能靠 `{{ if .TableOfContents }}` 判断（非空字符串恒为真），要么判断长度、要么用 `.Fragments`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面有 2–3 级标题 | 嵌套 `<nav>` + `<ul>`（实测） | 否 |
| 只有一个标题 | 单个 `<li>` 的 `<ul>`（实测） | 否 |
| 没有任何 2–3 级标题 | `<nav id="TableOfContents"></nav>`（空元素，实测） | 否 |
| 1 级标题（`#`） | 默认（`startLevel = 2`）**不收录** | 否 |
| 想改级别/有序 | 改 `[markup.tableOfContents]`（`startLevel`、`endLevel`、`ordered`） | 否 |
| 返回类型 | `template.HTML`（可直接输出） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[ATX]: https://spec.commonmark.org/current/#atx-headings
[setext]: https://spec.commonmark.org/current/#setext-headings
