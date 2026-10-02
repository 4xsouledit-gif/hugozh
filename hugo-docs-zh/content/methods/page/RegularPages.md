+++
title = "RegularPages"
linkTitle = "RegularPages"
description = "返回当前 section 内的常规页面集合。"
date = 2026-10-02
weight = 640
source = "https://gohugo.io/methods/page/regularpages/"

[params.functions_and_methods]
signatures = ["PAGE.RegularPages"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

列表页要显示「文章」，但不该把栏目页（section 的 `_index.md`）混进去。`.RegularPages` 就是**只要常规页面**的那一份集合：不含子 section 页、不含 taxonomy/term 页。

它在 `home`、`section`、`taxonomy`、`term` 四类页面上可用。最容易踩的坑是**首页**：首页的 `.RegularPages` 只含「直接放在 `content/` 根目录下的常规页面」，**不会递归**——实测本站首页的 `.RegularPages` 是空的，而 `.RegularPagesRecursive` 有 14 条。

## 什么时候用，什么时候别用

**该用**：

- section 首页只列文章（不要子栏目）；
- term 页（例如某个 tag 页）列出带该术语的文章；
- 想排除 `_index.md` 这类列表页。

**别用**：

- 需要连子栏目页一起列 → 用 [`.Pages`](/methods/page/pages/)；
- 需要整个子树的所有文章 → 用 [`.RegularPagesRecursive`](/methods/page/regularpagesrecursive/)；
- 只要子栏目 → 用 [`.Sections`](/methods/page/sections/)；
- 想拿**全站**所有常规页面 → 用 `.Site.RegularPages`（它是递归的；上游有说明）。

**四者对照（实测，同一测试站）**：

| 渲染的页面 | `.Pages` | `.RegularPages` | `.RegularPagesRecursive` | `.Sections` |
| --- | --- | --- | --- | --- |
| `/`（首页） | 2（`/posts`、`/docs`） | **0** | 14 | 2 |
| `/posts/` | 10 | 10 | 10 | 0 |
| `/docs/` | 2（`/docs/guide`、`/docs/ref`） | 1（`/docs/ref`） | 4 | 1 |
| `/docs/guide/` | 3 | 3 | 3 | 0 |
| `/tags/`（taxonomy） | 2（术语页） | 0 | 0 | 0 |
| `/tags/alpha/`（term） | 3 | 3 | 3 | 0 |

## 用法

`Page` 对象上的 `RegularPages` 方法可用于这些[页面类型](g)：`home`、`section`、`taxonomy` 和 `term`。这些页面类型的模板会在[上下文](g)中接收一个页面[集合](g)，并按[默认排序顺序](g)排列。

在模板中遍历该页面集合：

```go-html-template
{{ range .RegularPages.ByTitle }}
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

渲染首页时，`RegularPages` 方法返回：

    contact.md
    legal.md

渲染 lessons 页面时，`RegularPages` 方法返回：

    lessons/grading-policy.md
    lessons/lesson-plan.md

渲染 lesson-1 时，`RegularPages` 方法返回：

    lessons/lesson-1/part-1.md
    lessons/lesson-1/part-2.md

渲染 lesson-2 时，`RegularPages` 方法返回：

    lessons/lesson-2/part-1.md
    lessons/lesson-2/part-2.md
    lessons/lesson-2/resources/task-list.md
    lessons/lesson-2/resources/worksheet.md

最后一个例子中，集合包含了 resources 子目录里的页面。该目录并不是一个 [section](g)——它不含&nbsp;`_index.md`&nbsp;文件。它的内容属于 lesson-2 这个 section。

> [!NOTE]
> 与 `Site` 对象一起使用时，`RegularPages` 方法会递归返回站点内的所有常规页面。详见[说明][]。

```go-html-template
{{ range .Site.RegularPages.ByTitle }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

## 完整示例：section 文章列表

测试站的 `content/posts/` 下有 10 个常规页面、没有子 section；`content/docs/` 下有 1 个常规页面（`ref.md`）和 1 个子 section（`guide/`）。

模板：

```go-html-template {file="layouts/_default/list.html"}
<ul>
  {{ range .RegularPages.ByWeight }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

实测渲染 `/docs/`（Hugo 0.167.0）：

```html
<ul>
  <li><a href="/docs/ref/">参考</a></li>
</ul>
```

若把模板换成 `range .Pages`，`/docs/` 会多出一项 `/docs/guide/`（子栏目的 section 页）——这就是两者的差别。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| section 有常规页面 | 返回这些页面（实测 `/posts/` 10 条） | 否 |
| section 只有子栏目、没有常规页面 | 空集合（`len` 为 0） | 否 |
| 首页 | 只含 `content/` 根目录下的常规页面；本站为 0 条（实测） | 否 |
| taxonomy 页 | 空集合（实测 `/tags/` 为 0） | 否 |
| term 页 | 带该术语的常规页面（实测 `/tags/alpha/` 3 条） | 否 |
| 常规内容页 | 空集合 | 否 |
| `.Site.RegularPages` | 递归返回全站常规页面（实测 14 条） | 否 |
| 返回类型 | `page.Pages`（可 `.ByTitle`、`.ByWeight`、可交给 `where`） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[details]: /methods/site/regularpages/
