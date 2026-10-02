+++
title = "template"
linkTitle = "template"
description = "执行给定的模板，可选择传入上下文。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/go-template/template/"

[params.functions_and_methods]
signatures = ["template NAME [CONTEXT]"]
+++

## 这一页解决什么问题

`template` 用来**执行一个已经用 [`define`](/functions/go-template/define/) 定义好的模板**，并可选地把一个上下文传进去（传进去之后块内的 `.` 就是那个值）。它与 [`block`](/functions/go-template/block/) 的区别是：`block` 会「先定义、再执行、可被覆盖」，`template` 只是执行。

本页另一个重点是**它与内联局部模板的取舍**：同样一段可复用的模板，用 `partial` 调用（内联局部模板）比 `template` 多了缓存与返回值等能力。

## 什么时候用，什么时候别用

**该用**：

- 与 `define` 成对使用，把同一段模板在多处执行；
- `baseof.html` 里用 `block` 留了缺口时，底层的 `template` 机制由 Hugo 处理，通常不需要手写它。

**别用**：

- 需要缓存渲染结果 → 用 [`partialCached`](/functions/partials/includecached/)；
- 需要返回结构化值（而不是渲染字符串）→ 用 `partial` + [`return`](/functions/go-template/return/)；
- 需要按文件组织局部模板 → 用 `partial`（`template` 的名字与文件组织无关）。

## 用法

用 `template` 语句执行一个已定义的模板：

```go-html-template
{{ template "foo" (dict "answer" 42) }}

{{ define "foo" }}
  {{ printf "The answer is %v." .answer }}
{{ end }}
```

上面的例子可以改写为使用内联 _局部模板_：

```go-html-template
{{ partial "inline/foo.html" (dict "answer" 42) }}

{{ define "_partials/inline/foo.html" }}
  {{ printf "The answer is %v." .answer }}
{{ end }}
```

上面两个例子的主要区别是：

1. 内联 _局部模板_ 的作用域是全局的。也就是说，在一个模板中定义的内联 _局部模板_ 可以从任何模板中调用。
1. 调用内联 _局部模板_ 时借助 [`partialCached`][] 函数，可以通过缓存结果来优化性能。
1. 内联 _局部模板_ 可以 [`return`][] 返回任意数据类型的值，而不只是渲染出字符串。

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

[`partialCached`]: /functions/partials/includecached/
[`return`]: /functions/go-template/return/

## 完整示例（实测）

```go-html-template
{{ template "foo" (dict "answer" 42) }}

{{ define "foo" }}{{ printf "The answer is %v." .answer }}{{ end }}
```

Hugo 0.167.0 实测渲染为：

```text
The answer is 42.
```

传字符串作为上下文：

```go-html-template
{{ template "greet" "world" }}

{{ define "greet" }}Hello {{ . }}{{ end }}
```

Hugo 0.167.0 实测渲染为：

```text
Hello world
```

**你应当看到什么**：`template` 的第二个参数就是被调模板里的 `.`；`define` 写在 `template` 调用之后同样有效（实测），因为 `define` 在模板解析阶段就会被登记。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `template NAME CONTEXT` | 渲染具名模板，块内 `.` 为 `CONTEXT`（实测传 `dict` 后 `{{ .answer }}` → `42`） | 否 |
| `template NAME "world"` | 块内 `.` 为字符串（实测输出 `Hello world`） | 否 |
| 调用位置 | 输出出现在 `template` 语句所在位置（实测 `define` 在调用之后也能生效） | 否 |
| 返回类型 | 无（语句，不产生返回值） | 否 |
