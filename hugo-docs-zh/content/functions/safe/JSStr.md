+++
title = "safe.JSStr"
linkTitle = "JSStr"
description = "返回被声明为安全 JavaScript 字符串的给定字符串。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/safe/jsstr/"

[params.functions_and_methods]
signatures = ["safe.JSStr INPUT"]
returnType = "template.JSStr"
aliases = ["safeJSStr"]
+++

## 这一页解决什么问题

你要把站点标题写进 `<script>` 里的一段 JS 字符串：

```go-html-template
<script>const a = "Title: " + {{ $title }};</script>
```

产物却是 `"Lilo \u0026 Stitch"` —— `&` 被写成了 `\u0026`。这在 JS 里是等价的（`\u0026` 就是 `&`），但产物难以阅读、做字符串比对时会对不上。`safe.JSStr`（别名 `safeJSStr`）声明「这段内容是 JS 引号之间的字符串内容，请原样输出」。

**它是六个 `safe.*` 函数里最需要小心使用的一个**：实测字符串里若含 `"` 或换行，会直接破坏那段 JS。

## 什么时候用，什么时候别用

**该用**：

- 内容最终落在 JS 的引号之间（`"…"`、`'…'`），你希望原样保留 `&`、中文等字符；
- 内容是自己维护的站点标题、标签名等。

**别用**：

- 要输出**表达式**（数组、对象、函数调用）→ 用 [`safe.JS`](/functions/safe/js/)，实测用 `safeJS` 才能得到 `["a","b"]` 而不是被引号包起来的 JSON 文本；
- 字符串里可能出现 `"`、`'`、换行、`</script>` → 实测 `He said "hi"` 经 `safeJSStr` 会输出 `"He said "hi""`，那段 JS 直接失效；这类内容应该交给模板的默认转义（不要用 `safe.*`），或先做转义处理；
- 内容来自用户输入 → 不要用它。`safe.JSStr` 不做任何转义。

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.JSStr` 函数封装一段字符序列，用于嵌入 JavaScript 表达式中的引号之间。

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ $title := "Lilo & Stitch" }}
<script>
  const a = "Title: " + {{ $title }};
</script>
```

Hugo 将上述代码渲染为（实测一致）：

```html
<script>
  const a = "Title: " + "Lilo \u0026 Stitch";
</script>
```

要把该字符串声明为安全：

```go-html-template
{{ $title := "Lilo & Stitch" }}
<script>
  const a = "Title: " + {{ $title | safeJSStr }};
</script>
```

Hugo 将上述代码渲染为（实测一致）：

```html
<script>
  const a = "Title: " + "Lilo & Stitch";
</script>
```

## 完整示例：站点标题进 JS 字符串

```go-html-template {file="layouts/_partials/title-script.html"}
{{ $title := "Lilo & Stitch" }}
<script>
  未声明：const t1 = "Title: " + {{ $title }};
  已声明：const t2 = "Title: " + {{ $title | safeJSStr }};
</script>
```

Hugo 0.167.0 实测渲染为：

```html
<script>
  未声明：const t1 = "Title: " + "Lilo \u0026 Stitch";
  已声明：const t2 = "Title: " + "Lilo & Stitch";
</script>
```

**你应当看到什么**：`t1` 与 `t2` 在浏览器里**取值完全相同**（`\u0026` 就是 `&`）。差别只在源码可读性与字符串比对。如果你并不需要产物里出现裸 `&`，完全可以不加 `safeJSStr`——默认转义是更安全的默认值。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入情形 | 结果 | 是否报错 |
| --- | --- | --- |
| 含 `&` 的普通字符串，未声明 | `&` 变成 `\u0026`（JS 语义等价） | 否 |
| 同上加 `safeJSStr` | 原样输出 `&` | 否 |
| 含双引号 `He said "hi"` | 原样输出引号，产物变成 `"He said "hi""`——**那段 JS 被破坏** | 否（Hugo 不报错，浏览器里报语法错误） |
| 含换行 | 原样输出换行，JS 字符串里出现真实换行——**同样是非法 JS** | 否 |
| `nil` | 输出空字符串（实测 `{{ safeJSStr nil }}` 为空） | 否 |
| 返回类型 | `template.JSStr` | 否 |

> [!NOTE]
> `safe.*` 系列都不做校验。`safeJSStr` 只负责「不转义」，不负责「内容合法」。含引号或换行的字符串应当交给默认转义，或改用 `jsonify` 之类的工具生成。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 产物里出现 `\u0026`、`\u003c` | 默认把 JS 字符串上下文做了 Unicode 转义（语义等价） | 只是在意外观可加 `\| safeJSStr`；若不是必须，不必改 |
| 报错看不懂 | 浏览器控制台报 `Invalid or unexpected token` | 字符串里含引号或换行，被 `safeJSStr` 原样输出 | 去掉 `safeJSStr`，或先用 `jsonify`／`transform.Unmarshal` 生成合法内容 |
| 没报错但结果不对 | JS 里拿到的是字符串，不是数组 | 该用 [`safe.JS`](/functions/safe/js/) 的地方用了 `safeJSStr`（或两者都没用） | 表达式用 `safeJS`，引号内内容用 `safeJSStr` |
| 安全隐患 | 脚本被提前闭合 | 字符串里含 `</script>` 且被原样输出 | 不要对含此类字符的输入使用 `safe.*` |

更多排查入口见[故障排查](/troubleshooting/)。

[Go documentation]: https://pkg.go.dev/html/template#JSStr
