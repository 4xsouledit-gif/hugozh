+++
title = "Pages"
linkTitle = "Pages"
description = "返回当前 section 内的常规页面集合，以及直属子 section 的 section 页面。"
date = 2026-10-02
weight = 480
source = "https://gohugo.io/methods/page/pages/"

[params.functions_and_methods]
signatures = ["PAGE.Pages"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

`home`、`section`、`taxonomy`、`term` 这几类页面（列表页）的模板里，最常见的任务是「把下面的页面列出来」。`.Pages` 就是这份列表：**当前层的常规页面 + 直属子 section 的 section 页面**，按默认排序顺序给出。

它最容易被和另外三个方法搞混，先记住一句话：

| 方法 | 包含什么 | 递归吗 |
| --- | --- | --- |
| `.Pages` | 当前层的常规页面 + 直属子 section 页 | 否 |
| [`.RegularPages`](/methods/page/regularpages/) | 只含当前层的**常规页面**（不含子 section 页） | 否 |
| [`.RegularPagesRecursive`](/methods/page/regularpagesrecursive/) | 当前层及所有后代 section 的常规页面 | 是 |
| [`.Sections`](/methods/page/sections/) | 只含直属子 section 页 | 否（只一层） |

## 什么时候用，什么时候别用

**该用**：

- section 首页列出「本 section 的文章 + 子栏目」；
- 首页列出所有顶层 section（配合 `.Sections` 更精确，见上表）；
- taxonomy 页列出所有术语、term 页列出带该术语的文章。

**别用**：

- 只要文章、不要栏目页 → 用 [`.RegularPages`](/methods/page/regularpages/)；
- 要「整个子树的所有文章」→ 用 [`.RegularPagesRecursive`](/methods/page/regularpagesrecursive/)；
- 只要子栏目 → 用 [`.Sections`](/methods/page/sections/)；
- 在常规内容页上调用 → 实测返回空集合（`len` 为 0），它只服务于列表页。

## 用法

`Page` 对象上的 `Pages` 方法可用于这些[页面类型](g)：`home`、`section`、`taxonomy` 和 `term`。这些页面类型的模板会在[上下文](g)中接收一个页面[集合](g)，并按[默认排序顺序](g)排列。

在模板中遍历该页面集合：

```go-html-template
{{ range .Pages.ByTitle }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

考虑如下内容结构：

```tree
content/
├── lessons/
│   ├── lesson-1/
│   │   ├── _index.md
│   │   ├── part-1.md
│   │   └── part-2.md
│   ├── lesson-2/
│   │   ├── resources/
│   │   │   ├── task-list.md
│   │   │   └── worksheet.md
│   │   ├── _index.md
│   │   ├── part-1.md
│   │   └── part-2.md
│   ├── _index.md
│   ├── grading-policy.md
│   └── lesson-plan.md
├── _index.md
├── contact.md
└── legal.md
```

渲染首页时，`Pages` 方法返回：

    contact.md
    legal.md
    lessons/_index.md

渲染 lessons 页面时，`Pages` 方法返回：

    lessons/grading-policy.md
    lessons/lesson-plan.md
    lessons/lesson-1/_index.md
    lessons/lesson-2/_index.md

渲染 lesson-1 时，`Pages` 方法返回：

    lessons/lesson-1/part-1.md
    lessons/lesson-1/part-2.md

渲染 lesson-2 时，`Pages` 方法返回：

    lessons/lesson-2/part-1.md
    lessons/lesson-2/part-2.md
    lessons/lesson-2/resources/task-list.md
    lessons/lesson-2/resources/worksheet.md

最后一个例子中，集合包含了 resources 子目录里的页面。该目录并不是一个 [section](g)——它不含&nbsp;`_index.md`&nbsp;文件。它的内容属于 lesson-2 这个 section。

> [!NOTE]
> 与 `Site` 对象一起使用时，`Pages` 方法会递归返回站点内的所有页面。详见[说明][]。

```go-html-template
{{ range .Site.Pages.ByTitle }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

## 完整示例：三种列表页各拿到什么

测试站结构（HTTP 路径即逻辑路径）：

```tree
content/
├── _index.md
├── posts/           <-- 8 个常规页面，无子 section
├── docs/
│   ├── _index.md
│   ├── ref.md
│   └── guide/       <-- 3 个常规页面
└── _index.md        <-- 分类法由 tags 生成
```

模板：

```go-html-template {file="layouts/_default/list.html"}
<p>本层页面：{{ range .Pages }}{{ .Path }} {{ end }}</p>
```

实测（Hugo 0.167.0）：

| 渲染的页面 | kind | `range .Pages` 得到 |
| --- | --- | --- |
| `/` | home | `/posts` `/docs` |
| `/posts/` | section | 8 个常规页面（`/posts/post-1` … `/posts/no-sitemap`） |
| `/docs/` | section | `/docs/guide` `/docs/ref` |
| `/tags/` | taxonomy | `/tags/alpha` `/tags/beta`（术语页） |
| `/tags/alpha/` | term | 带该标签的 3 个常规页面 |

**你应当看到什么**：`/docs/` 的列表里既有子 section（`/docs/guide`）又有常规页面（`/docs/ref`）；而 `/posts/` 的列表里全是常规页面。这就是「常规页面 + 直属子 section 页」的准确含义。注意 `/` 的 `.Pages` **只有两个顶层 section**——它不会把 `/posts/post-1` 这种深层页面带上来。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 首页、section、taxonomy、term 页 | 一个 `page.Pages` 集合（可能为空） | 否 |
| 常规内容页 | 空集合，`len` 为 0，在 `if` 中为假（实测） | 否 |
| 没有任何子页面/子 section 的 section | 空集合 | 否 |
| 与 `.Site.Pages` 的区别 | `.Site.Pages` 递归返回站点全部页面（含列表页）；`.Pages` 只返回当前层 | 否 |
| 排序 | [默认排序顺序](g)；要固定顺序用 `.Pages.ByTitle`、`.ByWeight`、`.ByDate` | 否 |
| 返回类型 | `page.Pages`（可 `range`、可 `.ByXxx`、可交给 `where`） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[details]: /methods/site/pages/
