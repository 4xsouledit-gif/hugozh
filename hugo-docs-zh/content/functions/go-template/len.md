+++
title = "len"
linkTitle = "len"
description = "返回字符串、切片、映射或集合的长度。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/go-template/len/"

[params.functions_and_methods]
signatures = ["len VALUE"]
returnType = "int"
+++

## 这一页解决什么问题

模板里要判断「有没有内容」「几篇文章」「字符串多长」时都会用到 `len`。它接受字符串、切片、映射或页面集合，返回 `int`。在 `if`/`with` 里，`len` 的结果 `0` 是假值，所以「集合是否为空」可以直接写成 `{{ if len .Pages }}`。

`len` 与页面集合的 `.Len` 方法结果一致：实测 `{{ site.RegularPages | len }}` 与 `{{ site.RegularPages.Len }}` 都是 `2`（对应实测站点里的两篇文章）。

## 什么时候用，什么时候别用

**该用**：

- 判断集合 / 字符串是否为空；
- 统计文章数、标签数、字符数；
- 在 `printf` 里拼数量。

**别用**：

- 对数字、布尔、`nil` 用 `len` → 会直接报错（见下表）；
- 数「词数」→ 用 [`countwords`](/functions/strings/countwords/) 或页面的 `.WordCount`；
- 取集合的前 N 个 / 排序 / 去重 → 用 [`collections.First`](/functions/collections/first/)、[`collections.Sort`](/functions/collections/sort/)、[`collections.Uniq`](/functions/collections/uniq/)。

## 用法

字符串：

```go-html-template
{{ "ab" | len }} → 2
{{ ""   | len }} → 0
```

切片：

```go-html-template
{{ slice "a" "b" | len }} → 2
{{ slice         | len }} → 0
```

映射：

```go-html-template
{{ dict "a" 1 "b" 2 | len }} → 2
{{ dict             | len }} → 0
```

集合：

```go-html-template
{{ site.RegularPages | len }} → 42
```

也可以用下面的写法统计集合中的页面数量：

```go-html-template
{{ site.RegularPages.Len }} → 42
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

## 完整示例（实测）

```go-html-template
{{ "ab" | len }} → 2
{{ "" | len }} → 0
{{ slice "a" "b" | len }} → 2
{{ slice | len }} → 0
{{ dict "a" 1 "b" 2 | len }} → 2
{{ dict | len }} → 0
{{ site.RegularPages | len }} → 2
{{ site.RegularPages.Len }} → 2
```

Hugo 0.167.0 实测：以上八行逐条与 `→` 后的结果一致（`site.RegularPages` 为实测站点中的 2 篇文章）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，最小站点。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| 字符串 | 字符数（`"ab"` → `2`，`""` → `0`） | 否 |
| 切片 / 映射 | 元素个数；空集合为 `0` | 否 |
| 页面集合 | 页面数（`site.RegularPages` → `2`） | 否 |
| `int`（如 `42`） | —— | 是：`error calling len: len of type int` |
| `bool`（如 `true`） | —— | 是：`len of type bool` |
| `float`（如 `1.5`） | —— | 是：`len of type float64` |
| `nil` | —— | 是：`reflect: call of reflect.Value.Type on zero Value` |
| 返回类型 | `int`（实测 `%T` → `int`） | 否 |

> [!WARNING]
> 上述报错会**中止整个构建**。需要「可能失败也不中断」时，用 [`try`](/functions/go-template/try/) 包住表达式（实测：`try` 能捕获上面四类 `len` 错误）。
