+++
title = "collections.Shuffle"
linkTitle = "shuffle"
description = "把给定切片中的元素顺序随机打乱后返回。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/functions/collections/shuffle/"

[params.functions_and_methods]
signatures = ["collections.Shuffle SLICE"]
returnType = "[]any"
aliases = ["shuffle"]
+++

## 这一页解决什么问题

`shuffle` 随机打乱一个切片，用来做「随机推荐」「随机抽取」。它最需要提前知道的特性是：**结果每次构建都会不同**（上游已说明）——这意味着构建产物不稳定；如果你需要可复现的随机（同一 seed 固定结果），上游推荐改用 [`collections.D`](/functions/collections/d/)，而且更快。

## 什么时候用，什么时候别用

**该用**：

- 页面上的「随便看看」「随机推荐」，且接受每次构建都换一批；
- 想打乱**整个列表**（不打乱整表只想抽样，用 [`collections.D`](/functions/collections/d/) 更直接）。

**别用**：

- 需要稳定输出（RSS、增量部署、缓存、快照测试）→ 用 [`collections.D`](/functions/collections/d/)（实测同一 seed 跨构建结果一致）；
- 想「每天换一批但当天稳定」→ 用 `collections.D` 并以 `time.Now.YearDay` 作 seed；
- 想按条件筛选 → 用 [`collections.Where`](/functions/collections/where/)。

## 用法

```go-html-template
{{ collections.Shuffle (slice "a" "b" "c") }} → [b a c]
```

结果每次构建都会不同。

要从页面集合中渲染 5 个随机页面的无序列表：

```go-html-template
<ul>
  {{ $p := site.RegularPages }}
  {{ range $p | collections.Shuffle | first 5 }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

（0.149.0 新增）

用 [`collections.D`][] 函数完成同样的任务会快得多。

## 完整示例：打乱后取前三项

```go-html-template {file="layouts/_partials/random.html"}
{{ $p := slice "a" "b" "c" "d" "e" }}
<p>{{ $p | collections.Shuffle | first 3 }}</p>
<p>长度不变：{{ len (collections.Shuffle $p) }}</p>
<p>空切片：{{ collections.Shuffle (slice) }}</p>
```

Hugo 渲染为（第一行每次构建都不同，这里不给出固定值）：

```html
<p>[…]（元素个数是 3，顺序每次构建都会变，此处不给出固定值）</p>
<p>长度不变：5</p>
<p>空切片：[]</p>
```

**你应当看到什么**：第一行的元素个数恒为 3，但**顺序每次构建都不同**；`shuffle` 不增删元素，所以 `len` 与输入一致（实测 3 元素切片打乱后长度仍是 3）；空切片返回空切片。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 空切片 | 空切片 | 否 |
| 元素个数 | 与输入相同（实测 `len` 不变） | 否 |
| 顺序 | 每次构建不同（上游已说明） | 否 |
| 输入是字符串 | —— | 是：`error calling shuffle: reflect.MakeSlice of non-slice type` |
| 输入是 `nil` | —— | 是：`error calling shuffle: both count and seq must be provided` |
| 返回类型 | `[]any`（与输入元素同类） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 每次构建产出的 HTML 都不一样，导致 diff 噪声 | 该函数的结果**不固定**（上游已说明） | 需要稳定就换 [`collections.D`](/functions/collections/d/) |
| 没报错但结果不对 | 每次刷新页面没变化 | 构建产物是静态的，随机发生在**构建时**而不是浏览器里 | 想每次访问都变需要客户端脚本；静态站点做不到 |
| 报错看不懂 | `reflect.MakeSlice of non-slice type` | 传了字符串 | 先 `split` 成切片 |
| 报错看不懂 | `both count and seq must be provided` | 传了 `nil` | 先用 `with` 判空 |

更多排查入口见[故障排查](/troubleshooting/)。

[`collections.D`]: /functions/collections/d/
