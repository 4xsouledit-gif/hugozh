+++
title = "safe.JS"
linkTitle = "JS"
description = "返回被声明为安全 JavaScript 表达式的给定字符串。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/safe/js/"

[params.functions_and_methods]
signatures = ["safe.JS INPUT"]
returnType = "template.JS"
aliases = ["safeJS"]
+++

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.JS` 函数封装已知安全的 EcmaScript5 表达式。

模板作者有责任确保被标记类型的表达式不会破坏预期的优先级，也不会产生语句/表达式歧义——例如传入 `{ foo: bar() }\n['foo']()` 这样的表达式时，它既是合法的 Expression，也是合法的 Program，但含义完全不同。

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

使用 `safe.JS` 函数包含合法但不可信的 JSON 是不安全的。安全的替代做法是用 [`transform.Unmarshal`][] 函数解析该 JSON，再把得到的对象传入模板；当它出现在 JavaScript 上下文中时，会被转换成经过清理的 JSON。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ $js := "x + y" }}
<script>const a = {{ $js }}</script>
```

Hugo 将上述代码渲染为：

```html
<script>const a = "x + y"</script>
```

要把该字符串声明为安全：

```go-html-template
{{ $js := "x + y" }}
<script>const a = {{ $js | safeJS }}</script>
```

Hugo 将上述代码渲染为：

```html
<script>const a = x + y</script>
```

[Go documentation]: https://pkg.go.dev/html/template#JS
[`transform.Unmarshal`]: /functions/transform/unmarshal/
