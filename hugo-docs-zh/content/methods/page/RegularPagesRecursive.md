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
