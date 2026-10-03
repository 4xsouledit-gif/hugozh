+++
title = "safe.HTML"
linkTitle = "HTML"
description = "返回被声明为安全 HTML 的给定字符串。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/safe/html/"

[params.functions_and_methods]
signatures = ["safe.HTML INPUT"]
returnType = "template.HTML"
aliases = ["safeHTML"]
+++

## 这一页解决什么问题

模板里写 `{{ $html }}` 输出一段带标签的字符串，结果页面上原样显示 `&lt;em&gt;emphasized&lt;/em&gt;`——标签变成了文字。这不是 bug，而是 Go 的 `html/template` 在 HTML 正文上下文里对运行时字符串做了转义：它无法判断这段字符串是不是攻击者塞进来的 `<script>`。

`safe.HTML`（别名 `safeHTML`）用来把「我自己生成、必定安全」的 HTML 片段放行。站点配置里存一段 SVG、模板里拼一段链接列表，都会用到它。

## 什么时候用，什么时候别用

**该用**：

- HTML 片段由你自己的模板/配置/主题提供，内容完全可控；
- 需要把站点参数里的富文本片段、自定义 icon、结构化片段原样插入页面。

**别用**：

- HTML 来自第三方、用户表单、远端接口 → 这样做等于关掉了本站的 XSS 防护；应改为清洗后再输出，或改为让模板生成结构（`range` + 标签）而不是拼字符串；
- 想让 Markdown 变成 HTML → 用 [`transform.Markdownify`](/functions/transform/markdownify/)；
- 想让**属性**原样输出（如 `datetime="..."` 整段）→ 用 [`safe.HTMLAttr`](/functions/safe/htmlattr/)；
- 内容其实是 URL 或 CSS → 用 [`safe.URL`](/functions/safe/url/)、[`safe.CSS`](/functions/safe/css/)。用错函数在部分上下文里仍然会被转义。

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.HTML` 函数封装已知安全的 HTML 文档片段。不要用它处理来自第三方的 HTML，也不要处理带有未闭合标签或注释的 HTML。

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ $html := "<em>emphasized</em>" }}
{{ $html }}
```

Hugo 将上述代码渲染为（实测一致）：

```html
&lt;em&gt;emphasized&lt;/em&gt;
```

要把该字符串声明为安全：

```go-html-template
{{ $html := "<em>emphasized</em>" }}
{{ $html | safeHTML }}
```

Hugo 将上述代码渲染为（实测一致）：

```html
<em>emphasized</em>
```

## 完整示例：把配置里的 SVG 图标插进页面

```go-html-template {file="layouts/_partials/icon.html"}
{{ $icon := `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>` }}
<p>未声明：{{ $icon }}</p>
<p>已声明：{{ $icon | safeHTML }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>未声明：&lt;svg xmlns=&#34;http://www.w3.org/2000/svg&#34; viewBox=&#34;0 0 16 16&#34;&gt;&lt;circle cx=&#34;8&#34; cy=&#34;8&#34; r=&#34;8&#34;/&gt;&lt;/svg&gt;</p>
<p>已声明：<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg></p>
```

**你应当看到什么**：未声明的一行把 `<`、`>`、`"` 分别转义成了 `&lt;`、`&gt;`、`&#34;`（注意引号也会被转义）；已声明的一行原样输出，浏览器会画出圆形。**同一段字符串，差别只在那一个管道操作**。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入情形 | 结果 | 是否报错 |
| --- | --- | --- |
| 含标签的字符串，未声明 | 标签被转义为实体（`<`→`&lt;`、`>`→`&gt;`、`"`→`&#34;`） | 否 |
| 含标签的字符串，已声明 | 原样输出 | 否 |
| `nil` | 输出空字符串（实测 `{{ safeHTML nil }}` 为空） | 否 |
| 数字（如 `42`） | 输出 `42` | 否 |
| 空字符串 `""` | 输出空字符串 | 否 |
| 未闭合的标签或注释 | 函数不做校验，原样返回（上游：不要这样用） | 否 |
| 返回类型 | `template.HTML`（不是普通 `string`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上出现 `&lt;p&gt;` 之类的实体文本 | 运行时字符串在 HTML 上下文中被转义 | 确认内容可信后加 `\| safeHTML`；不可信则应清洗 |
| 没报错但结果不对 | 加了 `safeHTML` 但样式/属性还是不对 | 内容落在属性、URL 或 JS 上下文，`template.HTML` 在那里不生效 | 改成对应上下文的函数（`safe.HTMLAttr`、`safe.URL`、`safe.JS`） |
| 没报错但结果不对 | 输出里多出一堆换行 | 多行字符串原样插入，模板缩进也一并输出 | 用 `{{- -}}` 裁剪空白，或把片段压成一行 |
| 安全隐患 | 主题被注入脚本 | 对用户可控内容用了 `safeHTML` | 只对自己生成的片段使用；用户内容一律转义 |

更多排查入口见[故障排查](/troubleshooting/)。

[Go documentation]: https://pkg.go.dev/html/template#HTML
