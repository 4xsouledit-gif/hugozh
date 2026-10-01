+++
title = "Fragments"
linkTitle = "Fragments"
description = "返回给定页面中片段的数据结构。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/methods/page/fragments/"

[params.functions_and_methods]
signatures = ["PAGE.Fragments"]
returnType = "tableofcontents.Fragments"
+++

在 URL 中，无论绝对路径还是相对路径，[片段](g)都指向页面上某个 HTML 元素的 `id` 属性。

```text
/articles/article-1#section-2
------------------- ---------
       path         fragment
```

Hugo 会为页面内容中的每个 Markdown [ATX][] 与 [setext][] 标题分配 `id` 属性。你可以按需用 [Markdown 属性](g)覆盖该 `id`。这就在[目录][]（TOC）条目与页面上的标题之间建立了对应关系。

使用 `Page` 对象上的 `Fragments` 方法，可以用 `Fragments.ToHTML` 方法生成目录，也可以[遍历](g) `Fragments.Map` 数据结构。用下面的方法来检查、校验并渲染页面片段。

## 方法

在 `Fragments` 对象上使用这些方法。

`Headings`
: （`slice`）页面上所有标题的 map 切片，每个标题是一个一级键。每个 map 包含以下键：`ID`、`Level`、`Title` 与 `Headings`。要查看数据结构：

  ```go-html-template
  <pre>{{ debug.Dump .Fragments.Headings }}</pre>
  ```

`HeadingsMap`
: （`map`）页面上所有标题的嵌套 map。每个 map 包含以下键：`ID`、`Level`、`Title` 与 `Headings`。要查看数据结构：

  ```go-html-template
  <pre>{{ debug.Dump .Fragments.HeadingsMap }}</pre>
  ```

`Identifiers`
: （`slice`）一个切片，包含页面上每个标题的 `id` 属性。若已做相应配置，还会包含页面上每个描述术语（即 `dt` 元素）的 `id` 属性。

  参见[配置标记][]。

  要查看数据结构：

  ```go-html-template
  <pre>{{ debug.Dump .Fragments.Identifiers }}</pre>
  ```

`Identifiers.Contains ID`
: （`bool`）报告页面上是否有一个或多个标题具有给定的 `id` 属性，可用于在链接[渲染钩子](g)中校验片段。

  ```go-html-template
  {{ .Fragments.Identifiers.Contains "section-2" }} → true
  ```

`Identifiers.Count ID`
: （`int`）页面上具有给定 `id` 属性的标题数量，可用于检测重复。

  ```go-html-template
  {{ .Fragments.Identifiers.Count "section-2" }} → 1
  ```

`ToHTML`
: （`template.HTML`）以嵌套列表的形式返回 TOC，可以是有序列表也可以是无序列表，与 [`TableOfContents`][] 方法返回的 HTML 相同。该方法接收三个参数：起始层级（`int`）、结束层级（`int`）以及一个布尔值（`true` 返回有序列表，`false` 返回无序列表）。

  当你希望独立于项目配置中的目录设置来控制起始层级、结束层级或列表类型时，就使用这个方法。

  ```go-html-template
  {{ $startLevel := 2 }}
  {{ $endLevel := 3 }}
  {{ $ordered := true }}
  {{ .Fragments.ToHTML $startLevel $endLevel $ordered }}
  ```

  Hugo 会把它渲染为：

  ```html
  <nav id="TableOfContents">
    <ol>
      <li><a href="#section-1">Section 1</a>
        <ol>
          <li><a href="#section-11">Section 1.1</a></li>
          <li><a href="#section-12">Section 1.2</a></li>
        </ol>
      </li>
      <li><a href="#section-2">Section 2</a></li>
    </ol>
  </nav>
  ```

## 说明

> [!NOTE]
> 在渲染钩子（render hook）中使用 `Fragments` 的各个方法是安全的，即使针对当前页面也是如此。
>
> 在短代码中使用 `Fragments` 的各个方法时，请用[标准记法][]调用该短代码。如果使用 [Markdown 记法][]，已渲染的短代码会被纳入片段 map 的构建过程，从而形成循环。

[ATX]: https://spec.commonmark.org/current/#atx-headings
[Markdown 记法]: /content-management/shortcodes/#notation
[`TableOfContents`]: /methods/page/tableofcontents/
[配置标记]: /configuration/markup/#parserautodefinitiontermid
[setext]: https://spec.commonmark.org/current/#setext-headings
[标准记法]: /content-management/shortcodes/#notation
[目录]: /methods/page/tableofcontents/
