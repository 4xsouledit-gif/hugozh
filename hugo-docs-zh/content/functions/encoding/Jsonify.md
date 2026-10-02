+++
title = "encoding.Jsonify"
linkTitle = "Jsonify"
description = "返回给定对象编码为 JSON 后的结果。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/encoding/jsonify/"

[params.functions_and_methods]
signatures = ["encoding.Jsonify [OPTIONS] INPUT"]
returnType = "template.HTML"
aliases = ["jsonify"]
+++

## 这一页解决什么问题

要把模板里的数据交给前端 JavaScript：站点搜索索引、页面元数据、图表数据。在模板里手写 JSON 拼接既容易漏引号，又会碰上前端拿到 HTML 实体（`&amp;`）而不是原始字符的问题。`jsonify` 把映射、切片、标量编码成合法 JSON。

**关键点**：它的返回类型是 `template.HTML`，也就是 Hugo 认为这段内容已经是「安全 HTML」，**不会在输出时再做一次 HTML 转义**。默认情况下，JSON 字符串里的 `&`、`<`、`>` 会被编码成 `\u0026`、`\u003c`、`\u003e`，这正是为了能安全地嵌进 `<script>`。

`jsonify` 与 `encoding.Jsonify` 是同一个函数：前者是别名。

## 什么时候用，什么时候别用

**该用**：

- 在 `<script type="application/json">` 里输出数据给前端读取；
- 生成站点索引、搜索数据、图表数据源；
- 需要自定义缩进（`indent`）或前缀（`prefix`）让产物可读。

**别用**：

- 想要 YAML 或 TOML → 用 [`transform.Remarshal`](/functions/transform/remarshal/)；
- 想把 JSON 塞进 **HTML 属性**（`data-json="…"`）→ 返回值是 `template.HTML`，**不会**被再次转义，JSON 里的双引号会直接破坏属性；先自己转义（如 [`transform.HTMLEscape`](/functions/transform/htmlescape/)）或用 `printf "%q"`；
- 想输出到纯文本文件且不想要 HTML 转义 → 传 `noHTMLEscape = true`，或确认消费端能接受 `\u003c` 这类转义；
- 想把对象转成可读文本做调试 → [`debug.Dump`](/functions/debug/dump/) 更直观。

## 用法

要自定义 JSON 的输出格式，把选项映射作为第一个参数传入。支持的选项有 "prefix" 与 "indent"。输出中的每个 JSON 元素都会另起一行，行首是 _prefix_，其后按缩进层级重复一或多份 _indent_。

```go-html-template
{{ dict "title" .Title "content" .Plain | jsonify }}
{{ dict "title" .Title "content" .Plain | jsonify (dict "indent" "  ") }}
{{ dict "title" .Title "content" .Plain | jsonify (dict "prefix" " " "indent" "  ") }}
```

## 选项

`encoding.Jsonify` 函数接受一个选项映射。

`indent`
: (`string`) 使用的缩进。默认是 ""。

`prefix`
: (`string`) 缩进前缀。默认是 ""。

`noHTMLEscape`
: (`bool`) 是否禁用对 JSON 引号字符串中问题 HTML 字符的转义。默认行为是把 `&`、`<`、`>` 转义为 `\u0026`、`\u003c`、`\u003e`，以避免把 JSON 嵌入 HTML 时可能出现的某些安全问题。默认是 `false`。

## 完整示例：输出给前端的 JSON

```go-html-template {file="layouts/_partials/data.html"}
{{ $m := dict "title" "Hello" "tags" (slice "a" "b") }}
<p>{{ $m | jsonify }}</p>
<p>{{ $m | jsonify (dict "indent" "  ") }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>{"tags":["a","b"],"title":"Hello"}</p>
<p>{
  "tags": [
    "a",
    "b"
  ],
  "title": "Hello"
}</p>
```

**你应当看到什么**：键按**字节序排序**（`tags` 在 `title` 前，实测大写键排在全部小写键之前，例如 `{"C":3,"a":2,"b":1}`），不能依赖映射的书写顺序；`indent` 让每个元素另起一行。默认不对 JSON 做 HTML 转义以外的事——字符串里的 `&`、`<`、`>` 会被转成 `\u0026` 等（见边界表）。另外，实测 `noHTMLEscape = true` 时输出里的 `<b>&</b>` 会**原样**出现在最终 HTML 中（没有被二次转义成 `&lt;b&gt;`），这正是 `template.HTML` 返回类型带来的行为，也是它不能直接放进 HTML 属性的原因。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `dict "a" 1 "b" "x"` | `{"a":1,"b":"x"}` | 否 |
| `slice 1 2 3` | `[1,2,3]` | 否 |
| `dict "html" "<b>&</b>"` | `{"html":"\u003cb\u003e\u0026\u003c/b\u003e"}`（默认转义） | 否 |
| 同上 + `noHTMLEscape = true` | `{"html":"<b>&</b>"}` | 否 |
| `dict "a" 1`，键含大写与不同大小写 | `{"C":3,"a":2,"b":1}`（按字节序） | 否 |
| 字符串 `""` / `42` / `true` | `""` / `42` / `true` | 否 |
| 空切片 / 空映射 | `[]` / `{}` | 否 |
| 未知选项（如 `dict "bogus" true`） | 被忽略，正常输出 | 否 |
| `nil` 作为管道起点（`{{ nil \| jsonify }}`） | —— | 是：`nil is not a command`（模板语法限制，与 `jsonify` 无关） |
| 返回类型 | `template.HTML`（实测 `printf "%T"` 输出 `template.HTML`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 前端拿到的字符串里出现 `\u003c` | 默认会把 `<`、`>`、`&` 转义（这是有意为之） | 消费端先 `JSON.parse` 即可还原；确需原样时传 `noHTMLEscape = true` |
| 没报错但结果不对 | 塞进 HTML 属性后页面结构被破坏 | 返回类型是 `template.HTML`，不会被再次转义 | 属性场景先转义（[`transform.HTMLEscape`](/functions/transform/htmlescape/)），或改用 `<script type="application/json">` |
| 没报错但结果不对 | 键的顺序每次「看起来」不一样 | 映射无序，实测输出按字节序排序 | 不要依赖顺序；需要固定顺序就用切片 |
| 报错看不懂 | `nil is not a command` | 管道起点写了 `nil` | 直接写函数式，或先用变量保存对象 |

更多排查入口见[故障排查](/troubleshooting/)。
