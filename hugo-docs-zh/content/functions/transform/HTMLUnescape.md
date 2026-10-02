+++
title = "transform.HTMLUnescape"
linkTitle = "HTMLUnescape"
description = "返回把每个 HTML 实体替换为对应字符后的给定字符串。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/transform/htmlunescape/"

[params.functions_and_methods]
signatures = ["transform.HTMLUnescape INPUT"]
returnType = "string"
aliases = ["htmlUnescape"]
+++

## 这一页解决什么问题

数据源里的文本可能存着 HTML 实体：RSS/API 的标题写成 `Lilo &amp; Stitch`、旧数据里的 `&#39;`、抓取来的页面片段。要在模板里**比较、截断、搜索**这些文本时，实体形式会碍事——`eq $title "Lilo & Stitch"` 对 `Lilo &amp; Stitch` 不成立。`htmlUnescape` 先把实体还原成字符。

`htmlUnescape` 与 `transform.HTMLUnescape` 是同一个函数：前者是别名。

## 什么时候用，什么时候别用

**该用**：

- 比较或处理前先规范化文本（把实体还原为字符）；
- 从外部数据里取出的字符串需要参与 `strings` 系列处理；
- 需要把 `&lt;b&gt;x&lt;/b&gt;` 这类**转义过的标签**重新当成标签输出（配合 [`safe.HTML`](/functions/safe/html/)）。

**别用**：

- 只是想安全输出变量 → **不用手动处理**：Go 的 `html/template` 会自动转义，多一层反而绕；
- 方向相反（把特殊字符变成实体）→ 用 [`transform.HTMLEscape`](/functions/transform/htmlescape/)；
- XML/RSS 场景 → 用 [`transform.XMLEscape`](/functions/transform/xmlescape/)；
- 想清理不受信任的 HTML → `htmlUnescape` **不做净化**，它只是还原字符；要丢弃危险标签得自己过滤。

## 上游给出的结果

`transform.HTMLUnescape` 函数把 [HTML 实体][]替换为对应的字符。

```go-html-template
{{ htmlUnescape "Lilo &amp; Stitch" }} → Lilo & Stitch
{{ htmlUnescape "7 &gt; 6" }} → 7 > 6
```

在多数场景下，Go 的 [`html/template`][] 包会转义特殊字符。要绕过这一行为，请把未转义的字符串交给 [`safe.HTML`][] 函数。

```go-html-template
{{ htmlUnescape "Lilo &amp; Stitch" | safeHTML }}
```

## 完整示例：还原实体并按需声明安全

```go-html-template {file="layouts/_partials/unescape.html"}
<p>{{ htmlUnescape "Lilo &amp; Stitch" }}</p>
<p>{{ htmlUnescape "7 &gt; 6" }}</p>
<p>{{ htmlUnescape "&lt;b&gt;x&lt;/b&gt;" | safeHTML }}</p>
```

Hugo 渲染出的 HTML 为（变量赋值行本身会留下空行，这里省略）：

```html
<p>Lilo &amp; Stitch</p>
<p>7 &gt; 6</p>
<p><b>x</b></p>
```

**你应当看到什么**：第一、二行的实体在浏览器里显示为 `Lilo & Stitch` 与 `7 > 6`——因为 Go 模板在输出时又把 `&`、`>` 转义回了实体；第三行用了 `safeHTML`，`<b>x</b>` 才被当成标签渲染成粗体。换句话说：**还原得到的是「字符串」，是否按 HTML 解释由输出上下文决定**。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。下表「返回值」一列是函数原始返回。

| 输入 | 原始返回值 | 是否报错 |
| --- | --- | --- |
| `"Lilo &amp; Stitch"` | `Lilo & Stitch` | 否 |
| `"7 &gt; 6"` | `7 > 6` | 否 |
| `"&#39;"` | `'` | 否 |
| `"&unknown;"`（未定义的实体） | `&unknown;`（原样保留） | 否 |
| `nil` | 空字符串 `""` | 否 |
| 数字 `42` | `42` | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 还原后页面显示又变回了 `&amp;` | 模板输出时自动转义了 `&` | 这是正常的；想让内容按 HTML 解释就加 `safeHTML` |
| 没报错但结果不对 | 加了 `safeHTML` 后标签生效，但页面结构乱了 | `htmlUnescape` 不做净化，原数据里的任意标签都会被执行 | 只对可信来源用 `safeHTML`；不可信数据不要还原后直接输出 |
| 没报错但结果不对 | 某些实体没还原 | 名字不在实体表里（实测 `&unknown;` 原样保留） | 检查数据源里的实体名是否合法 |
| 报错看不懂 | 函数名找不到 | 别名是 `htmlUnescape`（小写 h） | 写 `htmlUnescape` 或 `transform.HTMLUnescape` |

更多排查入口见[故障排查](/troubleshooting/)。

[HTML 实体]: https://developer.mozilla.org/en-US/docs/Glossary/Entity
[`html/template`]: https://pkg.go.dev/html/template
[`safe.HTML`]: /functions/safe/html/
