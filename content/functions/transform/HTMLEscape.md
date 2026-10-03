+++
title = "transform.HTMLEscape"
linkTitle = "HTMLEscape"
description = "返回把特殊字符替换为 HTML 实体后的给定字符串。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/transform/htmlescape/"

[params.functions_and_methods]
signatures = ["transform.HTMLEscape INPUT"]
returnType = "string"
aliases = ["htmlEscape"]
+++

## 这一页解决什么问题

要把用户输入、数据文件里的文本安全地放进 HTML：`&`、`<`、`>`、`'`、`"` 这五个字符在 HTML 里有特殊含义，原样输出会破坏结构甚至造成注入。`htmlEscape` 把它们换成实体。

`htmlEscape` 与 `transform.HTMLEscape` 是同一个函数：前者是别名。

> [!WARNING]
> **在 HTML 模板里直接输出 `htmlEscape` 的结果会得到「二次转义」。** 因为 Go 的 `html/template` 会再转义一次，`&amp;` 变成 `&amp;amp;`（实测见下文完整示例）。要得到预期的实体，必须再套 [`safe.HTML`](/functions/safe/html/)。这不是 bug，而是返回值类型为 `string`（而非 `template.HTML`）的必然后果。

## 什么时候用，什么时候别用

**该用**：

- 把值放进 **HTML 文本节点**或属性，且该值来自不受信任的来源；
- 生成 RSS/XML 之外的自定义输出，需要自己控制转义时机。

**别用**：

- 只想在 HTML 模板里安全输出一个变量 → **通常什么都不用做**：`{{ .Params.x }}` 已经会被自动转义，多此一举还可能造成二次转义；
- 目标是 XML/RSS → 用 [`transform.XMLEscape`](/functions/transform/xmlescape/)：它还会转义制表符与换行（实测）；
- 想放进 JavaScript 或 JSON → 用 [`encoding.Jsonify`](/functions/encoding/jsonify/)；
- 想把实体还原成字符 → 用 [`transform.HTMLUnescape`](/functions/transform/htmlunescape/)，方向相反。

## 上游给出的结果

`transform.HTMLEscape` 函数通过把五个特殊字符替换为 [HTML 实体][]来转义它们：

- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `'` → `&#39;`
- `"` → `&#34;`

例如：

```go-html-template
{{ htmlEscape "Lilo & Stitch" }} → Lilo &amp; Stitch
{{ htmlEscape "7 > 6" }} → 7 &gt; 6
```

## 完整示例：直接输出与 safeHTML 的差别

```go-html-template {file="layouts/_partials/escape.html"}
<p>{{ htmlEscape "Lilo & Stitch" }}</p>
<p>{{ htmlEscape "Lilo & Stitch" | safeHTML }}</p>
<p>{{ htmlEscape "7 > 6" | safeHTML }}</p>
```

Hugo 渲染出的 HTML 为（变量赋值行本身会留下空行，这里省略）：

```html
<p>Lilo &amp;amp; Stitch</p>
<p>Lilo &amp; Stitch</p>
<p>7 &gt; 6</p>
```

**你应当看到什么**：第一行在浏览器里会显示成 `Lilo &amp; Stitch`（实体被当成文本），这就是二次转义；第二、三行才能得到 `Lilo & Stitch` 和 `7 > 6` 的预期显示。**所以：在 HTML 模板里用 `htmlEscape`，几乎总要跟一个 `safeHTML`**。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。下表「返回值」一列是用纯文本输出格式测到的**函数原始返回**。

| 输入 | 原始返回值 | 是否报错 |
| --- | --- | --- |
| `"Lilo & Stitch"` | `Lilo &amp; Stitch` | 否 |
| `"7 > 6"` | `7 &gt; 6` | 否 |
| 单引号与双引号同时出现（输入为 `'"`） | `&#39;&#34;` | 否 |
| 数字 `42` | `42` | 否 |
| `nil` | 空字符串 `""` | 否 |
| 返回类型 | `string`（**不是** `template.HTML`，所以会被再次转义） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上出现 `&amp;amp;` | 返回值是 `string`，在 HTML 模板里被二次转义 | 加 `\| safeHTML`，或干脆不手动转义 |
| 没报错但结果不对 | 属性值里的引号仍然出问题 | 手写转义序列与上下文不匹配 | 属性场景优先用 Go 模板的自动转义，不要手工拼 |
| 没报错但结果不对 | 制表符、换行没有被转义 | `htmlEscape` 只处理那五个字符 | XML/RSS 场景用 [`transform.XMLEscape`](/functions/transform/xmlescape/) |
| 报错看不懂 | 函数名找不到 | 别名是 `htmlEscape`（小写 h）而不是 `htmlescape` | 写 `htmlEscape` 或 `transform.HTMLEscape` |

更多排查入口见[故障排查](/troubleshooting/)。

[HTML 实体]: https://developer.mozilla.org/en-US/docs/Glossary/Entity
