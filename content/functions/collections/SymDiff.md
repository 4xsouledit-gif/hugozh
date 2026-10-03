+++
title = "collections.SymDiff"
linkTitle = "symdiff"
description = "返回两个给定切片的对称差集（symmetric difference）。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/functions/collections/symdiff/"

[params.functions_and_methods]
signatures = ["SLICE1 | collections.SymDiff SLICE2"]
returnType = "[]any"
aliases = ["symdiff"]
+++

## 这一页解决什么问题

`symdiff` 求两个集合的**对称差**：只出现在其中一个集合里的元素（也就是「并集减去交集」）。它常用来比较两份列表的差异——例如两个标签集合里各自独有的部分。

有两件事必须记住，否则结果看着会「不对」：

1. **管道写法会把管道里的那个集合放到最后一个参数位置**。`$a | symdiff $b` 等价于 `symdiff $b $a`；
2. **输出顺序取决于参数顺序**（元素集合与顺序无关的部分则完全相同）：实测先输出「第二个切片独有的元素」，再输出「第一个切片独有的元素」。

## 什么时候用，什么时候别用

**该用**：

- 比较两批标签／术语，找出各自独有的部分；
- 需要「不相同的那些」而不是「相同的那些」。

**别用**：

- 只要**交集** → 用 [`collections.Intersect`](/functions/collections/intersect/)；
- 只要**并集** → 用 [`collections.Union`](/functions/collections/union/)；
- 只要**单向**的「从 A 中减去 B」→ 用 [`collections.Complement`](/functions/collections/complement/)（`symdiff` 是双向的，两边的独有元素都会返回）；
- 需要**确定性输出顺序**（RSS、站点地图、缓存键）→ 结果顺序跟随参数与元素顺序，建议对结果再接一个 [`collections.Sort`](/functions/collections/sort/)。

## 用法

示例：

```go-html-template
{{ slice 1 2 3 | symdiff (slice 3 4) }} → [1 2 4]
```

另见 <https://en.wikipedia.org/wiki/Symmetric_difference>。

## 完整示例：参数顺序如何影响结果

```go-html-template {file="layouts/_partials/diff.html"}
{{ $a := slice 1 2 3 }}
{{ $b := slice 3 4 }}
<p>symdiff $a $b：{{ symdiff $a $b }}</p>
<p>symdiff $b $a：{{ symdiff $b $a }}</p>
<p>管道写法 $a | symdiff $b：{{ $a | symdiff $b }}</p>
<p>字符串示例：{{ symdiff (slice "a" "b") (slice "b" "c") }}</p>
<p>完全相同：{{ symdiff (slice "a") (slice "a") }}，长度 {{ len (symdiff (slice "a") (slice "a")) }}</p>
```

Hugo 渲染为：

```html
<p>symdiff $a $b：[4 1 2]</p>
<p>symdiff $b $a：[1 2 4]</p>
<p>管道写法 $a | symdiff $b：[1 2 4]</p>
<p>字符串示例：[c a]</p>
<p>完全相同：[]，长度 0</p>
```

**你应当看到什么**：两种参数顺序给出的**元素集合完全相同、顺序不同**；管道写法与「把管道值放到最后」的直调写法结果一致（所以 `$a | symdiff $b` 得到的是 `[1 2 4]`，与上游示例相同）；两个集合完全相同时返回空切片。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows；同一站点两次构建结果一致（顺序是确定的，不是随机）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 两个切片完全相同 | 空切片（`len` 为 0） | 否 |
| 其中一个为空（`symdiff (slice) (slice "a")`） | 另一个切片的全部元素（实测 `[a]`） | 否 |
| 有公共元素 | 公共元素被去掉，只留两边的独有元素 | 否 |
| 输出顺序 | 先第二个切片独有（按其在第二个切片中的顺序），再第一个切片独有（实测） | 否 |
| 参数是 `nil` | —— | 是：`error calling symdiff: arguments must be slices or arrays` |
| 参数是字符串 | —— | 是：`arguments must be slices or arrays` |
| 返回类型 | `[]any` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 结果顺序和上游示例不一样 | 上游示例用的是管道写法（`slice 1 2 3 \| symdiff (slice 3 4)`），管道值排在最后 | 想复现示例就照抄管道写法；否则按「先第二切片独有」的顺序阅读结果 |
| 没报错但结果不对 | 结果里出现了「两边都有」的元素 | 用的不是对称差，或参数写成了一个切片 | 确认两个参数都是切片，且公共元素确实应当被去掉 |
| 报错看不懂 | `arguments must be slices or arrays` | 传了字符串或 `nil` | 字符串先 [`strings.Split`](/functions/strings/split/)；`nil` 不能当空切片用 |
| 没报错但结果不对 | 输出顺序在不同数据上不稳定 | 元素的相对顺序由输入切片决定 | 需要固定顺序就接 [`collections.Sort`](/functions/collections/sort/) |

更多排查入口见[故障排查](/troubleshooting/)。
