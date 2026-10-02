+++
title = "全局函数"
linkTitle = "global"
description = "在任何模板里直接取页面或站点对象：page 与 site 两个全局函数。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/global/"

[params.teach]
difficulty = "参考"
time = "按需查阅"
prereq = [
  "知道模板里的「上下文」`.` 是什么（不确定先读[模板简介](/templates/introduction/)）。",
]
outcomes = [
  "在**上下文不是页面**的地方（例如数据模板、`_partials` 里被单独调用）拿到页面或站点对象；",
  "分清 `page` 全局函数与 `$` / `.` 的区别，知道什么时候必须用它；",
  "避免为拿到 `site` 而层层传参。",
]
next = ["/methods/page/", "/methods/site/", "/functions/templates/"]
+++

## 这一组包含什么

| 函数 | 用途 |
| --- | --- |
| [`page`](/functions/global/page/) | 取**当前页面**对象，等价于模板里常用的 `.`（在 `.` 已经指向别的值时就很有用） |
| [`site`](/functions/global/site/) | 取**站点**对象，用于 `site.Params`、`site.Home`、`site.Language` 等 |
## 什么时候必须用它们

在普通页面模板里，`.` 就是页面对象，直接写 `.Title` 即可。但这两种场合拿不到：

- **局部模板被单独调用**时，`.` 可能是你传进去的一个字符串或字典——要在这里访问站点设置，用 `site`；
- **`range` 循环体内**，`.` 变成了当前元素——要在这里访问外层页面，用 `page`（或先把页面存进变量）。

```go-html-template
{{ range .Pages }}
  {{/* 这里的 . 是当前页面 */}}
  <a href="{{ .RelPermalink }}">{{ .Title }}</a>
  {{/* 要访问站点标题： */}}
  <span>{{ site.Title }}</span>
{{ end }}
```

页面与站点上的可用方法见[方法](/methods/page/)与[方法](/methods/site/)。

下方列出本站收录的本组全部函数。
