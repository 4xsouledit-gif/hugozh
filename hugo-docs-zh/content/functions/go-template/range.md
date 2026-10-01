+++
title = "range"
linkTitle = "range"
description = "遍历非空集合，把上下文（点）依次绑定到每个元素并执行代码块。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/go-template/range/"

[params.functions_and_methods]
signatures = ["range COLLECTION"]
+++

## 用法

集合可以是切片、映射或整数。

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  {{ . }} → foo bar baz
{{ end }}
```

与 [`else`][] 语句配合使用：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  <p>{{ . }}</p>
{{ else }}
  <p>The collection is empty</p>
{{ end }}
```

在 range 代码块内：

- 用 [`continue`][] 语句终止最内层迭代，并继续下一次迭代
- 用 [`break`][] 语句终止最内层迭代，并跳过其余所有迭代

参见模板入门中的[上下文][context]一节。

例如在 _page_ 模板顶部，[上下文][context]（点）是一个 `Page` 对象。在 `range` 代码块内，上下文会依次绑定到每个元素。

看这个刻意构造的例子：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  {{ .Title }}
{{ end }}
```

Hugo 会抛出错误：

```text
can't evaluate field Title in type int
```

产生这个错误，是因为我们试图在字符串上使用 `Title` 方法，而不是在 `Page` 对象上。在 `range` 代码块内，如果想渲染页面标题，就需要取到传入模板的上下文。

> [!NOTE]
> 用 `$` 取到传入模板的上下文。

下面这个模板会把页面标题渲染三次：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  {{ $.Title }}
{{ end }}
```

> [!NOTE]
> 对任何编写模板代码的人来说，透彻理解上下文都至关重要。

## 示例

以下示例演示如何遍历不同类型的集合。

### 标量切片

这段模板代码：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  <p>{{ . }}</p>
{{ end }}
```

渲染结果为：

```html
<p>foo</p>
<p>bar</p>
<p>baz</p>
```

这段模板代码：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $v := $s }}
  <p>{{ $v }}</p>
{{ end }}
```

渲染结果为：

```html
<p>foo</p>
<p>bar</p>
<p>baz</p>
```

这段模板代码：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $k, $v := $s }}
  <p>{{ $k }}: {{ $v }}</p>
{{ end }}
```

渲染结果为：

```html
<p>0: foo</p>
<p>1: bar</p>
<p>2: baz</p>
```

### 映射切片

这段模板代码：

```go-html-template
{{ $m := slice
  (dict "name" "John" "age" 30)
  (dict "name" "Will" "age" 28)
  (dict "name" "Joey" "age" 24)
}}
{{ range $m }}
  <p>{{ .name }} is {{ .age }}</p>
{{ end }}
```

渲染结果为：

```html
<p>John is 30</p>
<p>Will is 28</p>
<p>Joey is 24</p>
```

### 页面切片

这段模板代码：

```go-html-template
{{ range where site.RegularPages "Type" "articles" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

渲染结果为：

```html
<h2><a href="/articles/article-3/">Article 3</a></h2>
<h2><a href="/articles/article-2/">Article 2</a></h2>
<h2><a href="/articles/article-1/">Article 1</a></h2>
```

### 映射

这段模板代码：

```go-html-template
{{ $m :=  dict "name" "John" "age" 30 }}
{{ range $k, $v := $m }}
  <p>key = {{ $k }} value = {{ $v }}</p>
{{ end }}
```

渲染结果为：

```go-html-template
<p>key = age value = 30</p>
<p>key = name value = John</p>
```

与遍历数组或切片不同，遍历映射时 Hugo 按键排序。

### 整数

遍历正整数 `n` 会执行代码块 `n` 次，上下文从零开始，每次迭代加一。

```go-html-template
{{ $s := slice }}
{{ range 1 }}
  {{ $s = $s | append . }}
{{ end }}
{{ $s }} → [0]
```

```go-html-template
{{ $s := slice }}
{{ range 3 }}
  {{ $s = $s | append . }}
{{ end }}
{{ $s }} → [0 1 2]
```

遍历非正整数时，代码块执行零次。

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

[`break`]: /functions/go-template/break/
[`continue`]: /functions/go-template/continue/
[`else`]: /functions/go-template/else/
[context]: /templates/introduction/#上下文
