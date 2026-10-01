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

[details]: /methods/site/regularpages/
