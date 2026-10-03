+++
title = "局部模板函数"
linkTitle = "partials"
description = "使用这些函数调用局部模板（partial）。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/functions/partials/"
+++

## 这一页解决什么问题

模板里总会有反复出现的片段：`<head>`、页脚、导航、卡片。Go 模板本身没有「包含另一个文件」的语法，Hugo 的答案是**局部模板（partial）**：把片段写进 `layouts/_partials/`，再用本节的两个函数调用它。

本节只有两个函数，区别只有一条——**要不要缓存渲染结果**：

- `partials.Include`（别名 `partial`）：每次都重新渲染；
- `partials.IncludeCached`（别名 `partialCached`）：同一个「变体」只渲染一次，之后复用缓存。

## 什么时候用，什么时候别用

| 你的情况 | 用哪个 |
| --- | --- |
| 片段输出依赖当前页面，每页都不同 | [`partials.Include`](/functions/partials/include/)（`partial`） |
| 片段在一批页面里输出完全相同，且渲染代价高 | [`partials.IncludeCached`](/functions/partials/includecached/)（`partialCached`） |
| 需要从片段里「取值」而不是取 HTML | 两者都能配合 `return` 语句，见 [partials.Include](/functions/partials/include/) |
| 把片段放在子目录里，想用 `./`、`../` 引用同级文件 | `partials.Include`，见其「相对路径」一节 |

**别用**：

- 想复用**内容**（Markdown 正文片段）而不是模板 → 用[短代码（shortcode）](/shortcodes/)；
- 只想把一段 HTML 从模板里挪出去，但仍要逐页重新渲染 → 用普通 `partial` 就够了，加缓存只会引入「缓存键选错」的风险；
- 想按页面类型自动挑选模板文件 → 那是[模板查找顺序](/templates/lookup-order/)，与 partial 无关。

## 完整示例：一个普通 partial 与一个缓存 partial

站点里放两个局部模板——一个把上下文里传进来的数字求平均，一个只用来观察「渲染了几次」：

```go-html-template {file="layouts/_partials/average.html"}
{{ $sum := 0 }}
{{ range . }}{{ $sum = math.Add $sum . }}{{ end }}
{{ return math.Div $sum (len .) }}
```

```go-html-template {file="layouts/_partials/footer.html"}
<footer>Teach demo footer</footer>
```

```go-html-template {file="layouts/_partials/count.html"}
{{ math.Counter }}
```

在首页模板里这样调用：

```go-html-template {file="layouts/index.html"}
A1=[{{ partial "average.html" (slice 1 6 7 42) }}] type={{ printf "%T" (partial "average.html" (slice 1 6 7 42)) }}
A2=[{{ partial "footer.html" }}] type={{ printf "%T" (partial "footer.html") }}
A5=[{{ partialCached "count.html" . }}][{{ partialCached "count.html" . }}][{{ partialCached "count.html" . "A" }}][{{ partialCached "count.html" . "A" }}][{{ partialCached "count.html" . "B" }}]
```

Hugo 0.167.0 渲染为：

```html
A1=[14] type=int64
A2=[<footer>Teach demo footer</footer>
] type=template.HTML
A5=[1
][1
][2
][2
][3
]
```

**你应当看到什么**：

- `A1` 说明**带 `return` 的 partial 可以返回任意类型**——这里 `math.Div` 返回 `int64`，所以 `printf "%T"` 不是 `template.HTML`；
- `A2` 说明**没有 `return` 时返回 `template.HTML`**，而且局部模板文件末尾的换行会一起进入结果（所以输出里有换行）；
- `A5` 是缓存的关键：同一变体连续调用两次都是 `1`（第二次直接命中缓存，`math.Counter` 没有被再次求值）；换成变体 `"A"` 才重新渲染得到 `2`，变体 `"B"` 得到 `3`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。细则见两个函数页，这里给出容易踩的几条：

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 局部模板里没有 `return` | 返回 `template.HTML` 字符串（**不是**普通 `string`） | 否 |
| 局部模板里有 `return` | 返回该表达式的类型（实测 `math.Div` 得到 `int64`） | 否 |
| `NAME` 指向不存在的模板 | 构建失败：`partial "missing.html" not found` | 是 |
| 从非局部模板调用 `partial "./x.html"` | 构建失败：`can only be used from within a partial` | 是 |
| 省略 `CONTEXT`（`partial "x.html"`） | 允许；模板里 `.` 为 nil | 否 |
| `partialCached` 只传 `LAYOUT` | 构建失败：`wrong number of args for partialCached` | 是 |

## 读完本章你应该能够

- 说清 `partial` 与 `partialCached` 的唯一区别，以及缓存键（变体参数）是怎么决定的
- 用 `dict` 给 partial 传多个参数，并用 `return` 从 partial 取回非 HTML 的值
- 在 partial 内部用 `./`、`../` 引用同级或上级局部模板
- 判断一个片段该不该加缓存，以及变体参数该选什么

## 阅读顺序

1. [partials.Include](/functions/partials/include/) —— 先掌握调用、上下文与相对路径；
2. [partials.IncludeCached](/functions/partials/includecached/) —— 再学缓存与变体参数。

更多排查入口见[故障排查](/troubleshooting/)。
