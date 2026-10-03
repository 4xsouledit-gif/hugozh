+++
title = "math.Counter"
linkTitle = "math.Counter"
description = "返回一个全局计数器值，函数每被调用一次就递增一次。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/math/counter/"

[params.functions_and_methods]
signatures = ["math.Counter"]
returnType = "uint64"
+++

## 这一页解决什么问题

需要一个「每次调用都不一样」的值：让重复的警告各占一行不被去重、给 `resources.FromString` 的目标路径（同时也是缓存键）加上唯一后缀。`math.Counter` 提供全局自增计数，每次构建从 1 开始。

```go-html-template {file="layouts/page.html"}
{{ warnf "page.html called %d times" math.Counter }}
```

```text
WARN  page.html called 1 times
WARN  page.html called 2 times
WARN  page.html called 3 times
```

## 什么时候用，什么时候别用

**该用**：

- 生成唯一的警告/日志（[`warnf`](/functions/fmt/warnf/) 会抑制完全相同的消息，加计数器就能都打出来）；
- 为 `resources.FromString` 生成唯一目标路径，避免同路径缓存互相覆盖。

**别用**：

- 想给页面分配**固定编号**（目录序号、静态 id）→ 计数器受并发影响，每次构建的值都可能不同（上游明确说明），请改用 `.Weight`、`ordinal` 或自己维护的数据；
- 想在循环里生成序号 → 直接用 `range` 的索引或 `seq`，语义更清晰；
- 想要随机数 → 用 [`math.Rand`](/functions/math/rand/)。

该计数器对单语言与多语言项目都是全局的，每次构建的初始值为&nbsp;1。

## 完整示例：连续三次调用

```go-html-template {file="layouts/_partials/counter-demo.html"}
<p>{{ math.Counter }}-{{ math.Counter }}-{{ math.Counter }}（类型 {{ printf "%T" math.Counter }}）</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>1-2-3（类型 uint64）</p>
```

**你应当看到什么**：三次调用依次得到 1、2、3；返回类型是 `uint64`。**再次强调**：如果这个片段被多个页面同时渲染，Hugo 并行执行会让「哪个页面拿到哪个数字」不稳定——**不要**把它当作页面编号使用。

可以用这个函数来：

- 生成如上例所示的唯一警告信息；[`warnf`][] 函数会抑制重复的消息
- 为 `resources.FromString` 函数生成唯一的目标路径，此时目标路径同时也是缓存键

> [!NOTE]
> 由于并发的原因，同一页面在给定模板中返回的值每次构建都可能不同。不能用这个函数给每个页面分配固定的 id。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 同一模板里连续调用三次 | `1`、`2`、`3` | 否 |
| 每次构建 | 计数从 1 重新开始（上游说明：初始值为 1） | 否 |
| 多页面并行构建 | 值在多页之间交错，不保证稳定（上游说明） | 否 |
| 传入参数 | 该函数无参数；传参会导致参数个数错误 | 是 |
| 返回类型 | `uint64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面编号每次构建都不一样 | 计数器受并发影响（上游明确说明） | 换用稳定来源：`.Weight`、`ordinal`、数据文件里的序号 |
| 没报错但结果不对 | 想看到 3 条警告，实际只出现 1 条 | `warnf` 会去重相同消息 | 把 `math.Counter` 放进消息里 |
| 没报错但结果不对 | 生成的资源互相覆盖 | 目标路径相同、缓存键也相同 | 用 `math.Counter` 参与目标路径，或改用内容哈希 |

更多排查入口见[故障排查](/troubleshooting/)。

[`warnf`]: /functions/fmt/warnf/
