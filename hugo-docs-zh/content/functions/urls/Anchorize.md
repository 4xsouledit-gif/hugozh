+++
title = "urls.Anchorize"
linkTitle = "Anchorize"
description = "返回给定字符串，并把它清理为可用于 HTML id 属性的形式。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/urls/anchorize/"

[params.functions_and_methods]
signatures = ["urls.Anchorize INPUT"]
returnType = "string"
aliases = ["anchorize"]
+++

## 这一页解决什么问题

写目录、脚注或「跳到某节」的链接时，需要一个能安全放进 HTML `id` 属性的值：不能有空格、`<`、`&` 这些字符。`urls.Anchorize` 把标题文本清理成这样的锚点字符串——Hugo 生成标题 `id` 时用的也是同一套规则（受 `autoIDType` 配置影响）。

## 什么时候用，什么时候别用

**该用**：

- 手工构造指向页内锚点的 `href="#..."`；
- 想复现 Hugo 为标题生成的 `id`，用于自定义目录模板。

**别用**：

- 想清理成 **URL** 片段（要百分号编码）→ 用 [`urls.URLize`](/functions/urls/urlize/)：实测 `"Hugö"` 经 `anchorize` 得 `hugö`，经 `urlize` 得 `hug%C3%B6`；
- 想给整个地址做转义 → 用 [`urls.PathEscape`](/functions/urls/pathescape/)；
- 页面标题本来就会自动生成 `id`，只是要做目录 → 用 `.TableOfContents`，不必自己拼。

## 用法

[`anchorize`][] 与 [`urlize`][] 两个函数很相似：

- 用 `anchorize` 函数生成 HTML `id` 属性的值
- 用 `urlize` 函数把字符串清理为可用于 URL 的形式

例如：

```go-html-template
{{ $s := "A B C" }}
{{ $s | anchorize }} → a-b-c
{{ $s | urlize }} → a-b-c

{{ $s := "a b   c" }}
{{ $s | anchorize }} → a-b---c
{{ $s | urlize }} → a-b-c

{{ $s := "< a, b, & c >" }}
{{ $s | anchorize }} → -a-b--c-
{{ $s | urlize }} → a-b-c

{{ $s := "main.go" }}
{{ $s | anchorize }} → maingo
{{ $s | urlize }} → main.go

{{ $s := "Hugö" }}
{{ $s | anchorize }} → hugö
{{ $s | urlize }} → hug%C3%B6
```

`urls.Anchorize` 函数会按项目配置中的 [`autoIDType`][] 设置清理结果字符串。

[`anchorize`]: /functions/urls/anchorize/
[`urlize`]: /functions/urls/urlize/
[`autoIDType`]: /configuration/markup/#parserautoidtype

## 完整示例（实测）

```go-html-template {file="layouts/_partials/toc-link.html"}
[{{ anchorize "A B C" }}]|[{{ anchorize "a b   c" }}]|[{{ anchorize "main.go" }}]
```

Hugo 0.167.0 实测输出：

```text
[a-b-c]|[a-b---c]|[maingo]
```

**你应当看到什么**：空格变成短横，但**连续的空格不会被合并**（`a b   c` 得 `a-b---c` 而不是 `a-b-c`）；`main.go` 里的点被直接删掉，得到 `maingo`——这正是它与 [`urls.URLize`](/functions/urls/urlize/) 的关键差异。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows，未修改 `markup.goldmark.parser.autoIDType`（上游默认 `github`）。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"A B C"` | `a-b-c` | 否 |
| `"a b   c"` | `a-b---c`（连续空格逐个变短横，**不合并**） | 否 |
| `"< a, b, & c >"` | `-a-b--c-`（标点变成短横，首尾也留下短横） | 否 |
| `"main.go"` | `maingo`（点被删除） | 否 |
| `"Hugö"` | `hugö`（非 ASCII 字母保留且转小写） | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 锚点链接点了没反应 | 生成的 `id` 与实际标题的 `id` 不一致（`autoIDType` 配置或标题文本对不上） | 直接检查渲染后的 `id`，不要凭猜测拼；或改用 `.TableOfContents` |
| 没报错但结果不对 | URL 里出现 `hugö` 导致 404 | `anchorize` 只适合 `id`，不产生百分号编码 | 生成 URL 片段用 [`urls.URLize`](/functions/urls/urlize/) |
| 没报错但结果不对 | 目录里的锚点与标题不一致 | 标题里含连续空格或标点时的处理规则与直觉不同 | 用本页实测表对照，或让 Hugo 自己生成目录/锚点 |

更多排查入口见[故障排查](/troubleshooting/)。
