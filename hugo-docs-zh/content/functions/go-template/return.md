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
