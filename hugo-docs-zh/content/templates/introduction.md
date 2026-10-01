+++
title = "简介"
linkTitle = "简介"
description = "介绍 Hugo 的模板语法：上下文、动作、变量、函数与方法。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/templates/introduction/"
+++

> [!NOTE]
> Hugo 在 v0.146.0 中彻底重写了模板系统。相关文档正在陆续更新，你可以先阅读[新版模板系统概览](/templates/new-templatesystem-overview/)。

## 模板是什么

模板用变量、函数与方法把内容、资源与数据转换为发布出去的页面。Hugo 使用 Go 的 `text/template` 与 `html/template` 包：前者生成文本输出，后者生成对代码注入安全的 HTML 输出。渲染 HTML 文件时，Hugo 默认使用 `html/template`。下面这个模板初始化两个变量，并在段落中显示它们的乘积：

```go-html-template
{{ $v1 := 6 }}
{{ $v2 := 7 }}
<p>The product of {{ $v1 }} and {{ $v2 }} is {{ mul $v1 $v2 }}.</p>
```

HTML 模板最常见，但你可以为任意输出格式创建模板，包括 CSV、JSON、RSS 与纯文本。

## 上下文

创建模板之前最需要理解的概念是**上下文**（context），也就是传入每个模板的数据。数据可能是一个简单值，但更常见的是对象及其方法。例如页面模板收到的是 `Page` 对象，它提供返回取值或执行动作的方法。

模板中的点（`.`）表示当前上下文。下例中的点就是 `Page` 对象，调用它的 `Title` 方法返回 front matter 中定义的标题：

```go-html-template {file="layouts/page.html"}
<h2>{{ .Title }}</h2>
```

上下文在模板内部会发生变化，`range` 与 `with` 块会把上下文重新绑定到其他值或对象上：

```go-html-template {file="layouts/page.html"}
<h2>{{ .Title }}</h2>

{{ range slice "foo" "bar" }}
  <p>{{ . }}</p>
{{ end }}

{{ with "baz" }}
  <p>{{ . }}</p>
{{ end }}
```

在 `range` 中，第一次迭代的上下文是 "foo"，第二次是 "bar"；`with` 块内的上下文是 "baz"。Hugo 把它渲染为：

```html
<h2>My Page Title</h2>
<p>foo</p>
<p>bar</p>
<p>baz</p>
```

在 `range` 或 `with` 块内，给点加上美元符号（`$`）即可访问传入模板的那个上下文：

```go-html-template {file="layouts/page.html"}
{{ with "foo" }}
  <p>{{ $.Title }} - {{ . }}</p>
{{ end }}
```

> [!NOTE]
> 请务必彻底理解上下文的概念。新手最常犯的模板错误都与上下文有关。

## 动作

成对的花括号表示模板动作的开始与结束，也就是模板内的数据求值或控制结构。动作中可以包含字面量（布尔值、字符串、整数、浮点数）、当前上下文、变量、函数、方法与 `nil` 关键字：

```go-html-template {file="layouts/page.html"}
{{ $convertToLower := true }}
{{ if $convertToLower }}
  <h2>{{ strings.ToLower .Title }}</h2>
{{ end }}
```

上例中，`$convertToLower` 是变量，`true` 是布尔字面量，`if` 是控制结构的开始，`strings.ToLower` 是把字符转为小写的函数，`Title` 是 `Page` 对象上的方法，`end` 是控制结构的结束。

### 空白处理

上例的输出带有空行与缩进。生产环境通常会把输出压缩，所以这些空白无关紧要；若要消除相邻空白，可以在动作定界符中加上连字符：

```go-html-template {file="layouts/page.html"}
{{- $convertToLower := true -}}
{{- if $convertToLower -}}
  <h2>{{ strings.ToLower .Title }}</h2>
{{- end -}}
```

空白包括空格、水平制表符、回车与换行。

### 引号字符

双引号用于解释型字符串字面量，其中的反斜杠会被当作特殊指令；反引号用于原始字符串字面量，其中的反斜杠与所有字符都按字面处理；单引号用于字符字面量，表示单个字符的 Unicode 数值。实际写模板时几乎用不到字符字面量，需要的基本都是字符串。

