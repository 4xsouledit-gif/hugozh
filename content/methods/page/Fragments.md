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

## 这一页解决什么问题

`Fragments` 把页面上的标题（片段）整理成结构化数据：有哪些锚点、层级关系如何、以及可以直接输出成目录的 HTML。做「本页目录」、校验锚点是否存在、按标题树遍历内容时用它。

## 什么时候用，什么时候别用

**该用**：

- 需要自己控制目录的起始层级与列表类型 → `.Fragments.ToHTML`；
- 需要判断某个 `id` 是否存在或重复 → `.Fragments.Identifiers.Contains` / `.Count`；
- 需要在链接渲染钩子里校验锚点；
- 需要遍历标题树 → `.Fragments.Headings` / `.HeadingsMap`。

**别用**：

- 只想输出默认目录 → 用 [`TableOfContents`](/methods/page/tableofcontents/)，它按项目配置渲染；
- 想拿到「与相关文章匹配的那些标题」→ 用 [`HeadingsFiltered`](/methods/page/headingsfiltered/)；
- 在短代码里用 `Fragments` 又要用 Markdown 记法调用该短代码 → 会形成循环，见下文「说明」。

## 用法

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

## 完整示例：列出锚点并输出目录

最小站点：`content/docs/guide/alpha.md` 的正文有三个标题（`## Section 1`、`### Section 1.1`、`## Section 2`）；`beta.md` 一个标题也没有。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<p>锚点：{{ delimit .Fragments.Identifiers "、" }}</p>
<p>包含 section-1：{{ .Fragments.Identifiers.Contains "section-1" }}</p>
<p>section-1 出现次数：{{ .Fragments.Identifiers.Count "section-1" }}</p>
{{ .Fragments.ToHTML 2 3 false }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，alpha 输出：

```html
<p>锚点：section-1、section-11、section-2</p>
<p>包含 section-1：true</p>
<p>section-1 出现次数：1</p>
<nav id="TableOfContents">
  <ul>
    <li><a href="#section-1">Section 1</a>
      <ul>
        <li><a href="#section-11">Section 1.1</a></li>
      </ul>
    </li>
    <li><a href="#section-2">Section 2</a></li>
  </ul>
</nav>
```

beta（没有任何标题）输出：

```html
<p>锚点：</p>
<p>包含 section-1：false</p>
<p>section-1 出现次数：0</p>
<nav id="TableOfContents"></nav>
```

**你应当看到什么**：锚点顺序就是标题在正文中出现的顺序；`ToHTML` 第 3 个参数传 `false` 得到 `<ul>`（传 `true` 得到 `<ol>`）；页面没有标题时**不会报错**，只得到空切片与空的 `<nav>`。

`.Fragments.Headings` 的结构（实测，用一层 `range` 打印，格式为 `[ID/Level(子项…)]`）：

```text
[/0(section-1/2)(section-2/2)]
```

顶层只有一个 `ID` 为空、`Level` 为 0 的根节点，它的 `.Headings` 才是各个 `h2`；`h3` 再挂在 `h2` 的 `.Headings` 下，需要递归遍历。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；正文标题为 `## Section 1` / `### Section 1.1` / `## Section 2`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面有标题 | `.Fragments.Identifiers` 是按出现顺序排列的 `id` 切片 | 否 |
| 页面没有标题 | `Identifiers`、`Headings` 均为空切片；`ToHTML` 返回空的 `<nav>` | 否 |
| `Identifiers.Contains "section-1"` | `true`；不存在的 `id` 为 `false` | 否 |
| `Identifiers.Count "section-1"` | `1`；不存在的 `id` 为 `0` | 否 |
| `ToHTML 2 3 false` | 2–3 级的**无序**列表；`true` 则为有序列表 | 否 |
| `Headings` | 顶层是 `ID` 为空、`Level` 为 0 的根节点 | 否 |
| 返回类型 | `tableofcontents.Fragments` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 目录顺序不对 | `ToHTML` 输出的层级与正文不一致 | 标题层级跳跃（例如从 `h2` 直接到 `h4`） | 保持标题层级连续，或用参数限定起始/结束层级 |
| 没报错但结果不对 | 中文标题的锚点看起来是中文 | Hugo 保留 CJK 字符、只去掉标点并转小写 | 需要英文字锚点时用 Markdown 属性显式指定 `id` |
| 什么都没输出 | 短代码里的标题没有进目录 | 用标准记法（`{{</* */>}}`）调用的短代码，其 `.Inner` 在 Markdown 之后渲染 | 这是预期行为；需要标题进目录就用 Markdown 记法，并避开循环（见「说明」） |

更多排查入口见[故障排查](/troubleshooting/)。

[ATX]: https://spec.commonmark.org/current/#atx-headings
[Markdown 记法]: /content-management/shortcodes/#notation
[`TableOfContents`]: /methods/page/tableofcontents/
[配置标记]: /configuration/markup/#parserautodefinitiontermid
[setext]: https://spec.commonmark.org/current/#setext-headings
[标准记法]: /content-management/shortcodes/#notation
[目录]: /methods/page/tableofcontents/
