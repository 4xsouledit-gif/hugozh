+++
title = "collections.D"
linkTitle = "D"
description = "根据给定的种子、数量和最大值，返回一个已排序且互不重复的随机整数切片。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/collections/d/"

[params.functions_and_methods]
signatures = ["collections.D SEED N HIGH"]
returnType = "[]int"
+++

## 这一页解决什么问题

`collections.D` 从 `[0, HIGH)` 里随机取出 `N` 个**互不重复**的整数，并**升序返回**：

```text
collections.D SEED N HIGH
                │    │ └─ 取数范围 [0, HIGH)
                │    └─── 取几个（N 大于 HIGH 时返回整个区间）
                └──────── 种子：同一个 seed 永远得到同一组数
```

它的典型用途是从页面集合里「随机挑几个页面」：拿到一组下标后配合 `index $pages .` 取出页面。相比 [`collections.Shuffle`](/functions/collections/shuffle/)，上游指出它更快；而且因为结果由 seed 决定，**实测同一个 seed 跨构建结果一致**——既能「随机」又不会让站点产物每次构建都抖动。

## 什么时候用，什么时候别用

**该用**：

- 随机推荐／随机抽样，但希望结果**可控可复现**；
- 「每天换一批、当天稳定」：seed 用 `time.Now.YearDay`（上游示例）；
- 「每个页面固定一批」：seed 用 `hash.FNV32a .Path`（上游示例）。

**别用**：

- 想打乱**整个列表** → 用 [`collections.Shuffle`](/functions/collections/shuffle/)（结果每次构建都变）；
- 想按条件筛选页面 → 用 [`collections.Where`](/functions/collections/where/)；
- 对安全性有要求的随机（密码、令牌）→ 上游未说明本函数的随机性是否适用于安全场景。

## 用法

（0.149.0 新增）

`collections.D` 函数使用给定的 [`SEED`](g) 值，返回半开[区间](g) `[0, HIGH)` 内一组已排序且互不重复的随机整数。结果切片的元素个数为 `N` 与 `HIGH` 中较小的那个。

- `N` 和 `H` 必须是闭区间 `[0, 1000000]` 内的整数
- `SEED` 必须是闭区间 `[0, 2^64 - 1]` 内的整数

### 返回值

条件|返回值
:--|:--|:--
`N <= HIGH`|使用 J. S. Vitter 的 [Method D][] 做顺序随机抽样，得到大小为 `N` 的有序随机样本
`N > HIGH`|完整的已排序区间 `[0, HIGH)`，大小为 `HIGH`
`N == 0`|空切片
`N < 0`|错误
`N > 10^6`|错误
`HIGH == 0`|空切片
`HIGH < 0`|错误
`HIGH > 10^6`|错误
`SEED < 0`|错误

### 示例

```go-html-template
{{ collections.D 6 7 42 }} → [4, 9, 10, 20, 22, 24, 41]
```

上面的示例每次调用都会生成_相同_的随机数。要在同一区间内生成_不同_的一组 7 个随机数，请修改 seed 值。

```go-html-template
{{ collections.D 2 7 42 }} → [3, 11, 19, 25, 32, 33, 38]
```

当 `N` 大于 `HIGH` 时，该函数返回完整的已排序区间 [0, `HIGH`)，大小为 `HIGH`：

```go-html-template
{{ collections.D 6 42 7 }} → [0 1 2 3 4 5 6]
```

一个常见的用例是从页面集合中随机挑选页面。例如，以[一年中的第几天][day of the year]作为 seed 值，渲染 5 个随机页面的列表：

```go-html-template
<ul>
  {{ $p := site.RegularPages }}
  {{ range collections.D time.Now.YearDay 5 ($p | len) }}
    {{ with (index $p .) }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  {{ end }}
</ul>
```

上面这种写法比使用 [`collections.Shuffle`][] 函数快得多。

### Seed 值

选择合适的 seed 值取决于你的目标。

目标|seed 示例
:--|:--
结果一致|`42`
每次调用结果不同|`int time.Now.UnixNano`
每天结果相同|`time.Now.YearDay`
每个页面结果相同|`hash.FNV32a .Path`
每个页面每天结果不同|`hash.FNV32a (print .Path time.Now.YearDay)`

## 完整示例：同一 seed 结果固定

```go-html-template {file="layouts/_partials/random-posts.html"}
<p>{{ collections.D 42 3 5 }}</p>
<p>同一 seed 再取一次：{{ collections.D 42 3 5 }}</p>
<p>换 seed：{{ collections.D 7 5 100 }}</p>
<p>N 为 0：{{ collections.D 42 0 6 }}（长度 {{ len (collections.D 42 0 6) }}）</p>
<p>HIGH 为 0：{{ collections.D 42 3 0 }}（长度 {{ len (collections.D 42 3 0) }}）</p>
<p>N 为 1：{{ collections.D 42 1 6 }}</p>
```

Hugo 渲染为：

```html
<p>[0 3 4]</p>
<p>同一 seed 再取一次：[0 3 4]</p>
<p>换 seed：[0 4 71 86 91]</p>
<p>N 为 0：[]（长度 0）</p>
<p>HIGH 为 0：[]（长度 0）</p>
<p>N 为 1：[1]</p>
```

**你应当看到什么**：同一个 seed 在任何时候都给出同一组数（实测同一模板两次构建输出完全一致）；结果是**升序**的；`N` 或 `HIGH` 为 0 时得到空切片；`N` 大于 `HIGH` 时返回整个 `[0, HIGH)`（上游已说明）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `N <= HIGH` | `N` 个升序且不重复的整数（实测 `[0 3 4]`） | 否 |
| 同一个 `SEED` | 每次调用返回同一组数（实测同模板两次构建一致） | 否 |
| `N == 0` | 空切片（实测） | 否 |
| `HIGH == 0` | 空切片（实测） | 否 |
| `N > HIGH` | 完整的 `[0, HIGH)`（上游已说明，实测 `collections.D 42 7 5` 得 `[0 1 2 3 4]`） | 否 |
| `N < 0`、`N > 10^6`、`HIGH < 0`、`HIGH > 10^6`、`SEED < 0` | 错误（上游已说明） | 是 |
| 返回类型 | `[]int`（升序） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 以为「随机」每次都会变，结果没变 | seed 固定时结果**就是**固定的（这正是设计目的） | 想每次都变就把 seed 换成 `int time.Now.UnixNano` |
| 没报错但结果不对 | 每天构建结果抖动 | seed 用了时间戳 | 想按天稳定就用 `time.Now.YearDay`（上游示例） |
| 没报错但结果不对 | 抽样结果数量少于 `N` | `N` 大于 `HIGH` 时返回整个区间（大小是 `HIGH`） | 让 `HIGH` 等于候选集大小，并保证 `N <= HIGH` |
| 报错看不懂 | 参数超范围报错 | `N`/`HIGH` 必须在 `[0, 10^6]`，`SEED` 必须在 `[0, 2^64-1]`（上游已说明） | 夹住取值范围，例如页面数超过上限时先截断 |

更多排查入口见[故障排查](/troubleshooting/)。

[Method D]: https://getkerf.wordpress.com/2016/03/30/the-best-algorithm-no-one-knows-about/
[`collections.Shuffle`]: /functions/collections/shuffle/
[day of the year]: /methods/time/yearday/
