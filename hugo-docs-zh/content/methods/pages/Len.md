+++
title = "Len"
linkTitle = "Len"
description = "返回给定页面集合中的页面数量。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/methods/pages/len/"

[params.functions_and_methods]
signatures = ["PAGES.Len"]
returnType = "int"
+++

## 这一页解决什么问题

数一个页面集合里有多少页。三个常见用途：

1. 判断集合是否为空（`{{ if .Pages.Len }}`，或更常用的 `{{ with .Pages }}`）；
2. 在页面上渲染「共 N 篇」；
3. 与 [`IndexOf`](/methods/pages/indexof/) 配合算「第 N 篇 / 共 M 篇」。

返回 `int`。**空集合返回 `0`，不报错**（实测）。

## 什么时候用，什么时候别用

**该用**：

- 需要数量本身，或需要判断「有没有内容」；
- 想给分页/归档页显示总数。

**别用**：

- 只想遍历 → 直接 `range`，不要先数一遍；
- 想判断空值就走 `if` → 集合本身在 `if`/`with` 里可用（空集合判为假），写 `{{ with .Pages }}` 比 `{{ if .Pages.Len }}` 更短，也更贴近 Go 模板的习惯；
- 想数**切片**里的元素（不只是页面）→ 用 Go 模板内建的 `len` 函数（`len .Params.tags`）。

## 用法

```go-html-template
{{ .Pages.Len }} → 42
```

## 完整示例：计数与空集合

示例沿用本章首页的[示例站点结构](/methods/pages/)。`posts` 有 4 页，`empty` section 一页都没有。

```go-html-template {file="layouts/_default/list.html"}
<p>{{ .LinkTitle }}：{{ .Pages.Len }} 篇</p>
<p>用 with 判断非空：{{ with .Pages }}有内容{{ else }}空集合{{ end }}</p>
<p>用 len 函数等价写法：{{ len .Pages }}</p>
```

`posts` section 渲染为：

```html
<p>Posts：4 篇</p>
<p>用 with 判断非空：有内容</p>
<p>用 len 函数等价写法：4</p>
```

`empty` section 渲染为：

```html
<p>Empty：0 篇</p>
<p>用 with 判断非空：空集合</p>
<p>用 len 函数等价写法：0</p>
```

**你应当看到什么**：`.Pages.Len` 与 `len .Pages` 结果一致；空集合这一边**不报错**，`Len` 给 `0`，`with` 走 `else` 分支。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `posts` section（4 个子页面） | `4` | 否 |
| 没有任何子页面的 section | `0`（**不报错**） | 否 |
| 空集合在 `if` / `with` 中 | 判为假，走 `else` | 否 |
| `len .Pages` 函数写法 | 与 `Len` 一致（`4` / `0`） | 否 |
| 返回类型 | `int` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 数字比预期多/少 | 集合里包含 section 页面（`.Pages` 与 `.RegularPages` 不同） | 只要普通页面就用 [`RegularPages`](/methods/page/regularpages/) 或 [`site.RegularPages`](/methods/site/regularpages/) |
| 没报错但结果不对 | 分页后的「共 N 篇」不对 | 数的是**当前分页**的集合 | 总数用分页器的 `.TotalNumberOfElements`（见[分页](/templates/pagination/)） |
| 报错看不懂 | `can't evaluate field Len in type ...` | 对象不是页面集合（例如单个页面） | 先取集合（`.Pages`、`.RegularPages`） |
| 报错看不懂 | 对单个页面用 `len` | `len` 只接受切片/映射/字符串 | 单个页面没有「长度」；要判断有没有值用 `with` |

更多排查入口见[故障排查](/troubleshooting/)。
