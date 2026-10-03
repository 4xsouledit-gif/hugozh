+++
title = "方法"
linkTitle = "方法"
description = "在模板中使用这些方法：Page、Site、Pages、Resource、Menu 等对象上的方法。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/"
aliases = ["/variables/"]

[params.teach]
difficulty = "参考"
time = "按需查阅；通读约 30 分钟"
prereq = [
  "知道 Go 模板的基本语法与「上下文」（`$`、`.`）的含义；不确定先读[模板简介](/templates/introduction/)。",
  "手边有一个能构建的站点，可以把方法直接放进模板里试。",
]
outcomes = [
  "分清**方法**与[函数](/functions/)：`$page.Title` 是方法，`strings.Truncate` 是函数；",
  "按对象（Page、Site、Pages、Resource、Menu…）找到需要的方法，而不是靠翻页；",
  "判断某个对象可能为 `nil`（例如 `.Next`、`.Parent`），并用 `with` 包住再取方法；",
  "看懂链式写法 `site.Home.Sections.ByWeight` 每一步返回的是什么。",
]
next = ["/functions/", "/templates/introduction/", "/methods/page/"]
+++

## 本章导读

模板里的能力分两半：**函数**是独立的工具（如 `strings.Truncate`），**方法**挂在某个对象上（如 `$page.Title`）。本章按对象分组收录 Hugo 内建的全部方法：`Page`、`Site`、`Pages`、`Resource`、`Menu`、`Taxonomy` 等。

方法的调用写法是「对象点方法」：

```go-html-template
{{ .Title }}              {{/* 当前页面的标题 */}}
{{ site.Home.Sections }}  {{/* 站点的全部一级章节 */}}
```

链式调用从左到右逐层取值：上面第二行先取 `site`，再取它的 `Home`，最后取 `Sections`。**中间任何一环是 `nil`，后面就会报 `nil pointer` 一类错误**，所以常见做法是用 `with` 先确认：

```go-html-template
{{ with .Next }}
  <a href="{{ .RelPermalink }}">{{ .Title }}</a>
{{ end }}
```

函数与方法的对照、以及命名空间（`hugo.`、`site.`、`strings.`）的含义，见[函数](/functions/)一章。
