+++
title = "Lastmod"
linkTitle = "Lastmod"
description = "返回站点内容的最后修改日期。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/site/lastmod/"

[params.functions_and_methods]
signatures = ["SITE.Lastmod"]
returnType = "time.Time"
+++

## 这一页解决什么问题

`Lastmod` 返回**整站内容里最晚的那个日期**，是一个 [`time.Time`](g) 值。它回答「这个站点最近一次有内容变化是什么时候」，典型用途是页脚的「最后更新」和 feed 的构建时间。

它和页面的 `.Lastmod` 不是一回事：页面的 `.Lastmod` 是**那一页**的修改时间（见 [methods/page/lastmod](/methods/page/lastmod/)），而站点级的是所有页面里最晚的那个。

## 什么时候用，什么时候别用

**该用**：

- 页脚、feed、sitemap 里显示「本站内容最后更新于 …」；
- 需要给整站输出一个时间戳时。

**别用**：

- 想取某一页的修改时间 → 用页面的 `.Lastmod`，或列表里 `range` 后逐页读；
- 想表示「本次构建时间」→ 用 `now`；
- 用 `{{ with .Site.Lastmod }}` 判断「有没有日期」→ **永远为真**：`time.Time` 是结构体，不是空值。实测没有可解析日期时它返回零值 `0001-01-01 00:00:00 +0000 UTC`，必须用 `.IsZero` 判断。

## 用法

`Site` 对象上的 `Lastmod` 方法返回一个 [`time.Time`][] 值。请把它与时间[函数][]和[方法][]配合使用。例如：

```go-html-template
{{ .Site.Lastmod | time.Format ":date_long" }} → January 31, 2024

```

## 完整示例（实测）

站点内容中最晚的页面日期为 `2023-05-03T09:00:00-07:00` 时，在任意模板中：

```go-html-template {file="layouts/_partials/footer.html"}
{{ with .Site.Lastmod }}
  {{ if not .IsZero }}
    <p>本站最后更新：{{ . | time.Format ":date_long" }}</p>
  {{ end }}
{{ end }}
<time datetime="{{ .Site.Lastmod.Format "2006-01-02T15:04:05Z07:00" }}">{{ .Site.Lastmod.Format "2006-01-02" }}</time>
```

Hugo 渲染为：

```html
<p>本站最后更新：May 3, 2023</p>
<time datetime="2023-05-03T09:00:00-07:00">2023-05-03</time>
```

同一份值在不同写法下的实测结果（`timeZone = 'America/Los_Angeles'`）：

| 写法 | 实测输出 |
| --- | --- |
| `{{ .Site.Lastmod }}` | `2023-05-03 09:00:00 -0700 -0700` |
| `{{ .Site.Lastmod.Format "2006-01-02" }}` | `2023-05-03` |
| `{{ .Site.Lastmod \| time.Format ":date_long" }}` | `May 3, 2023` |
| `{{ .Site.Lastmod.Format "Mon, 02 Jan 2006 15:04:05 MST" }}` | `Wed, 03 May 2023 09:00:00 -0700` |

**你应当看到什么**：`:date_long` 是**本地化**格式，输出语言由站点 `locale` 决定（本实测为 `en-US`，故为英文 `May 3, 2023`）；`Format` 则是按 Go 参考时间精确控制，机器可读的 `<time datetime>` 用后者。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；两个站点分别测量（一个所有页面都带 `date`，一个完全不带日期）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 内容中有 `date` | 返回其中最晚的一个（不一定是「最近创建的页面」，而是日期最大的） | 否 |
| 内容里没有任何日期 | 零值 `0001-01-01 00:00:00 +0000 UTC`，`.IsZero` → `true` | 否 |
| `{{ with .Site.Lastmod }}` | **始终成立**（`time.Time` 是结构体），不能用来判断有无日期 | 否 |
| `printf "%T" .Site.Lastmod` | `time.Time` | 否 |
| 与 `now` 比较 | 可直接比较（同为 `time.Time`） | 否 |

[`time.Time`]: https://pkg.go.dev/time#Time
[函数]: /functions/time/
[方法]: /methods/time/
