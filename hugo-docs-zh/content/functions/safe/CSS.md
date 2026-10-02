+++
title = "safe.CSS"
linkTitle = "CSS"
description = "返回被声明为安全 CSS 的给定字符串。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/safe/css/"

[params.functions_and_methods]
signatures = ["safe.CSS INPUT"]
returnType = "template.CSS"
aliases = ["safeCSS"]
+++

## 这一页解决什么问题

你把一个样式值从站点配置或页面参数里读出来，塞进 `style` 属性：

```go-html-template
<p style="{{ $style }}">foo</p>
```

构建不报错，浏览器里却看不到效果，产物里写的是 `style="ZgotmplZ"`。原因是 Go 的 `html/template` 不允许**运行时字符串**直接进入 CSS 上下文——它无法判断这个值是不是恶意的 CSS。`safe.CSS`（别名 `safeCSS`）就是用来跨越这道检查的：你声明这个字符串是合法 CSS，模板引擎照原样输出。

## 什么时候用，什么时候别用

**该用**：

- 样式值来自你自己维护的配置、页面参数或主题代码，且确知是合法 CSS；
- 需要把整条**声明**（`color: red;`）放进 `style` 属性或 `<style>` 块——这种写法不加 `safeCSS` 一定会得到 `ZgotmplZ`（实测）；
- 需要放入含空格、括号的 CSS 值（如 `rgb(0, 0, 255)`）——实测不加 `safeCSS` 会得到 `ZgotmplZ`。

**别用**：

- 值来自用户输入、URL 参数、远端接口 → 换成白名单校验（例如只接受预设的几个颜色名），不要靠 `safeCSS` 放行；
- 只是想让整个样式表生效 → 用 [Hugo Pipes](/hugo-pipes/) 处理 `.css` 文件并输出 `<link>`，不要在模板里拼 CSS 文本；
- 值本身是合法的**单个标识符**（如 `red`）且位于 `color: ` 之后 → 实测不加 `safeCSS` 也能输出，不必多加一层（但加了也无害）。

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.CSS` 函数封装已知安全、且符合以下任一项的内容：

1. CSS3 样式表产生式（stylesheet production），例如 `p { color: purple }`。
1. CSS3 规则产生式（rule production），例如 `a[href=~"https:"].foo#bar`。
1. CSS3 声明产生式（declaration production），例如 `color: red; margin: 2px`。
1. CSS3 值产生式（value production），例如 `rgba(0, 0, 255, 127)`。

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ $style := "color: red;" }}
<p style="{{ $style }}">foo</p>
```

Hugo 将上述代码渲染为（实测一致）：

```html
<p style="ZgotmplZ">foo</p>
```

> [!NOTE]
> `ZgotmplZ` 是一个特殊值，表示运行时有不安全的内容进入了 CSS 或 URL 上下文。

要把该字符串声明为安全：

```go-html-template
{{ $style := "color: red;" }}
<p style="{{ $style | safeCSS }}">foo</p>
```

Hugo 将上述代码渲染为（实测一致）：

```html
<p style="color: red;">foo</p>
```

## 完整示例：样式值来自站点配置

```toml
# hugo.toml
[params.style]
bg_color = '#fefefe'
text_color = '#222'
```

```go-html-template {file="layouts/_partials/theme-style.html"}
{{ $bg := site.Params.style.bg_color }}
{{ $fg := site.Params.style.text_color }}
<style>
  body {
    background-color: {{ $bg | safeCSS }};
    color: {{ $fg | safeCSS }};
  }
</style>
<p style="color: {{ $fg | safeCSS }};">示例文字</p>
```

渲染结果（实测）：

```html
<style>
  body {
    background-color: #fefefe;
    color: #222;
  }
</style>
<p style="color: #222;">示例文字</p>
```

**你应当看到什么**：`<style>` 块里出现的是真实的颜色值，而不是 `ZgotmplZ`。如果你把两个 `| safeCSS` 去掉，整块会变成 `ZgotmplZ`，页面样式全部失效——这是`<style>` 里最常见的一类「没报错但样式没了」。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入情形 | 结果 | 是否报错 |
| --- | --- | --- |
| 整条声明（`"color: red;"`）不加 `safeCSS` | `style="ZgotmplZ"` | 否 |
| 整条声明加上 `safeCSS` | `style="color: red;"` | 否 |
| 单个标识符值（`color: red`）不加 `safeCSS` | 正常输出 `color: red`——这个上下文 Go 本身就允许 | 否 |
| 含空格/括号的值（`color: rgb(0, 0, 255)`）不加 `safeCSS` | `color: ZgotmplZ` | 否 |
| `<style>` 块里的整条声明不加 `safeCSS` | `body { ZgotmplZ }` | 否 |
| 空字符串 `""` | `style=""` | 否 |
| 数字（如 `42`） | `style="42"`（先转成字符串） | 否 |
| 返回类型 | `template.CSS`（不是普通 `string`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 产物里出现 `style="ZgotmplZ"`，样式失效 | 运行时字符串进入 CSS 上下文，未声明为安全 | 在变量后加 `\| safeCSS`；若来自不可信来源，改为白名单校验 |
| 没报错但结果不对 | 部分样式生效、部分是 `ZgotmplZ` | 单个标识符能通过检查，含空格或括号的值不能 | 统一给需要放行的值加 `safeCSS` |
| 报错看不懂 | 页面上原样出现 `{{ safeCSS }}` 字样 | 把模板函数写进了内容 Markdown，而不是模板 | 把这段逻辑放进 `layouts/` 下的模板 |
| 安全隐患 | 主题被注入任意 CSS | 对用户可控制的值使用了 `safeCSS` | 只用它处理自己维护的配置值；用户输入走固定枚举 |

更多排查入口见[故障排查](/troubleshooting/)。

[Go documentation]: https://pkg.go.dev/html/template#CSS
