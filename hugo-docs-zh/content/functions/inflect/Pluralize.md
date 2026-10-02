+++
title = "inflect.Pluralize"
linkTitle = "inflect.Pluralize"
description = "按一组常见的英语复数化规则返回给定单词的复数形式。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/inflect/pluralize/"

[params.functions_and_methods]
signatures = ["inflect.Pluralize INPUT"]
returnType = "string"
aliases = ["pluralize"]
+++

## 这一页解决什么问题

需要用英文词的单复数时（例如「3 cats」还是「3 cat」），`pluralize` 按一组常见英语规则返回复数形式。它接受字符串、返回字符串。

要注意它是**规则化的英语词形处理**：覆盖常见情况，不保证覆盖所有不规则名词，也不处理中文。

## 什么时候用，什么时候别用

**该用**：

- 英文界面的数量文案；
- 需要按词形生成 URL / 标签；
- 与 [`inflect.Singularize`](/functions/inflect/singularize/) 配对做双向转换。

**别用**：

- 中文或其它语言 → 直接写文案，不要过 `pluralize`；
- 需要页面的正式标题 → 用 [`.Title`](/methods/page/title/)；
- 需要首字母大写 / 连字符转空格 → 用 [`inflect.Humanize`](/functions/inflect/humanize/)。

```go-html-template
{{ "cat" | pluralize }} → cats
```

## 完整示例（实测）

```go-html-template
{{ "cat" | pluralize }}   → cats
{{ "box" | pluralize }}   → boxes
{{ "city" | pluralize }}  → cities
{{ pluralize "" }}        → （空）
{{ pluralize 42 }}        → 42s
{{ pluralize nil }}       → （空）
```

Hugo 0.167.0 实测：以上逐条与 `→` 后一致。数字会先转成字符串再加 `s`。

## 返回值边界（实测）

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"cat"` / `"box"` / `"city"` | `cats` / `boxes` / `cities` | 否 |
| 空字符串 / `nil` | 空字符串 | 否 |
| 非字符串（`42`） | `42s` | 否 |
| 返回类型 | `string`（实测 `%T` → `string`） | 否 |
