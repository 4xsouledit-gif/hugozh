+++
title = "safe.URL"
linkTitle = "URL"
description = "返回被声明为安全 URL 或 URL 子串的给定字符串。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/safe/url/"

[params.functions_and_methods]
signatures = ["safe.URL INPUT"]
returnType = "template.URL"
aliases = ["safeURL"]
+++

## 这一页解决什么问题

你从配置里读出一个链接，写进 `href`：

```go-html-template
<a href="{{ $href }}">IRC</a>
```

产物却是 `<a href="#ZgotmplZ">IRC</a>`。Go 的 `html/template` 只信任 `http:`、`https:`、`mailto:` 以及相对地址，其它协议（`irc:`、`tel:`、`ftp:`、`data:`）一律替换成 `ZgotmplZ`。`safe.URL`（别名 `safeURL`）用来放行这些「你自己知道安全」的地址。

## 什么时候用，什么时候别用

**该用**：

- 地址协议不在 `http:`／`https:`／`mailto:` 之列，但你确知它安全（`irc:`、`tel:`、`matrix:`、自定义协议）；
- 需要输出 `data:` URI（实测不加 `safeURL` 会得到 `ZgotmplZ`）；
- 地址来自你自己的配置或已校验的数据。

**别用**：

- 地址来自用户输入或远端数据 → 用白名单校验协议，或只允许 `http`／`https`，不要直接 `safeURL`；
- 需要的是**带域名的绝对地址** → 用 [`urls.AbsURL`](/functions/urls/absurl/)、[`urls.RelURL`](/functions/urls/relurl/)，不要用 `safeURL` 拼；
- 想输出 HTML 或 CSS → 用 [`safe.HTML`](/functions/safe/html/)、[`safe.CSS`](/functions/safe/css/)；
- 目标与 `baseURL` 无关且需要在子路径部署下正确 → 先用 `relURL` 生成地址，再按需 `safeURL`。

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.URL` 函数封装已知安全的 URL 或 URL 子串。除以下协议（scheme）之外都被视为不安全：

- `http:`
- `https:`
- `mailto:`

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ $href := "irc://irc.freenode.net/#golang" }}
<a href="{{ $href }}">IRC</a>
```

Hugo 将上述代码渲染为（实测一致）：

```html
<a href="#ZgotmplZ">IRC</a>
```

> [!NOTE]
> `ZgotmplZ` 是一个特殊值，表示运行时有不安全的内容进入了 CSS 或 URL 上下文。

要把该字符串声明为安全：

```go-html-template
{{ $href := "irc://irc.freenode.net/#golang" }}
<a href="{{ $href | safeURL }}">IRC</a>
```

Hugo 将上述代码渲染为（实测一致）：

```html
<a href="irc://irc.freenode.net/#golang">IRC</a>
```

## 完整示例：IRC 链接与电话链接

```go-html-template {file="layouts/_partials/contact-links.html"}
{{ $irc := "irc://irc.freenode.net/#golang" }}
<p>未声明：<a href="{{ $irc }}">IRC</a></p>
<p>已声明：<a href="{{ $irc | safeURL }}">IRC</a></p>
{{ $tel := "tel:+8612345678" }}
<p>电话：<a href="{{ $tel | safeURL }}">拨打</a></p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>未声明：<a href="#ZgotmplZ">IRC</a></p>
<p>已声明：<a href="irc://irc.freenode.net/#golang">IRC</a></p>
<p>电话：<a href="tel:&#43;8612345678">拨打</a></p>
```

**你应当看到什么**：未声明的一行 `href` 变成了 `#ZgotmplZ`（点进去只会跳到页面顶部）；已声明的一行是真实的 `irc://` 地址。第三行注意 `+` 被 HTML 实体化为 `&#43;`——**这是 HTML 属性层面的转义，`safeURL` 管不着，也不影响浏览器解析**（`&#43;` 会被解码回 `+`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入（`href` 上下文） | 不加 `safeURL` | 加 `safeURL` |
| --- | --- | --- |
| `https://example.org/a?b=1&c=2` | 正常，`&` 写成 `&amp;` | 同上 |
| `mailto:a@example.org` | `mailto:a@example.org`（本来就允许） | 同上 |
| `/relative/path/`、`articles/hello/`、`//cdn.example.org/x.js` | 原样输出（相对地址与协议相对地址都允许） | 同上 |
| `irc://irc.freenode.net/#golang` | `#ZgotmplZ` | 原样输出 |
| `tel:+8612345678` | `#ZgotmplZ` | `tel:&#43;8612345678`（`+` 被实体化） |
| `ftp://example.org/x` | `#ZgotmplZ` | 原样输出（上游未说明，实测） |
| `data:text/plain,hi` | `#ZgotmplZ` | 原样输出 |
| `javascript:alert(1)` | `#ZgotmplZ` | `javascript:alert%281%29`——**协议被放行，只是括号被 URL 规范化。这是真实的安全风险，不要对不可信输入使用** |
| `""`（空字符串） | `href=""` | `href=""` |
| 数字（如 `42`） | — | `42`（先转成字符串） |
| `nil` | — | 空字符串 |
| 返回类型 | — | `template.URL`（不是普通 `string`） |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 产物里所有自定义协议链接都变成 `#ZgotmplZ` | 协议不在 `http`／`https`／`mailto` 白名单内 | 确认来源可信后加 `\| safeURL`；不可信则改白名单校验 |
| 没报错但结果不对 | 加了 `safeURL` 后地址里出现 `%28`、`&amp;` | URL 规范化与 HTML 属性转义照常进行，`safeURL` 只解除协议检查 | 这是正常行为；需要完全原样输出时不要用 HTML 属性承载 |
| 没报错但结果不对 | 「站点部署到子路径后链接 404」 | 手工拼了绝对路径 | 用 `relURL`／`absURL` 生成地址，而不是 `safeURL` |
| 安全隐患 | 用户可控的 `javascript:` 链接被放行 | 对不可信输入用了 `safeURL` | 只对自己维护的配置值使用；用户输入校验协议后再输出 |
| 报错看不懂 | 页面上原样出现 `{{ safeURL }}` 字样 | 把模板函数写进了内容 Markdown | 该逻辑要放在 `layouts/` 的模板里 |

更多排查入口见[故障排查](/troubleshooting/)。

[Go documentation]: https://pkg.go.dev/html/template#URL
