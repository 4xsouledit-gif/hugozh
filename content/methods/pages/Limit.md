+++
title = "Limit"
linkTitle = "Limit"
description = "返回给定页面集合中的前 N 个页面。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/methods/pages/limit/"

[params.functions_and_methods]
signatures = ["PAGES.Limit N"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

从集合里**取前 N 个**：首页「最新 5 篇」、「热门 3 条」这类场景。

它取的是**集合当前顺序**的前 N 个，所以通常先排序再限量：

```text
.Pages.ByDate.Reverse | first 5      ← 逻辑上的「最新 5 篇」
.Pages.ByDate.Reverse.Limit 5        ← 写法之一
```

`N` 大于集合长度时返回整个集合（不报错）；`N` 为 `0` 时返回空集合；**`N` 为负数会直接让构建失败**（实测）。

## 什么时候用，什么时候别用

**该用**：

- 「只要前几条」的摘要区，避免在模板里写计数器；
- 与大集合配合减少渲染量（`.RegularPages` 上千页时尤其实用）。

**别用**：

- 想要**分页**（带页码导航）→ 用[分页器](/templates/pagination/)，`.Limit` 不分页；
- 想要「跳过前 N 条」→ `Limit` 只有「取前」，没有 offset；用 [`collections.After`](/functions/collections/after/)；
- 想随机取 → 用 [`collections.Shuffle`](/functions/collections/shuffle/)；
- 需要按条件取 → 先 [`collections.Where`](/functions/collections/where/)，再 `Limit`。

## 用法

```go-html-template
{{ range .Pages.Limit 3 }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：排序后取前几条

示例沿用本章首页的[示例站点结构](/methods/pages/)（`posts` 的默认顺序是 `alpha bravo charlie delta`）。

```go-html-template {file="layouts/_default/list.html"}
默认顺序取 2：{{ range .Pages.Limit 2 }}{{ .LinkTitle }} {{ end }}
最新 2 篇：{{ range .Pages.ByDate.Reverse.Limit 2 }}{{ .LinkTitle }} {{ end }}
取 0 条：{{ range .Pages.Limit 0 }}{{ .LinkTitle }} {{ end }}
超出长度：{{ range .Pages.Limit 100 }}{{ .LinkTitle }} {{ end }}
```

Hugo 渲染为：

```html
默认顺序取 2：alpha bravo 
最新 2 篇：delta bravo 
取 0 条：
超出长度：alpha bravo charlie delta 
```

**你应当看到什么**：第一行是**默认顺序**的前两条（`alpha`、`bravo`）；第二行先 `ByDate.Reverse` 再限量，拿到真正的最新两篇（`delta`、`bravo`）；`Limit 0` 输出为空（**不报错**）；`Limit 100` 返回全部四页（**不报错**）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `Limit 2`（集合 4 页） | 默认顺序的前两页 | 否 |
| `Limit 0` | 空集合：`range` 无输出，`Len` 为 0 | 否 |
| `Limit 100`（超出长度） | 整个集合（4 页全给） | 否 |
| `Limit -1` | —— | 是：`error calling Limit: runtime error: slice bounds out of range [:-1]` |
| `N` 是字符串（`Limit "2"`） | —— | 是：`expected integer; found "2"` |
| `N` 是小数（`Limit 2.5`） | —— | 是：`expected integer; found 2.5` |
| 空集合上 `Limit 3` | 空集合，无输出 | 否 |
| 返回类型 | `page.Pages`（可继续 `Reverse`、`range`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `slice bounds out of range [:-1]` | `N` 是负数（常见于由变量算出来的值） | 先兜底：`{{ $n := cond (gt $n 0) $n 1 }}`，再传给 `Limit` |
| 报错看不懂 | `expected integer; found "2"` | `N` 从配置/参数里来，是字符串 | 用 [`cast.ToInt`](/functions/cast/toint/) 转换 |
| 没报错但结果不对 | 「最新 5 篇」不是最新的 | 忘了先排序，取的是集合默认顺序 | 先 `.ByDate.Reverse`（或 `.ByWeight`）再 `Limit` |
| 没报错但结果不对 | 列表在分页第 2 页时内容重复 | `Limit` 与分页器混用 | 分页交给分页器；`Limit` 只用于「就取前几条」 |

更多排查入口见[故障排查](/troubleshooting/)。
