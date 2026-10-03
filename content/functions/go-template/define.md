+++
title = "define"
linkTitle = "define"
description = "定义一个模板。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/go-template/define/"

[params.functions_and_methods]
signatures = ["define NAME"]
+++

## 这一页解决什么问题

`define` 用来**给一段模板起名字**，之后可以用 [`template`](/functions/go-template/template/)、[`block`](/functions/go-template/block/) 或 [`partial`](/functions/partials/include/) 调用它。本站文档里出现的三种写法其实共用同一个机制：

- 页面模板里的 `{{ define "main" }}…{{ end }}`，被 `baseof.html` 的 `block` 套用；
- 内联局部模板 `{{ define "_partials/inline/foo.html" }}…{{ end }}`，用 `partial "inline/foo.html"` 调用；
- 具名模板 `{{ define "foo" }}…{{ end }}`，用 `template "foo"` 调用。

`define` 定义本身**不产生任何输出**，只有被调用时才渲染。

## 什么时候用，什么时候别用

**该用**：

- 定义带名字的模板片段，供多处调用（`define` + `template`）；
- 定义内联局部模板，让一小段模板可以像 `partial` 一样传参调用；
- 配合 `baseof.html` 的 `block`，让不同页面覆盖骨架中的同一块。

**别用**：

- 只想复用一个文件里的局部模板 → 用 [`partial`](/functions/partials/include/)（独立文件更好维护，还可用 [`partialCached`](/functions/partials/includecached/) 缓存）；
- 需要返回结构化结果（而不只是渲染字符串）→ 用 `partial` 加 [`return`](/functions/go-template/return/)；
- 想参数化一段逻辑 → `partial` 的上下文参数比 `template` 的 `CONTEXT` 更清晰。

## 用法

与 [`block`][] 语句配合使用：

```go-html-template
{{ block "main" . }}
  {{ print "default value if 'main' template is empty" }}
{{ end }}

{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
{{ end }}
```

与 [`partial`][] 函数配合使用：

```go-html-template
{{ partial "inline/foo.html" (dict "answer" 42) }}

{{ define "_partials/inline/foo.html" }}
  {{ printf "The answer is %v." .answer }}
{{ end }}
```

与 [`template`][] 语句配合使用：

```go-html-template
{{ template "foo" (dict "answer" 42) }}

{{ define "foo" }}
  {{ printf "The answer is %v." .answer }}
{{ end }}
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

[`block`]: /functions/go-template/block/
[`partial`]: /functions/partials/include/
[`template`]: /functions/go-template/block/

## 完整示例（实测）

内联局部模板（`define` 出来的名字必须以 `_partials/` 开头，`partial` 才能找到它）：

```go-html-template
{{ partial "inline/foo.html" (dict "answer" 42) }}

{{ define "_partials/inline/foo.html" }}The answer is {{ .answer }}.{{ end }}
```

Hugo 0.167.0 实测渲染为：

```text
The answer is 42.
```

用具名模板 + [`template`](/functions/go-template/template/) 调用：

```go-html-template
{{ template "foo" (dict "answer" 42) }}

{{ define "foo" }}{{ printf "The answer is %v." .answer }}{{ end }}
```

Hugo 0.167.0 实测渲染为：

```text
The answer is 42.
```

**你应当看到什么**：两段模板输出相同——`define` 只负责「登记」模板，真正决定输出的是调用方传入的上下文（这里是 `dict "answer" 42`）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 只写 `define` 不调用 | 不产生任何输出 | 否 |
| 内联局部模板只 `define`、不用 `partial` 调用 | 同样不输出 | 否 |
| `partial` 调用不存在的名字 | —— | 是：实测 `error calling partial: partial "nope.html" not found` |
| 内联局部模板要返回值 | `define` 本身不返回值；要返回值请在 `partial` 里用 [`return`](/functions/go-template/return/) | 否 |
