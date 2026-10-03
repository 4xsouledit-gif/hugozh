+++
title = "IndexOf"
linkTitle = "IndexOf"
description = "返回给定页面在给定页面集合中从零开始的索引。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/methods/pages/indexof/"

[params.functions_and_methods]
signatures = ["PAGES.IndexOf PAGE"]
returnType = "int"
+++

**（0.166.0 新增）**

## 这一页解决什么问题

回答「**这一页是集合里的第几条**」：返回**从 0 开始**的下标。有了它就能渲染「第 2 篇 / 共 4 篇」，或自己算上一篇/下一篇。

配套的两个事实：

- 页面**不在**集合里时返回 `-1`（上游说明，实测确认）；
- 返回值是从 0 开始的，要展示给读者请自己 `add … 1`。

## 什么时候用，什么时候别用

**该用**：

- 需要「第 N 篇 / 共 M 篇」这类**位置**信息；
- 需要在同一集合里取相邻项，又不想依赖 `Prev`/`Next` 的定义（见下）。

**别用**：

- 只想要上一篇/下一篇 → 用 [`Prev`](/methods/pages/prev/) / [`Next`](/methods/pages/next/) 更短；但注意它们的语义与直觉相反；
- 想判断「有没有上一篇」→ `IndexOf` 不告诉你边界，得自己比 `0` 和 `Len`；
- 想找页面在**任意切片**里的位置 → 用 [`collections.Index`](/functions/collections/indexfunction/)。

## 用法

如果给定的页面不在页面集合中，`IndexOf` 方法返回 `-1`。

有如下内容结构：

```tree
content/
├── posts/
│   ├── _index.md
│   ├── post-1.md   <-- front matter: weight = 10
│   ├── post-2.md   <-- front matter: weight = 20
│   └── post-3.md   <-- front matter: weight = 30
└── _index.md
```

以及这个模板：

```go-html-template {file="layouts/posts/page.html"}
{{ $pages := .CurrentSection.Pages.ByWeight }}
{{ $index := add ($pages.IndexOf .) 1 }}
<p>This is post {{ $index }} of {{ $pages.Len }} in {{ .CurrentSection.LinkTitle }}.</p>
```

访问 post-2 时，Hugo 渲染为：

```html
<p>This is post 2 of 3 in Posts.</p>
```

也可以用 `IndexOf` 方法构建「上一个／下一个」导航链接。结合 [`index`][] 与 [`add`][]/[`sub`][] 函数，可以用它取得同一页面集合中的上一个和下一个页面：

```go-html-template
{{ $pages := .CurrentSection.Pages.ByWeight }}
{{ $index := $pages.IndexOf . }}

{{ if ge $index 0 }}
  {{ with index $pages (add $index 1) }}
    <a href="{{ .RelPermalink }}">Previous</a>
  {{ end }}

  {{ with index $pages (sub $index 1) }}
    <a href="{{ .RelPermalink }}">Next</a>
  {{ end }}
{{ end }}
```

这等价于使用 [`Prev`][] 和 [`Next`][] 方法：

```go-html-template
{{ $pages := .CurrentSection.Pages.ByWeight }}

{{ with $pages.Prev . }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with $pages.Next . }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

> [!TIP]
> 与 `Prev` 和 `Next` 不同，`IndexOf` 这种用法还能告诉你页面在集合中的位置，如本页开头的示例所示。

## 完整示例：位置与越界

示例沿用本章首页的[示例站点结构](/methods/pages/)，在单页模板里打印当前页在 `posts` section 中的位置：

```go-html-template {file="layouts/_default/single.html"}
{{ $pages := .CurrentSection.Pages.ByWeight }}
<p>{{ add ($pages.IndexOf .) 1 }} / {{ $pages.Len }}</p>
<p>原样下标：{{ $pages.IndexOf . }}</p>
<p>跨集合查询：{{ $pages.IndexOf (index site.RegularPages 0) }}</p>
```

访问 `post-2`（`bravo`，`weight = 20`）时，Hugo 渲染为：

```html
<p>2 / 4</p>
<p>原样下标：1</p>
<p>跨集合查询：-1</p>
```

**你应当看到什么**：`bravo` 是 `.ByWeight` 里的第 2 条，所以**下标是 1**，`add … 1` 之后才是 `2 / 4`；第三行故意去问「`site.RegularPages` 的第一页（属于 `books`）在 `posts` 集合里的位置」，得到 `-1`——**不在集合里就返回 −1，不报错**。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面在集合里（`alpha`/`bravo`/`charlie`/`delta`） | `0` / `1` / `2` / `3`（从 0 开始） | 否 |
| 页面不在集合里（别的 section 的页面） | `-1`（上游说明，实测确认） | 否 |
| 集合为空 | `-1` | 否 |
| 参数不是页面（`IndexOf "x"`） | —— | 是：`can't handle "x" for arg of type page.Page` |
| 不传参数 | —— | 是：`wrong number of args for IndexOf: want 1 got 0` |
| 返回类型 | `int`；`-1` 是真值判断可用的信号（`if ge $index 0`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 「第 N 篇」全部差 1 | `IndexOf` 从 0 开始 | 展示时 `add $index 1` |
| 没报错但结果不对 | 位置数字和列表顺序对不上 | 你用的集合排序与列表渲染用的不是同一个 | 两处都用同一个变量：`{{ $pages := .CurrentSection.Pages.ByWeight }}` |
| 报错看不懂 | `can't handle "x" for arg of type page.Page` | 参数传成了字符串 | 传页面对象，例如 `.` 或 `index $pages 0` |
| 报错看不懂 | `wrong number of args for IndexOf: want 1 got 0` | 忘了传页面 | 写成 `$pages.IndexOf .` |
| 报错看不懂 | `index out of range` | 用 `index $pages $index` 时没先判断 `-1` | 先 `{{ if ge $index 0 }}`，或直接用 `with index …` |

更多排查入口见[故障排查](/troubleshooting/)。

[`Next`]: /methods/pages/next/
[`Prev`]: /methods/pages/prev/
[`add`]: /functions/math/add/
[`index`]: /functions/collections/indexfunction/
[`sub`]: /functions/math/sub/
