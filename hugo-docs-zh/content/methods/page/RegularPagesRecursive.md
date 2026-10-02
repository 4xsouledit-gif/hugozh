+++
title = "RegularPagesRecursive"
linkTitle = "RegularPagesRecursive"
description = "返回当前 section 内的常规页面集合，以及所有后代 section 内的常规页面。"
date = 2026-10-02
weight = 650
source = "https://gohugo.io/methods/page/regularpagesrecursive/"

[params.functions_and_methods]
signatures = ["PAGE.RegularPagesRecursive"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

`.RegularPagesRecursive` 返回**当前层及其所有后代 section** 里的常规页面——一条命令拿到整棵子树的文章。做「归档」「全部文章」「sitemap 里列内容页」时，它就是标准答案。

在首页上它等于 `.Site.RegularPages`（实测两者都是 14 条）；在中间层 section 上，它比 [`.RegularPages`](/methods/page/regularpages/) 多出所有子孙页面的内容。

## 什么时候用，什么时候别用

**该用**：

- 首页/栏目页做「全站或整个子树的文章归档」；
- 生成按时间排序的总目录（配合 `.ByDate.Reverse`）；
- 一次拿到深层页面，避免手写递归。

**别用**：

- 只想列**本层**文章 → 用 [`.RegularPages`](/methods/page/regularpages/)；
- 想连子栏目页一起列 → 用 [`.Pages`](/methods/page/pages/)；
- 想用于 `Site` 对象 → 上游明确说明：`RegularPagesRecursive` **不能**用于 `Site` 对象（用 `.Site.RegularPages` 即可，那本来就是递归的）。

**对照（实测，同一测试站）**：

| 渲染的页面 | `.RegularPages` | `.RegularPagesRecursive` |
| --- | --- | --- |
| `/`（首页） | 0 | 14 |
| `/posts/`（无子 section） | 10 | 10 |
| `/docs/`（含子 section `guide/`） | 1 | 4 |
| `/docs/guide/` | 3 | 3 |
| `/tags/`（taxonomy 页） | 0 | 0 |

## 用法

`Page` 对象上的 `RegularPagesRecursive` 方法可用于这些[页面类型](g)：`home`、`section`、`taxonomy` 和 `term`。这些页面类型的模板会在[上下文](g)中接收一个页面[集合](g)，并按[默认排序顺序](g)排列。

在模板中遍历该页面集合：

```go-html-template
{{ range .RegularPagesRecursive.ByTitle }}
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

渲染首页时，`RegularPagesRecursive` 方法返回：

    contact.md
    lessons/grading-policy.md
    legal.md
    lessons/lesson-plan.md
    lessons/lesson-2/part-1.md
    lessons/lesson-1/part-1.md
    lessons/lesson-2/part-2.md
    lessons/lesson-1/part-2.md
    lessons/lesson-2/resources/task-list.md
    lessons/lesson-2/resources/worksheet.md

渲染 lessons 页面时，`RegularPagesRecursive` 方法返回：

    lessons/grading-policy.md
    lessons/lesson-plan.md
    lessons/lesson-2/part-1.md
    lessons/lesson-1/part-1.md
    lessons/lesson-2/part-2.md
    lessons/lesson-1/part-2.md
    lessons/lesson-2/resources/task-list.md
    lessons/lesson-2/resources/worksheet.md

渲染 lesson-1 时，`RegularPagesRecursive` 方法返回：

    lessons/lesson-1/part-1.md
    lessons/lesson-1/part-2.md

渲染 lesson-2 时，`RegularPagesRecursive` 方法返回：

    lessons/lesson-2/part-1.md
    lessons/lesson-2/part-2.md
    lessons/lesson-2/resources/task-list.md
    lessons/lesson-2/resources/worksheet.md

> [!NOTE]
> `RegularPagesRecursive` 方法不能用于 `Site` 对象。

## 完整示例：首页归档

测试站内容结构：`/posts/`（10 个常规页面，无子 section）、`/docs/ref.md` 与 `/docs/guide/`（3 个常规页面）。

首页模板：

```go-html-template {file="layouts/index.html"}
<p>全站文章数：{{ len .RegularPagesRecursive }}</p>
<ul>
  {{ range .RegularPagesRecursive.ByWeight }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

实测（Hugo 0.167.0）：

```html
<p>全站文章数：14</p>
```

**你应当看到什么**：首页的 `.RegularPagesRecursive` 是 **14**，而首页的 `.RegularPages` 是 **0**（因为根目录下没有直接放的常规页面）。这就是「递归」带来的差别；同样的模板放在 `/docs/` 上会得到 4，放在 `/docs/guide/` 上会得到 3。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 首页 | 全站常规页面（实测 14 条，与 `.Site.RegularPages` 一致） | 否 |
| 有子 section 的 section | 本层 + 所有后代（实测 `/docs/` 为 4，而 `.RegularPages` 为 1） | 否 |
| 无子 section 的 section | 与 `.RegularPages` 相同（实测 `/posts/` 为 10） | 否 |
| taxonomy 页 | 按上游规则可用；实测空集合（0 条） | 否 |
| term 页 | 带该术语的常规页面（实测 3 条） | 否 |
| 常规内容页 | 空集合 | 否 |
| 用于 `Site` 对象 | —— | 上游明确说明不可用 |
| 返回类型 | `page.Pages` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
