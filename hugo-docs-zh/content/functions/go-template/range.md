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

## 这一页解决什么问题

`range` 是模板里的循环：遍历切片、映射、页面集合或整数，每轮把**上下文（点）**绑定到当前元素，然后执行块。本页真正要掌握的不是语法，而是**上下文切换**——进入 `range` 之后 `.` 不再是你以为的那个页面对象；要回到模板顶层的上下文，用 `$`。

## 什么时候用，什么时候别用

**该用**：

- 遍历页面集合输出列表：`{{ range where site.RegularPages "Section" "posts" }}`；
- 遍历 `hugo.Data` 或 `dict` 数据；
- 需要按固定次数重复（`{{ range 3 }}`）；
- 需要「集合为空时给提示」→ 配合 [`else`](/functions/go-template/else/)。

**别用**：

- 只是筛选 → 先用 [`where`](/functions/collections/where/) 筛，再 `range`，循环体更简单；
- 只是取前 N 个 / 排序 / 分组 → 用 [`collections.First`](/functions/collections/first/)、[`collections.Sort`](/functions/collections/sort/)、[`collections.Group`](/functions/collections/group/)；
- 想在循环中「找到就停」→ 用 [`break`](/functions/go-template/break/)（跳出）或 [`continue`](/functions/go-template/continue/)（跳过本轮）。

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

## 完整示例（实测）

```go-html-template
{{ range $k, $v := slice "foo" "bar" "baz" }}
  <p>{{ $k }}: {{ $v }}</p>
{{ end }}
{{ range 3 }}{{ . }}{{ end }}
```

Hugo 0.167.0 实测渲染（`range` 每轮自带空行，这里省略）：

```html
<p>0: foo</p>
<p>1: bar</p>
<p>2: baz</p>
```

```text
012
```

**你应当看到什么**：切片遍历时 `$k` 是下标；整数遍历 `{{ range 3 }}` 执行 3 次，点依次是 `0`、`1`、`2`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 空切片 / 空映射 | 代码块执行零次；带 `else` 时执行 `else`（实测输出 `<p>The collection is empty</p>`） | 否 |
| 遍历正整数 `n` | 代码块执行 `n` 次，点从 `0` 递增（实测 `range 3` → `[0 1 2]`） | 否 |
| 遍历映射 | 按键排序遍历（实测 `age` 在 `name` 之前） | 否 |
| 遍历字符串（如 `"abc"`） | —— | 是：`range can't iterate over abc` |
| 循环体内对字符串元素用 `.Title` | —— | 是：实测 `can't evaluate field Title in type string` |
| 循环体内用 `$` | 回到传入模板的上下文（实测 `{{ range slice "a" "b" }}{{ $.Title }}{{ end }}` → `Teach Test;Teach Test;`） | 否 |
| 遍历非正整数（`0`、负数） | 上游说明代码块执行零次（本次未单独测量） | 否 |

> [!NOTE]
> 上游 `range` 页给出的错误示例写的是 `can't evaluate field Title in type int`，而本站用 Hugo 0.167.0 实测得到的是 `can't evaluate field Title in type string`（示例里迭代的是字符串切片）。以你本地实际报错为准。
