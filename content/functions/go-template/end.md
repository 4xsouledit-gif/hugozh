+++
title = "end"
linkTitle = "end"
description = "结束 if、with、range、block 与 define 语句。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/go-template/end/"

[params.functions_and_methods]
signatures = ["end"]
+++

## 这一页解决什么问题

Go 模板用「开标签 / 闭标签」成对书写控制结构，`end` 就是那个统一的闭标签：`if`、`with`、`range`、`block`、`define` 都以 `{{ end }}` 结束。页面模板里的 `{{ define "main" }}…{{ end }}` 之所以能覆盖 `baseof.html` 的 `block`，靠的也是这套配对结构。

`end` 本身不产生输出。它最常见的报错来源是**漏写**：Hugo 会提示 `unexpected EOF` 或 `expected end`，而报错位置往往不是真正漏写的那一行。

## 什么时候用，什么时候别用

**该用**：

- 结束任何 `if` / `else` / `with` / `range` / `block` / `define` 代码块；
- 与 [`else`](/functions/go-template/else/)、`else if`、`else with` 配合时，`end` 只写一次，放在整条链的末尾。

**别用**：

- 不要用 `end` 去「提前跳出」循环——那是 [`break`](/functions/go-template/break/) 的职责；
- 不要在文件末尾补一个 `end` 来「收尾」，每个块恰好一个 `end`。

## 用法

与 [`if`][] 语句配合使用：

```go-html-template
{{ $var := "foo" }}
{{ if $var }}
  {{ $var }} → foo
{{ end }}
```

与 [`with`][] 语句配合使用：

```go-html-template
{{ $var := "foo" }}
{{ with $var }}
  {{ . }} → foo
{{ end }}
```

与 [`range`][] 语句配合使用：

```go-html-template
{{ $var := slice 1 2 3 }}
{{ range $var }}
  {{ . }} → 1 2 3
{{ end }}
```

与 [`block`][] 语句配合使用：

```go-html-template
{{ block "main" . }}{{ end }}
```

与 [`define`][] 语句配合使用：

```go-html-template
{{ define "main" }}
  {{ print "this is the main section" }}
{{ end }}
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

[`block`]: /functions/go-template/block/
[`define`]: /functions/go-template/define/
[`if`]: /functions/go-template/if/
[`range`]: /functions/go-template/range/
[`with`]: /functions/go-template/with/

## 完整示例（实测）

```go-html-template
{{ $var := "foo" }}
{{ if $var }}
  {{ $var }}
{{ end }}

{{ with $var }}
  {{ . }}
{{ end }}
```

Hugo 0.167.0 实测渲染（只保留有效输出）：

```text
foo
foo
```

**你应当看到什么**：`if` 与 `with` 各输出一次 `foo`。两处 `{{ end }}` 分别结束上面的块，少写任何一个都会让构建失败。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 正常配对 | 不产生输出，只结束代码块 | 否 |
| 漏写 `{{ end }}` | 构建失败，实测报 `template: index.html:3: unexpected EOF`（报错指向的位置不一定是漏写处） | 是 |
| 返回类型 | 无（语句） | 否 |
