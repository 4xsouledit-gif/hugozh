+++
title = "inflect.Humanize"
linkTitle = "inflect.Humanize"
description = "返回输入的人性化形式，并大写首字母。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/inflect/humanize/"

[params.functions_and_methods]
signatures = ["inflect.Humanize INPUT"]
returnType = "string"
aliases = ["humanize"]
+++

## 这一页解决什么问题

`humanize` 把「机器味的标识符」变成「人看的标题」：连字符转空格、驼峰拆词、首字母大写。它常用于把 slug、文件名、section 名直接当标题显示。

另外它还有个不太起眼的用途：输入是整数（或整数的字符串）时，返回**带序数词尾**的英文数字，例如 `52nd`、`103rd`。

## 什么时候用，什么时候别用

**该用**：

- 用 slug / 文件名当标题展示：`humanize "my-first-post"` → `My first post`；
- 生成序数词（`1st`、`2nd`、`112th`）；
- 面包屑、标签的显示名。

**别用**：

- 需要页面的正式标题 → 用 [`.Title`](/methods/page/title/) / [`.LinkTitle`](/methods/page/linktitle/)；
- 需要复数 / 单数转换 → 用 [`inflect.Pluralize`](/functions/inflect/pluralize/) / [`inflect.Singularize`](/functions/inflect/singularize/)；
- 中文等非英文输入 → `humanize` 只处理英语规则，中文基本原样返回。

```go-html-template
{{ humanize "my-first-post" }} → My first post
{{ humanize "myCamelPost" }} → My camel post
```

如果输入是整数或整数的字符串表示，humanize 会返回附加了正确序数词尾的数字。

```go-html-template
{{ humanize "52" }} → 52nd
{{ humanize 103 }} → 103rd
```

## 完整示例（实测）

```go-html-template
{{ humanize "my-first-post" }} → My first post
{{ humanize "myCamelPost" }}   → My camel post
{{ humanize "52" }}            → 52nd
{{ humanize 103 }}             → 103rd
{{ humanize "1" }}|{{ humanize "2" }}|{{ humanize "3" }}|{{ humanize "4" }}|{{ humanize "11" }}|{{ humanize "21" }}|{{ humanize "112" }}
```

Hugo 0.167.0 实测输出：

```text
My first post
My camel post
52nd
103rd
1st|2nd|3rd|4th|11th|21st|112th
```

**你应当看到什么**：`11` 得到 `11th`（不是 `11st`），`112` 得到 `112th`——序数后缀按英语规则处理。

## 返回值边界（实测）

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"my-first-post"` | `My first post` | 否 |
| `"myCamelPost"` | `My camel post` | 否 |
| 整数字符串 / 整数 | 序数形式（`52` → `52nd`，`103` → `103rd`） | 否 |
| 空字符串 | 空字符串 | 否 |
| `nil` | 空字符串 | 否 |
| 返回类型 | `string`（实测 `%T` → `string`） | 否 |
