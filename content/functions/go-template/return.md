+++
title = "return"
linkTitle = "return"
description = "终止当前模板的执行；在局部模板中使用时，还可返回给定的值（如果有）。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/go-template/return/"

[params.functions_and_methods]
signatures = ["return [VALUE]"]
returnType = "any"
+++

## 这一页解决什么问题

`return` 是 Hugo 对 Go 模板的扩展，解决两个现实问题：

1. **提前结束**——模板后半段不需要渲染了，直接停在当前位置（例如短代码校验失败后用 `return` 避免层层嵌套的 `if`）；
2. **返回值**——在[局部模板](/functions/partials/include/)里把「计算结果」交回调用方，而不只是渲染一段字符串（例如返回一个 `resource` 对象、一个数字或一个布尔值）。

**（0.166.0 新增）** 起，`return` 可以出现在任何模板、任何位置，次数不限，并且遵循正常流程控制（只有执行到它才生效）。

## 什么时候用，什么时候别用

**该用**：

- 局部模板要把**结构化结果**（`resource`、`slice`、`int`、`bool`）交回调用方；
- 校验失败后提前收尾：短代码里 `errorf` 之后接 `return`，避免条件块嵌套；
- 在 `range` 里找到目标后立刻带着结果退出局部模板。

**别用**：

- 只是想让页面少渲染一段 → 用 `if` / `with` 控制；
- 想让整个站点构建失败并给出信息 → 用 [`errorf`](/functions/fmt/errorf/)（`return` 只终止当前模板）；
- 想在**非局部模板**里返回值 → 不允许，会直接报错（见下）。

## 用法

`return` 语句是对 Go [`text/template`][] 包的非标准扩展。它只终止当前模板的执行，调用它的模板会继续执行。在 _局部模板_（partial）中使用时，`return` 语句还可以向调用方返回一个值。

**（0.166.0 新增）** 在更早的版本中，`return` 语句只支持在局部模板中使用，每个模板只能有一条 `return` 语句，且不论它位于逻辑块中的什么位置都会执行。现在 `return` 语句遵循常规的流程控制：你可以在任何模板、任何位置使用它，次数不限，Hugo 只在执行到它时才执行。

## 返回一个值

在 _局部模板_ 中，`return` 语句可以返回任意数据类型的值：`bool`、`float`、`int`、`map`、`resource`、`slice`、`string` 等。返回值时，`return` 语句之前渲染的任何输出都会被丢弃。

在任何其它类型的模板中使用带值的 `return` 语句都会产生错误。

例如，一个返回字符串值的 _局部模板_：

```go-html-template {file="layouts/_partials/parity.html"}
{{ if math.ModBool . 2 }}
  {{ return "even" }}
{{ end }}
{{ return "odd" }}
```

```go-html-template {file="layouts/single.html"}
{{ partial "parity.html" 42 }} → even
```

更实用的例子是：一个 _局部模板_ 返回某个 section（内容区块）中第一个带封面图的页面的封面图：

```go-html-template {file="layouts/_partials/section-cover.html"}
{{ range .Pages }}
  {{ with .Resources.GetMatch "cover.*" }}
    {{ return . }}
  {{ end }}
{{ end }}
```

```go-html-template {file="layouts/section.html"}
{{ with partial "section-cover.html" . }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

## 提前返回

不带值使用 `return` 语句，可以停止当前模板的执行：

```go-html-template {file="layouts/single.html"}
<h2>{{ .Title }}</h2>
{{ if .Draft }}
  <p>This article is a draft.</p>
  {{ return }}
{{ end }}
{{ .Content }}
```

在 _短代码_（shortcode）模板中，可以在每次校验之后使用 `return` 语句，以避免条件块层层嵌套：

```go-html-template {file="layouts/_shortcodes/img.html"}
{{ if not (.Get "src") }}
  {{ errorf "The %q shortcode requires a src argument. See %s" .Name .Position }}
  {{ return }}
{{ end }}

{{ if not (.Get "alt") }}
  {{ errorf "The %q shortcode requires an alt argument. See %s" .Name .Position }}
  {{ return }}
{{ end }}

<img src="{{ .Get "src" }}" alt="{{ .Get "alt" }}">
```

## 限制

`return` 语句必须是管道中的最后一条命令。下面的写法会产生错误：

```go-html-template
{{ return "even" | strings.ToUpper }}
```

[`text/template`]: https://pkg.go.dev/text/template

## 完整示例（实测）

局部模板 `layouts/_partials/parity.html`：

```go-html-template {file="layouts/_partials/parity.html"}
{{ if math.ModBool . 2 }}{{ return "even" }}{{ end }}{{ return "odd" }}
```

调用方：

```go-html-template
{{ partial "parity.html" 42 }} → even
{{ partial "parity.html" 7 }}  → odd
```

Hugo 0.167.0 实测：`42` 得到 `even`，`7` 得到 `odd`——返回值被直接当成字符串输出。

不带值的提前返回（`layouts/_partials/early.html`）：

```go-html-template {file="layouts/_partials/early.html"}
BEFORE{{ return }}AFTER
```

实测渲染为：

```text
BEFORE
```

**你应当看到什么**：`return` 之后的 `AFTER` 完全没有输出，模板就地结束。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 局部模板里 `{{ return 42 }}` | 调用方拿到 `42` | 否 |
| 局部模板里 `{{ return }}` | 只终止当前模板，之前渲染的输出保留 | 否 |
| **非**局部模板里返回值 | 构建失败：`return with a value is only supported in partials` | 是 |
| 返回类型 | 由返回值决定；签名标注为 `any` | 否 |

> [!WARNING]
> 上面一条错误发生在**模板转译阶段**（构建一开始就失败），不能用 [`try`](/functions/go-template/try/) 捕获。此外 `return` 必须是管道中的最后一条命令：把 `{{ return "even" | strings.ToUpper }}` 写成这样会直接报 `return must be the last command in a pipeline`（实测）。