```go-html-template
{{ print "Hello world\u0021" }} → Hello world!
{{ print `Hello world\u0021` }} → Hello world\u0021
{{ print '!' }} → 33
```

### 管道

在动作中可以把一个值管道传给函数或方法，被管道传入的值会成为该函数或方法的最后一个参数。因此下面两种写法等价：

```go-html-template
{{ strings.ToLower "Hugo" }} → hugo
{{ "Hugo" | strings.ToLower }} → hugo
```

也可以把一个函数或方法的结果继续传给下一个。下面两组写法各自等价：

```go-html-template
{{ strings.TrimSuffix "o" (strings.ToLower "Hugo") }} → hug
{{ "Hugo" | strings.ToLower | strings.TrimSuffix "o" }} → hug
```

```go-html-template
{{ mul 6 (add 2 5) }} → 42
{{ 5 | add 2 | mul 6 }} → 42
```

> [!NOTE]
> 记住：被管道传入的值会成为目标函数或方法的最后一个参数。

### 换行与 nil

一个动作可以拆成多行书写，原始字符串字面量也可以跨行，两者都与写在一行的写法等价：

```go-html-template
{{ $v := or $arg1 $arg2 }}

{{ $v := or
  $arg1
  $arg2
}}
```

`nil` 关键字只能用于比较，不能作为任何函数或方法的参数，也不能赋给变量。下面这些用法是合法的：

```go-html-template
{{ if gt 42 nil }}
  <p>42 is greater than nil</p>
{{ end }}

{{ $pages := where .Site.RegularPages "Params.color" "ne" nil }}
```

而下面这些用法会抛出错误：

```go-html-template
{{ $a := nil }}
{{ add 3 nil }}
{{ nil | print }}
```

## 变量

变量是用户定义、以美元符号（`$`）开头的标识符，可以在动作中初始化或赋值，其值可以是标量、切片、映射或对象。用 `:=` 初始化变量，用 `=` 给已初始化的变量赋新值：

```go-html-template
{{ $total := 3 }}
{{ range slice 7 11 21 }}
  {{ $total = add $total . }}
{{ end }}
{{ $total }} → 42
```

在 `if`、`range`、`with` 块内初始化的变量作用域限于该块，在这些块之外初始化的变量作用域是整个模板。变量是切片或映射时，用 `index` 函数取值，注意切片下标从 0 开始：

```go-html-template
{{ $slice := slice "foo" "bar" "baz" }}
{{ index $slice 2 }} → baz

{{ $map := dict "a" "foo" "b" "bar" "c" "baz" }}
{{ index $map "c" }} → baz
{{ $map.c }} → baz
```

变量是映射或对象时，用点依次连接标识符即可取值或访问方法。对象与方法的名称首字母大写；为避免混淆，建议变量名与映射键名以小写字母或下划线开头。

## 函数与方法

函数在动作中调用，接收一个或多个参数并返回一个值，不与对象关联。Go 的模板包只提供少量通用函数，Hugo 则按命名空间提供了大量自定义函数，例如 `strings` 命名空间下的 `strings.ToLower`、`strings.ToUpper`、`strings.Replace` 等。常用函数有别名，例如 `strings.ToLower` 的别名是 `lower`，两者等价。调用函数时，函数名与各参数之间用空格分隔：

```go-html-template
{{ strings.ToLower "Hugo" }} → hugo
{{ lower "Hugo" }} → hugo
{{ $total := add 1 2 3 4 }}
```

方法在动作中调用并与某个对象关联，接收零个或多个参数，返回一个值或执行一个动作。最常用的对象是 `Page` 与 `Site`：`Page` 的 `Date`、`Params`、`Title` 分别返回页面日期、front matter 中的自定义参数映射与页面标题；`Site` 的 `Data`、`Params`、`Title` 分别返回由 `data` 目录文件构成的数据结构、项目配置中的自定义参数映射与站点标题。用点把方法连接到对象上，开头的点表示当前上下文：

```go-html-template {file="layouts/page.html"}
{{ .Site.Title }} → My Site Title
{{ .Page.Title }} → My Page Title
```

多数模板的上下文就是 `Page` 对象，所以上面的 `.Page.Title` 可以简写为 `.Title`。有些方法带参数，参数与方法之间同样用空格分隔：

