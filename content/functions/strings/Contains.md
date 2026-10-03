+++
title = "strings.Contains"
linkTitle = "Contains"
description = "报告给定字符串是否包含指定子串。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/strings/contains/"

[params.functions_and_methods]
signatures = ["strings.Contains STRING SUBSTRING"]
returnType = "bool"
+++

## 这一页解决什么问题

模板里经常要先判断「这段文本里有没有某个词」，再决定渲染什么：标题里有没有品牌名、路径里有没有某个目录、摘要里有没有某个关键词。`strings.Contains` 就是 Go 标准库同名函数的直通版本，返回 `true` 或 `false`。

## 什么时候用，什么时候别用

**该用**：

- 只想知道子串是否出现，不需要位置、次数或捕获内容；
- 结果直接交给 `if` / `with` 分支，或存进变量供后面复用。

**别用**：

- 只关心开头或结尾 → 用 [`strings.HasPrefix`](/functions/strings/hasprefix/) 或 [`strings.HasSuffix`](/functions/strings/hassuffix/)：语义更贴近，读代码的人一眼就懂；
- 要按正则匹配 → 用 [`strings.FindRE`](/functions/strings/findre/)；
- 想知道出现了几次 → 用 [`strings.Count`](/functions/strings/count/)；
- 要判断字符串是不是「全空白」→ 用 [`strings.ContainsNonSpace`](/functions/strings/containsnonspace/)；
- 想忽略大小写 → 先把两边都过一遍 [`strings.ToLower`](/functions/strings/tolower/) 再比较。

注意：它**区分大小写**，`"Hugo"` 里有 `go` 但没有 `Go`——这是最常踩的一脚（见下文实测）。

## 用法

```go-html-template
{{ strings.Contains "Hugo" "go" }} → true
```

该检查区分大小写：

```go-html-template
{{ strings.Contains "Hugo" "Go" }} → false
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/check.html"}
{{ $title := "Hugo 中文文档" }}
{{ strings.Contains $title "Hugo" }}|{{ strings.Contains $title "hugo" }}
```

Hugo 0.167.0 实测输出：

```text
true|false
```

**你应当看到什么**：第一项 `true`，第二项 `false`。两次查询只差了大小写，结果就反了——`strings.Contains` 不做大小写折叠。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| 子串存在 / 不存在 | `true` / `false` | 否 |
| `{{ strings.Contains "Hugo" "" }}` | `true`（任何字符串都包含空串） | 否 |
| `{{ strings.Contains "" "" }}` | `true` | 否 |
| `{{ strings.Contains "汉字测试" "字" }}` | `true`（多字节字符按子串判断） | 否 |
| `{{ strings.Contains 42 "x" }}` | `false`（非字符串参数不报错） | 否 |
| 返回类型 | `bool`，永远不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 明明有这个词却返回 `false` | 大小写不同（实测 `"Hugo"` 含 `go` 不含 `Go`） | 先 `lower` 两边，或把字面量的大小写对齐 |
| 没报错但结果不对 | 任何字符串都返回 `true` | 子串变量是空字符串 | 用 `with` 先确认变量非空，再调用本函数 |

更多排查入口见[故障排查](/troubleshooting/)。
