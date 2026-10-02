+++
title = "partials.IncludeCached"
linkTitle = "IncludeCached"
description = "执行给定模板并缓存结果，可选择性地传入一个或多个变体键。若局部模板包含 return 语句，则返回该语句的值，否则返回渲染输出。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/partials/includecached/"

[params.functions_and_methods]
signatures = ["partials.IncludeCached LAYOUT CONTEXT [VARIANT...]"]
returnType = "any"
aliases = ["partialCached"]
+++

## 这一页解决什么问题

有些局部模板很贵，但输出在一批页面里完全一样：全站页脚、导航、按 section 生成的侧栏。如果每个页面都重新渲染一遍，构建时间会随之线性增长。`partialCached` 用「缓存键」把这些重复渲染省掉——**同一个键只渲染一次**，剩下的调用直接复用结果。

代价是：一旦键选错，页面之间会串味（A 页面拿到 B 页面的输出），而且**构建不会报错**。所以用它的关键不是记住函数名，而是想清楚「这段输出在什么范围内是相同的」，再把这个范围编码成变体参数。

## 什么时候用，什么时候别用

**该用**：

- 输出与页面无关，或只与某个粗粒度条件有关（站点、语言、section、国家、省份……）；
- 该片段渲染代价高（复杂循环、大量 `where`、`resources` 处理），且确实被很多页面调用；
- 已经能说清「什么情况下输出必须不同」，并把它写成变体参数。

**别用**：

- 输出依赖当前页面且每页都不同 → 用 [`partials.Include`](/functions/partials/include/)；给每页传一个不同的变体等于没有缓存，只是白白多一份缓存条目；
- 变体参数本身是「每次都会变的值」（例如 `now`、`math.Counter`、页面标题）→ 缓存永不命中，反而可能让输出更难预测；
- 只在单页里调用一次 → 直接 `partial`，`partialCached` 不会更快。

没有 [`return`][] 语句时，`partialCached` 函数返回 `template.HTML` 类型的字符串。有 `return` 语句时，`partialCached` 函数可以返回任意数据类型。

对于不需要每次调用都重新渲染的复杂模板，`partialCached` 函数可以带来显著的性能提升。

> [!NOTE]
> 每个站点（或每种语言）都有自己的 `partialCached` 缓存，因此每个站点只会执行一次*局部模板*。
>
> Hugo 并行渲染页面，因此对 `partialCached` 函数的并发调用会使*局部模板*被渲染不止一次。等到 Hugo 缓存了渲染后的*局部模板*，之后进入构建流水线的页面就会使用缓存结果。

在*局部模板*中，以 `./` 或 `../` 开头的路径相对于调用方*局部模板*解析。请参见 [`partials.Include`](/functions/partials/include/#相对路径)。

最简单的用法如下：

```go-html-template
{{ partialCached "footer.html" . }}
```

向 `partialCached` 传入额外参数可以为缓存的*局部模板*创建变体。例如，如果某个复杂的*局部模板*在同一 section（内容区块）内的页面上渲染结果应当完全相同，就可以按 section 创建变体，让该*局部模板*在每个 section 中只渲染一次：

```go-html-template {file="layouts/baseof.html"}
{{ partialCached "footer.html" . .Section }}
```

需要创建唯一变体时，可以按需传入任意数据类型的额外参数：

```go-html-template
{{ partialCached "footer.html" . .Params.country .Params.province }}
```

变体参数对底层*局部模板*不可见，它们只用于生成唯一的缓存键。

要从*局部模板*返回值，请使用 `return` 语句：

```go-html-template
{{ if math.ModBool . 2 }}
  {{ return "even" }}
{{ end }}
{{ return "odd" }}
```

## 完整示例：用计数器证明「只渲染一次」

这段示例不依赖任何内容文件。把局部模板写成一行计数器——如果它真的被重新渲染，数字就会变大：

```go-html-template {file="layouts/_partials/count.html"}
{{ math.Counter }}
```

```go-html-template {file="layouts/index.html"}
{{ partialCached "count.html" . }}{{ partialCached "count.html" . }}{{ partialCached "count.html" . "A" }}{{ partialCached "count.html" . "A" }}{{ partialCached "count.html" . "B" }}
```

Hugo 0.167.0 实测渲染为：

```html
11223
```

**你应当看到什么**（把 `11223` 拆成五次调用）：

| 第几次调用 | 变体 | 输出 | 说明 |
| --- | --- | --- | --- |
| 1 | 无 | `1` | 首次渲染，`math.Counter` 返回 1 |
| 2 | 无 | `1` | 命中缓存，计数器**没有**再递增 |
| 3 | `"A"` | `2` | 变体不同 → 重新渲染 |
| 4 | `"A"` | `2` | 同一变体 → 命中缓存 |
| 5 | `"B"` | `3` | 新变体 → 再渲染一次 |

也就是说：**缓存键 = 目标局部模板 + 全部变体参数**，与页面、语言、站点上下文无关（输入相同就复用），而站点/语言各自有一份独立缓存（上游说明）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 同一变体重复调用 | 返回第一次的结果，局部模板不再执行 | 否 |
| 变体不同（哪怕是 `"A"` 与 `"B"`） | 各渲染一次，各存一份缓存 | 否 |
| 变体里含 `nil`、数字、映射等任意类型 | 都可以作为键（上游说明：任意数据类型），实测传字符串变体行为如上表 | 否 |
| 省略 `CONTEXT` 只写 `LAYOUT` | 构建失败：`wrong number of args for partialCached: want at least 3 got 1` | 是 |
| `LAYOUT` 指向不存在的模板 | 构建失败：`error calling partialCached: partial "nope.html" not found` | 是 |
| 局部模板里有 `return` | 与 `partial` 相同：返回 `return` 表达式的类型 | 否 |
| 并发构建 | 上游说明：首次可能被渲染多次，缓存建立后使用缓存结果 | 否 |

> [!NOTE]
> `partialCached` 的缓存是**构建内**的：每次 `hugo` 运行都会重新开始。它不会把结果持久化到磁盘，因此不会出现「上次构建的输出被复用」的情况。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 不同页面的页脚/侧栏内容串了 | 变体给得太少或没给：所有页面共用一个缓存键 | 把真正区分输出的值加进变体，例如 `{{ partialCached "sidebar.html" . .Section }}` |
| 没报错但结果不对 | 改了局部模板但页面不变 | 命中的是 `partialCached` 的构建内缓存（或 Hugo 的文件缓存） | 确认该片段确实该缓存；调试时临时改成 `partial`，或用 `hugo --ignoreCache` |
| 没报错但结果不对 | 页面上的时间是旧的 | 片段里用了 `now` 之类的动态值，却被缓存了 | 这类片段不要用 `partialCached` |
| 报错看不懂 | `wrong number of args for partialCached` | 只传了 `LAYOUT`，漏了 `CONTEXT` | 至少写成 `{{ partialCached "x.html" . }}`，即使片段不用上下文 |
| 没报错但没变快 | 构建时间没改善 | 变体每次调用都不同（缓存永不命中），或片段本身很便宜 | 检查变体是否稳定；便宜片段直接用 `partial` |

更多排查入口见[故障排查](/troubleshooting/)。

[`return`]: /functions/go-template/return/
