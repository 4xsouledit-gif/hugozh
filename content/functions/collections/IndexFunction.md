+++
title = "collections.Index"
linkTitle = "index"
description = "按指定的一个或多个 key，从给定的切片或映射中取出元素或值。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/collections/indexfunction/"

[params.functions_and_methods]
signatures = ["collections.Index SLICE|MAP KEY..."]
returnType = "any"
aliases = ["index"]
+++

## 这一页解决什么问题

`index` 是模板里的「按下标／按 key 取值」。什么时候非用不可？当**键名是变量**的时候：`.Params.foo` 只能写固定键名，而键名来自配置、循环变量或页面参数时，只能写 `index $m $k`。它还能一次取多层：`index $m "c" "e"`。

上游的等价写法对照：

```go-html-template
{{ .Site.Params.foo }}

{{ $k := "foo" }}
{{ index .Site.Params $k }}
```

**必须记住的边界（实测）**：键不存在或下标越界时，`index` **不报错**，返回空值。这意味着拼写错误不会让构建失败，只会静默输出空——务必用 [`collections.IsSet`](/functions/collections/isset/) 或 `with` 兜底。

## 什么时候用，什么时候别用

**该用**：

- 键名/下标是变量；
- 键里含点号（实测 `index $m "a.b"` 能取到，而 `.a.b` 这种字段写法会被当成两级键）；
- 从嵌套映射/切片里逐层取值：`index $m "c" "e"`；
- 用一个「key 的切片」取值：`index $m $keys`。

**别用**：

- 键名固定 → 直接 `.Params.foo`，更短也更易读（上游也把这两种写法列为等价）；
- 只想判断存在性 → 用 [`collections.IsSet`](/functions/collections/isset/)；
- 想取切片的一段 → 用 [`collections.First`](/functions/collections/first/)、[`collections.Last`](/functions/collections/last/)、[`collections.After`](/functions/collections/after/)。

## 用法

被索引的每一项都必须是映射或切片：

```go-html-template
{{ $s := slice "a" "b" "c" }}
{{ index $s 0 }} → a
{{ index $s 1 }} → b

{{ $m := dict "a" 100 "b" 200 }}
{{ index $m "b" }} → 200
```

使用两个或更多 key 可访问嵌套值：

```go-html-template
{{ $m := dict "a" 100 "b" 200 "c" (slice 10 20 30) }}
{{ index $m "c" 1 }} → 20

{{ $m := dict "a" 100 "b" 200 "c" (dict "d" 10 "e" 20) }}
{{ index $m "c" "e" }} → 20
```

也可以用一个由 key 组成的切片来访问嵌套值：

```go-html-template
{{ $m := dict "a" 100 "b" 200 "c" (dict "d" 10 "e" 20) }}
{{ $s := slice "c" "e" }}
{{ index $m $s }} → 20
```

当 key 是变量时，用 `collections.Index` 函数访问嵌套值。例如下面两种写法等价：

```go-html-template
{{ .Site.Params.foo }}

{{ $k := "foo" }}
{{ index .Site.Params $k }}
```

## 完整示例：下标、嵌套与「取不到」时

```go-html-template {file="layouts/_partials/lookup.html"}
{{ $s := slice "a" "b" "c" }}
{{ $m := dict "a" 100 "c" (dict "d" 10 "e" 20) }}
<p>{{ index $s 0 }} / {{ index $s 1 }}</p>
<p>{{ index $m "a" }} / {{ index $m "c" "e" }}</p>
<p>key 切片：{{ index $m (slice "c" "e") }}</p>
<p>字符串按字节：{{ index "abc" 1 }}</p>
<p>不存在的键 isset：{{ isset $m "missing" }}</p>
<p>不存在的键输出：{{ with index $m "missing" }}有值{{ else }}空（且不报错）{{ end }}</p>
<p>越界下标 isset：{{ isset $s 9 }}</p>
```

Hugo 渲染为：

```html
<p>a / b</p>
<p>100 / 20</p>
<p>key 切片：20</p>
<p>字符串按字节：98</p>
<p>不存在的键 isset：false</p>
<p>不存在的键输出：空（且不报错）</p>
<p>越界下标 isset：false</p>
```

**你应当看到什么**：多层 key 一次取到底；字符串上取下标拿到的是**字节值**（`"abc"` 的第 1 个字节是 `98`，即 `b` 的 ASCII 码）；键不存在或下标越界时输出为空且**构建照常成功**。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 键不存在 | 空值（`isset` 为 `false`） | **否**（与直觉相反，见「常见坑」） |
| 下标越界（`index (slice "a") 5`） | 空值 | **否** |
| 下标为负（`index (slice "a") -1`） | 空值 | **否** |
| 输入是字符串（`index "abc" 1`） | 该位置的**字节**值（`98`） | 否 |
| 输入是 `nil` | 空值 | 否 |
| 用一个 key 切片取值 | 逐层取（实测 `20`） | 否 |
| 返回类型 | `any` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面参数拼写错误，页面上却是空白，构建成功 | `index` 取不到时返回空值而不报错（实测） | 先 `{{ isset $m "key" }}` 判断，或用 `with` 兜底 |
| 没报错但结果不对 | 取字符串下标得到数字 | 字符串是字节切片，下标返回字节值 | 要取字符请改用 [`strings.Substr`](/functions/strings/substr/) 等字符串函数 |
| 没报错但结果不对 | 嵌套取值取到空 | 中间某一层的 key 不存在 | 逐层 `isset` 检查，或先 `debug.Dump` 看结构 |
| 没报错但结果不对 | 键含点号取不到 | 字段写法会被拆成多级 key | 用 `index $m "a.b"`（实测可行） |

更多排查入口见[故障排查](/troubleshooting/)。
