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

（0.149.0 新增）

`collections.D` 函数使用给定的 [`SEED`](g) 值，返回半开[区间](g) `[0, HIGH)` 内一组已排序且互不重复的随机整数。结果切片的元素个数为 `N` 与 `HIGH` 中较小的那个。

- `N` 和 `H` 必须是闭区间 `[0, 1000000]` 内的整数
- `SEED` 必须是闭区间 `[0, 2^64 - 1]` 内的整数

## 返回值

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

## 示例

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

## Seed 值

选择合适的 seed 值取决于你的目标。

目标|seed 示例
:--|:--
结果一致|`42`
每次调用结果不同|`int time.Now.UnixNano`
每天结果相同|`time.Now.YearDay`
每个页面结果相同|`hash.FNV32a .Path`
每个页面每天结果不同|`hash.FNV32a (print .Path time.Now.YearDay)`

[Method D]: https://getkerf.wordpress.com/2016/03/30/the-best-algorithm-no-one-knows-about/
[`collections.Shuffle`]: /functions/collections/shuffle/
[day of the year]: /methods/time/yearday/
