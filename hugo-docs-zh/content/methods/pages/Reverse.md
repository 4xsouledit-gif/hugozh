+++
title = "Reverse"
linkTitle = "Reverse"
description = "返回给定页面集合的反序结果。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/methods/pages/reverse/"

[params.functions_and_methods]
signatures = ["PAGES.Reverse"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

把集合**整体倒过来**。这是本章最省事的一个方法：Hugo 没有为每个排序方法配一个「降序版」，需要降序时一律在排序后面接 `.Reverse`。

它**不排序**，只是反转当前顺序。返回值是新集合，原集合不变。

## 什么时候用，什么时候别用

**该用**：

- 想要降序：`.ByDate.Reverse`、`.ByWeight.Reverse`、`.ByTitle.Reverse`；
- 想让 [`Next`](/methods/pages/next/) / [`Prev`](/methods/pages/prev/) 的方向符合直觉（见那两页的说明）。

**别用**：

- 期望它「重新排序」→ 它只反转，顺序取决于前面的集合；
- 想在反转前丢掉某些页面 → 先 [`collections.Where`](/functions/collections/where/)，再做 `Reverse`；顺序不同结果不同；
- 想按索引取数 → 反转后下标也会变，配合 [`IndexOf`](/methods/pages/indexof/) 时注意。

## 用法

```go-html-template
{{ range .Pages.ByDate.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：Reverse 到底反转了什么

示例沿用本章首页的[示例站点结构](/methods/pages/)。`posts` 的**默认顺序**是 `alpha bravo charlie delta`（`weight` 10/20/30，`post-4` 未设权重），`ByDate` 升序是 `charlie alpha bravo delta`。

```go-html-template {file="layouts/_default/list.html"}
默认：{{ range .Pages }}{{ .LinkTitle }} {{ end }}
默认反转：{{ range .Pages.Reverse }}{{ .LinkTitle }} {{ end }}
日期升序：{{ range .Pages.ByDate }}{{ .LinkTitle }} {{ end }}
日期降序：{{ range .Pages.ByDate.Reverse }}{{ .LinkTitle }} {{ end }}
```

Hugo 渲染为：

```html
默认：alpha bravo charlie delta 
默认反转：delta charlie bravo alpha 
日期升序：charlie alpha bravo delta 
日期降序：delta bravo alpha charlie 
```

**你应当看到什么**：`默认反转` 恰好是 `默认` 的**倒序**；`日期降序` 恰好是 `日期升序` 的倒序。注意「默认反转」与「日期降序」是**不同的结果**——`Reverse` 只是把手上那个集合翻过来，排序依然由前面的方法决定。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `.Pages.Reverse` | 默认顺序的倒序：`delta charlie bravo alpha` | 否 |
| `.ByDate.Reverse` | 日期升序的倒序：`delta bravo alpha charlie` | 否 |
| 空集合 | 空集合（仍是空集合，`range` 无输出） | 否 |
| 反转后再 `Limit` | 取的是**反转后**的前 N 个（与先 `Limit` 再 `Reverse` 不同） | 否 |
| 返回类型 | `page.Pages` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `Reverse` 之后顺序看起来「没按日期」 | 它只反转当前集合，前面的集合不是按日期排的 | 先排序再加 `.Reverse`：`.ByDate.Reverse` |
| 没报错但结果不对 | `Reverse` 与 `first N` 的先后写反 | 先取前 N 再反转 ≠ 先反转再取前 N | 想「最新的 N 条」就写 `.ByDate.Reverse` 后接 `Limit N` |
| 没报错但结果不对 | 未加权的页面跑到了降序列表最前 | 未加权页面 `.Weight` 为 0，排在末尾；反转后到了最前 | 先 `where` 掉权重为 0 的页面 |
| 报错看不懂 | `can't evaluate field Reverse in type ...` | 对象不是页面集合 | 先取集合（`.Pages`、`.RegularPages`、`.ByDate` 等） |

更多排查入口见[故障排查](/troubleshooting/)。