```go-html-template {file="layouts/page.html"}
{{ $page := .Page.GetPage "/books/les-miserables" }}
{{ $page.Title }} → Les Misérables
```

## 注释

模板注释与动作写法相似，由成对的花括号构成，注释中的代码不会被解析、执行或显示：

```go-html-template
{{/* This is an inline comment. */}}
{{- /* This is an inline comment with adjacent whitespace removed. */ -}}
```

注释不能嵌套。注意不要用 HTML 注释定界符来注释模板代码：Hugo 虽然会在渲染页面时去掉 HTML 注释，但会先求值其中的模板代码，这可能产生意外结果甚至导致构建失败。要输出真正的 HTML 注释，把字符串交给 `safeHTML` 函数：

```go-html-template
{{ "<!-- I am an HTML comment. -->" | safeHTML }}
```

## 引入其他模板

用 `partial` 或 `partialCached` 引入局部模板，用 `template` 引入 Hugo 内置模板。局部模板创建在 `layouts/_partials` 目录中：

```go-html-template
{{ partial "google_analytics.html" . }}
{{ partial "pagination.html" . }}
{{ partial "breadcrumbs.html" . }}
{{ partialCached "css.html" . }}
```

注意这些调用都把当前上下文（点）作为参数传给了被引入的模板。

## 示例

### 条件块

用 `if`、`else if`、`else` 与 `end` 构成条件分支：

```go-html-template
{{ $var := 42 }}
{{ if eq $var 6 }}
  {{ print "var is 6" }}
{{ else if eq $var 42 }}
  {{ print "var is 42" }}
{{ else }}
  {{ print "var is something else" }}
{{ end }}
```

### 逻辑运算

`and` 在所有参数都为真时返回真，`or` 在任一参数为真时返回真：

```go-html-template
{{ $v1 := true }}
{{ $v2 := false }}
{{ $result := false }}

{{ if and $v1 $v2 }}
  {{ $result = true }}
{{ end }}
{{ $result }} → false

{{ if or $v1 $v2 }}
  {{ $result = true }}
{{ end }}
{{ $result }} → true
```

### 循环

用 `range` 遍历集合，集合为空时可以用 `else` 分支处理；也可以直接对一个数字循环指定次数：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  <p>{{ . }}</p>
{{ else }}
  <p>The collection is empty</p>
{{ end }}

{{ $s = slice }}
{{ range 3 }}
  {{ $s = $s | append . }}
{{ end }}
{{ $s }} → [0 1 2]
```

### 重新绑定上下文

`with` 在值为真时把上下文重新绑定到该值，否则执行 `else` 分支；`else with` 可以连续测试多个条件：

```go-html-template
{{ $v1 := 0 }}
{{ $v2 := 42 }}
{{ with $v1 }}
  {{ . }}
{{ else with $v2 }}
  {{ . }} → 42
{{ else }}
  {{ print "v1 and v2 are falsy" }}
{{ end }}
```

### 访问站点参数与页面参数

站点参数通过 `Site` 对象的 `Params` 方法取得。以下面这段项目配置为例：

```toml
title = 'ABC Widgets'
baseURL = 'https://example.org/'
[params]
  subtitle = 'The Best Widgets on Earth'
  copyright-year = '2023'
  [params.author]
    email = 'jsmith@example.org'
    name = 'John Smith'
  [params.layouts]
    rfc_1123 = 'Mon, 02 Jan 2006 15:04:05 MST'
    rfc_3339 = '2006-01-02T15:04:05-07:00'
```

逐级连接标识符即可访问这些自定义站点参数：

```go-html-template
{{ .Site.Params.subtitle }} → The Best Widgets on Earth
{{ .Site.Params.author.name }} → John Smith

{{ $layout := .Site.Params.layouts.rfc_1123 }}
{{ .Site.Lastmod.Format $layout }} → Tue, 17 Oct 2023 13:21:02 PDT
```

页面参数通过 `Page` 对象的 `Params` 方法取得。`title`、`date` 等是标准的 front matter 字段，其余为用户自定义字段：

```go-html-template
{{ .Params.display_related }} → true
{{ .Params.author.email }} → jsmith@example.org
```

键名必须是合法标识符（例如不能含连字符）才能这样连接取值；否则要用 `index` 函数，例如 `{{ index .Params "key-with-hyphens" }}`。
