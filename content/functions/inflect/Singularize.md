+++
title = "inflect.Singularize"
linkTitle = "inflect.Singularize"
description = "按一组常见的英语单数化规则返回给定单词的单数形式。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/inflect/singularize/"

[params.functions_and_methods]
signatures = ["inflect.Singularize INPUT"]
returnType = "string"
aliases = ["singularize"]
+++

## 这一页解决什么问题

`singularize` 是 [`inflect.Pluralize`](/functions/inflect/pluralize/) 的逆操作：按一组常见英语规则把复数词还原成单数。常用于把「标签 / 分类」的复数名映射回单数形式，或统一术语。

## 什么时候用，什么时候别用

**该用**：

- 把复数标签还原成单数（`"cats"` → `"cat"`）；
- 与 `inflect.Pluralize` 配对；
- 需要按词形生成稳定的键名。

**别用**：

- 中文或其它语言 → 不要依赖英语规则；
- 需要页面的正式标题 → 用 [`.Title`](/methods/page/title/)；
- 需要大小写 / 连字符处理 → 用 [`inflect.Humanize`](/functions/inflect/humanize/)。

```go-html-template
{{ "cats" | singularize }} → cat
```

## 完整示例（实测）

```go-html-template
{{ "cats" | singularize }}   → cat
{{ "boxes" | singularize }}  → box
{{ "cities" | singularize }} → city
{{ "cat" | singularize }}    → cat
{{ singularize "" }}         → （空）
```

Hugo 0.167.0 实测：以上逐条与 `→` 后一致。已经是单数的词原样返回。

## 返回值边界（实测）

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| 规则复数（`cats` / `boxes` / `cities`） | `cat` / `box` / `city` | 否 |
| 已经是单数（`cat`） | `cat` | 否 |
| 空字符串 | 空字符串 | 否 |
| 返回类型 | `string` | 否 |
