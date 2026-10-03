+++
title = "debug.Dump"
linkTitle = "debug.Dump"
description = "以字符串形式返回对象转储。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/debug/dump/"

[params.functions_and_methods]
signatures = ["debug.Dump VALUE"]
returnType = "string"
+++

## 这一页解决什么问题

`debug.Dump` 把一个值「转储」成字符串，通常放进 `<pre>` 里，用来回答「模板拿到的到底是什么」。它输出的形状由 `fmt` 包决定：**字符串会带引号，映射会按键排序，`nil` 显示为 `null`**——这一点比 `printf` 更适合排查类型问题。

## 什么时候用，什么时候别用

**该用**：

- 排查「字段名对不对」「类型是不是字符串」——先把 `dict` / `Params` 打出来看；
- 查看 `hugo.Data` 读入的数据结构；
- 调试 [`openapi3.Unmarshal`](/functions/openapi3/unmarshal/) 这类返回复杂结构的结果。

**别用**：

- 生产环境输出 → 只用于调试；上游明确提示输出可能随版本变化；
- 只想看某个值 → 用 `printf "%v"`，输出更短；
- 想序列化成给机器消费的 JSON → 用 [`encoding.Jsonify`](/functions/encoding/jsonify/)（`debug.Dump` 是给人看的）。

```go-html-template
<pre>{{ debug.Dump hugo.Data.books }}</pre>
```

```json
[
  {
    "author": "Victor Hugo",
    "rating": 4,
    "title": "The Hunchback of Notre Dame"
  },
  {
    "author": "Victor Hugo",
    "rating": 5,
    "title": "Les Misérables"
  }
]
```

> [!NOTE]
> 该函数的输出可能随版本变化。仅用于调试。

## 完整示例（实测）

```go-html-template
<pre>{{ debug.Dump (dict "b" 2 "a" 1) }}</pre>
<pre>{{ debug.Dump (slice 1 "two" true) }}</pre>
<pre>{{ debug.Dump "str" }}</pre>
<pre>{{ debug.Dump nil }}</pre>
{{ debug.Dump 42 }}
```

Hugo 0.167.0 实测渲染：

```text
{
  "a": 1,
  "b": 2
}
```

```text
[
  1,
  "two",
  true
]
```

```text
"str"
```

```text
null
```

```text
42
```

**你应当看到什么**：映射的键被排序（`a` 在 `b` 前）；字符串带引号（`"str"`），因此能一眼区分「值是字符串」还是「值是数字 42」。

> **在 HTML 模板里看，引号会变成实体**：`debug.Dump` 返回的是 `string`（不是可信 HTML），所以经过 `html/template` 输出时 `"` 会渲染成 `&#34;`。浏览器里读到的仍是 `"str"`，但你**去 `public/` 里搜源码**会看到 `&#34;str&#34;`。想原样看到未转义的引号，用 `{{ debug.Dump … | safeHTML }}`（仅调试时用）。

## 返回值边界（实测）

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| 映射 | JSON 风格对象，键按键排序 | 否 |
| 切片 | JSON 风格数组 | 否 |
| 字符串 | 带引号的字符串，如 `"str"` | 否 |
| `nil` | `null` | 否 |
| 数字 / 布尔 | `42` / `true` | 否 |
| 空切片 | `[]` | 否 |
| 返回类型 | `string`（实测 `%T` → `string`） | 否 |
