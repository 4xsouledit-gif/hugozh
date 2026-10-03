+++
title = "debug.VisualizeSpaces"
linkTitle = "debug.VisualizeSpaces"
description = "返回给定字符串，其中的空格被替换为可见的字符串。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/debug/visualizespaces/"

[params.functions_and_methods]
signatures = ["debug.VisualizeSpaces STRING"]
returnType = "string"
+++

## 这一页解决什么问题

模板里最难看出来的 bug 之一是**空格**：多个空格、前导空格、制表符。`debug.VisualizeSpaces` 把字符串中的空格替换成可见的 `[SPACE]`，于是你一眼就能看出到底有几个空格、在哪里。

## 什么时候用，什么时候别用

**该用**：

- 调试 `printf` / `replace` 之后的空白问题；
- 确认某段文本是「两个空格」还是一个；
- 排查 Markdown 里被吞掉的空格。

**别用**：

- 想看换行、制表符 → 本函数只处理普通空格（U+0020），其它空白它不标记；
- 只想看字符串长度 → 用 [`len`](/functions/go-template/len/)；
- 想看整个值的类型与结构 → 用 [`debug.Dump`](/functions/debug/dump/)。

```go-html-template
{{ debug.VisualizeSpaces "foo  bar" }} → foo[SPACE][SPACE]bar
```

## 完整示例（实测）

```go-html-template
{{ debug.VisualizeSpaces "foo  bar" }} → foo[SPACE][SPACE]bar
{{ debug.VisualizeSpaces "a b" }}      → a[SPACE]b
{{ debug.VisualizeSpaces "" }}         → （空）
{{ debug.VisualizeSpaces 42 }}         → 42
```

Hugo 0.167.0 实测：以上逐条与 `→` 后一致；数字会先转成字符串。

## 返回值边界（实测）

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"foo  bar"`（两个空格） | `foo[SPACE][SPACE]bar` | 否 |
| `"a b"` | `a[SPACE]b` | 否 |
| 空字符串 | 空字符串 | 否 |
| 非字符串（`42`） | `42` | 否 |
| 返回类型 | `string`（实测 `%T` → `string`） | 否 |
