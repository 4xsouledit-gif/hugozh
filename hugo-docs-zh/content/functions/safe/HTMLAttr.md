+++
title = "safe.HTMLAttr"
linkTitle = "HTMLAttr"
description = "返回被声明为安全 HTML 属性的给定键值对。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/safe/htmlattr/"

[params.functions_and_methods]
signatures = ["safe.HTMLAttr INPUT"]
returnType = "template.HTMLAttr"
aliases = ["safeHTMLAttr"]
+++

## 这一页解决什么问题

有时你想一次输出**整个属性**，而不只是属性的值：

```go-html-template
<time {{ printf "datetime=%q" $machineDate }}>{{ $humanDate }}</time>
```

结果产物里是 `<time ZgotmplZ>` —— 属性不见了。原因是 Go 的 `html/template` 在「属性名」这个位置只接受编译期已知的固定内容，运行时的字符串一律替换成 `ZgotmplZ`。`safe.HTMLAttr`（别名 `safeHTMLAttr`）用来放行这种「属性名 + 值」一起拼的写法。

## 什么时候用，什么时候别用

**该用**：

- 需要把属性名和值作为一个整体插入，例如 `printf "datetime=%q" $t | safeHTMLAttr`；
- 需要避开属性**值**上下文里的额外转义：实测 `datetime="2024-05-26T07:19:55+02:00"` 在普通写法下会变成 `&#43;`，用 `safeHTMLAttr` 才是原样的 `+`；
- 属性内容来自你自己的配置或已校验的数据。

**别用**：

- 只需要输出属性**值**、属性名是固定的 → 直接 `<div class="{{ $cls }}">` 就够了（引号内的值上下文本来就会转义），加 `safeHTMLAttr` 反而会取消这层保护；
- 属性内容来自用户输入 → 不要用它；`safe.HTMLAttr` 不做任何校验；
- 内容其实是 URL 或 CSS → 用 [`safe.URL`](/functions/safe/url/)、[`safe.CSS`](/functions/safe/css/)。

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.HTMLAttr` 函数封装来自可信来源的 HTML 属性。

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ with .Date }}
  {{ $humanDate := time.Format "2 Jan 2006" . }}
  {{ $machineDate := time.Format "2006-01-02T15:04:05-07:00" . }}
  <time datetime="{{ $machineDate }}">{{ $humanDate }}</time>
{{ end }}
```

Hugo 将上述代码渲染为（实测一致，注意 `+` 被转义）：

```html
<time datetime="2024-05-26T07:19:55&#43;02:00">26 May 2024</time>
```

要把该键值对声明为安全：

```go-html-template
{{ with .Date }}
  {{ $humanDate := time.Format "2 Jan 2006" . }}
  {{ $machineDate := time.Format "2006-01-02T15:04:05-07:00" . }}
  <time {{ printf "datetime=%q" $machineDate | safeHTMLAttr }}>{{ $humanDate }}</time>
{{ end }}
```

Hugo 将上述代码渲染为（实测一致）：

```html
<time datetime="2024-05-26T07:19:55+02:00">26 May 2024</time>
```

## 完整示例：把属性整段拼出来

页面前置元数据里写 `date = 2024-05-26T07:19:55+02:00`，模板：

```go-html-template {file="layouts/_partials/pubdate.html"}
{{ with .Date }}
  {{ $humanDate := time.Format "2 Jan 2006" . }}
  {{ $machineDate := time.Format "2006-01-02T15:04:05-07:00" . }}
  <p>普通值写法：<time datetime="{{ $machineDate }}">{{ $humanDate }}</time></p>
  <p>整段属性写法：<time {{ printf "datetime=%q" $machineDate | safeHTMLAttr }}>{{ $humanDate }}</time></p>
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
<p>普通值写法：<time datetime="2024-05-26T07:19:55&#43;02:00">26 May 2024</time></p>
<p>整段属性写法：<time datetime="2024-05-26T07:19:55+02:00">26 May 2024</time></p>
```

**你应当看到什么**：两行的文字部分相同，差别只在 `datetime` 的值——普通写法里 `+` 变成了 `&#43;`（浏览器仍能解析，但复制出去的值、以及做字符串比对的测试会不一样），整段属性写法才是原样的 `+`。这就是 `safe.HTMLAttr` 最实用的一处：**保持机器可读属性值原样**。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入情形 | 结果 | 是否报错 |
| --- | --- | --- |
| 整段属性在属性名位置，未声明 | 变成 `ZgotmplZ`（实测 `<div ZgotmplZ>d</div>`） | 否 |
| 同样的输入加上 `safeHTMLAttr` | 原样输出（实测 `<div class="x">d</div>`） | 否 |
| 只作为属性**值**输出（两边有引号） | 无论有没有 `safeHTMLAttr` 都正常，实测 `<div data-x="a b">` | 否 |
| `nil` | 输出空字符串（实测 `{{ safeHTMLAttr nil }}` 为空） | 否 |
| 数字（如 `42`） | 输出 `42` | 否 |
| 未加引号的属性值 | 上游未说明该组合；实测 `printf "data-x=%q"` 会自己带上引号，可以正常工作 | 否 |
| 返回类型 | `template.HTMLAttr` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 产物里出现 `<time ZgotmplZ>` | 运行时字符串落在了属性名位置，未声明为安全 | 用 `{{ printf "datetime=%q" $v \| safeHTMLAttr }}` 这类写法 |
| 没报错但结果不对 | `+`、`&` 在属性值里变成实体 | 值上下文会做 HTML 转义 | 需要机器可读的原值就用 `safeHTMLAttr` 整段拼 |
| 没报错但结果不对 | 属性值两侧引号重复或缺失 | `%q` 已自带引号，外面又写了一层 | 用 `%q` 时不要再手写引号：`<time {{ printf "datetime=%q" $v \| safeHTMLAttr }}>` |
| 安全隐患 | 属性被注入事件处理器（如 `onmouseover=…`） | 对用户可控内容用了 `safeHTMLAttr` | 只对自己拼的属性使用；用户内容不要进属性名位置 |

更多排查入口见[故障排查](/troubleshooting/)。

[Go documentation]: https://pkg.go.dev/html/template#HTMLAttr
