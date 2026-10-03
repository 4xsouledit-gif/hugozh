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

## 这一页解决什么问题

你想往 `<script>` 里塞一个**表达式**（数组、对象、函数调用），产物里却多了一对引号——`const tags = "[\"a\",\"b\"]"`。因为 Go 的 `html/template` 把 `<script>` 里的运行时字符串当成了**字符串字面量**：这样最安全，但你的数组变成了 JSON 文本。

`safe.JS`（别名 `safeJS`）声明「这段内容是一个合法的 JS 表达式，请按代码输出」。与之相对，如果你要输出的是一段**要放进引号之间的字符串内容**，应该用 [`safe.JSStr`](/functions/safe/jsstr/)。

## 什么时候用，什么时候别用

**该用**：

- 把结构化数据传进前端：`{{ $tags | jsonify | safeJS }}`（实测输出 `["a","b"]`，是合法的 JS 数组）；
- `{{ .Site.Params.analyticsId | safeJS }}` 这类来自站点配置的纯值；
- 需要在 `<script>` 里输出一段由你自己控制的表达式。

**别用**：

- 要放入引号之间（`"Title: " + {{ … }}`）→ 那是 [`safe.JSStr`](/functions/safe/jsstr/) 的场合，用错会输出未加引号的原始文本；
- 内容是合法但**不可信**的 JSON → 上游明确指出这不安全。正确做法是用 [`transform.Unmarshal`](/functions/transform/unmarshal/) 解析成对象再交给模板，模板会在 JS 上下文里输出清理后的 JSON；
- 内容来自用户输入 → `safe.JS` 不做任何校验，实测 `1; alert(1)` 会原样变成可执行语句。

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

Hugo 将上述代码渲染为（实测一致）：

```html
<script>const a = "x + y"</script>
```

要把该字符串声明为安全：

```go-html-template
{{ $js := "x + y" }}
<script>const a = {{ $js | safeJS }}</script>
```

Hugo 将上述代码渲染为（实测一致）：

```html
<script>const a = x + y</script>
```

## 完整示例：把切片作为 JS 数组输出

```go-html-template {file="layouts/_partials/tags-script.html"}
{{ $tags := slice "a" "b" }}
<script>
  未声明：const t1 = {{ $tags | jsonify }};
  已声明：const t2 = {{ $tags | jsonify | safeJS }};
</script>
```

Hugo 0.167.0 实测渲染为：

```html
<script>
  未声明：const t1 = "[\"a\",\"b\"]";
  已声明：const t2 = ["a","b"];
</script>
```

**你应当看到什么**：未声明的一行给 JSON 整体套了一对引号，还转义了内部的引号，`t1` 只是一个字符串；已声明的一行是真正的数组，`t2[0]` 才等于 `"a"`。**这是初学者最常遇到的一类「JS 里数据不对」的根因。**

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入情形 | 结果 | 是否报错 |
| --- | --- | --- |
| `"x + y"` 未声明 | `"x + y"`（加了引号，变成字符串） | 否 |
| `"x + y"` 加 `safeJS` | `x + y`（表达式） | 否 |
| `slice "a" "b" \| jsonify` 未声明 | `"[\"a\",\"b\"]"`（字符串化的 JSON） | 否 |
| 同上再加 `safeJS` | `["a","b"]`（真正的数组） | 否 |
| 含分号的可疑输入 `"1; alert(1)"` | 原样输出 `1; alert(1)`，会被浏览器执行——**放行前必须确认来源可信** | 否 |
| `nil` | 输出空字符串（实测 `{{ safeJS nil }}` 为空） | 否 |
| 数字（如 `42`） | 输出 `42` | 否 |
| 返回类型 | `template.JS` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | JS 里拿到的是字符串而不是数组/对象 | 未加 `safeJS`，字符串被当字面量并加了引号 | 用 `{{ $data \| jsonify \| safeJS }}`，或改用 `transform.Unmarshal` |
| 没报错但结果不对 | 数组前后出现 `[\"` 之类的反斜杠 | 在 JS **字符串**上下文里用了 `jsonify`，转义由上下文完成 | 这是正确行为：JSON 文本放进引号里本来就要转义；若要数组对象，见上一行 |
| 没报错但结果不对 | 输出位置出现 `"Title: " + x` 少了引号 | 把该放进引号的内容用了 `safeJS` | 引号之间的内容用 [`safe.JSStr`](/functions/safe/jsstr/) |
| 安全隐患 | 前端被注入任意脚本 | 对不可信字符串用了 `safeJS` | 只对自己生成的表达式使用；不可信数据用 `transform.Unmarshal` 走数据通道 |
| 报错看不懂 | `expected ... but found ...` 之类的 JS 报错出现在浏览器控制台 | `safeJS` 放行了不完整的表达式（如带尾随逗号、括号不配对） | 用 `jsonify` 生成结构化数据，别手工拼 JSON |

更多排查入口见[故障排查](/troubleshooting/)。

[Go documentation]: https://pkg.go.dev/html/template#JS
[`transform.Unmarshal`]: /functions/transform/unmarshal/
