+++
title = "strings.Count"
linkTitle = "Count"
description = "返回给定子串在给定字符串中不重叠出现的次数。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/strings/count/"

[params.functions_and_methods]
signatures = ["strings.Count SUBSTR STRING"]
returnType = "int"
+++

## 这一页解决什么问题

想数一数某个词、某个标签、某个标记在文本里出现了几次——例如「这篇文章里出现几次 `Hugo`」「这段摘要里有几个逗号」。`strings.Count` 返回**不重叠**的出现次数：统计过的部分不会被重复计数（见下文实测）。

它最容易踩的一点是**参数顺序与直觉相反**：先写要找的 `SUBSTR`，再写被查找的 `STRING`。所以日常写法几乎都用管道把字符串送到最后：

```go-html-template
{{ "aaabaab" | strings.Count "a" }}
```

## 什么时候用，什么时候别用

**该用**：

- 只需要一个次数，用来判断「够不够多」或直接显示；
- 要找的内容是固定子串，不是模式。

**别用**：

- 想知道匹配出现在哪里、或要取捕获组 → 用 [`strings.FindRE`](/functions/strings/findre/) 或 [`strings.FindRESubmatch`](/functions/strings/findresubmatch/)；
- 想数**字符**数量 → 用 [`strings.RuneCount`](/functions/strings/runecount/) 或 [`strings.CountRunes`](/functions/strings/countrunes/)；
- 想数**单词**数量 → 用 [`strings.CountWords`](/functions/strings/countwords/)；
- 想判断「有没有」而不关心次数 → 用 [`strings.Contains`](/functions/strings/contains/)。

## 用法

如果 `SUBSTR` 是空字符串，该函数返回 `STRING` 中 Unicode 码点（code point）的数量加 1。

```go-html-template
{{ "aaabaab" | strings.Count "a" }} → 5
{{ "aaabaab" | strings.Count "aa" }} → 2
{{ "aaabaab" | strings.Count "aaa" }} → 1
{{ "aaabaab" | strings.Count "" }} → 8
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/count-tag.html"}
{{ $s := "hugo, gohugo, hugo" }}
出现 {{ strings.Count "hugo" $s }} 次
```

Hugo 0.167.0 实测输出：

```text
出现 3 次
```

**你应当看到什么**：`gohugo` 里的那一段 `hugo` 同样被算进去，所以是 3 次而不是 2 次——`Count` 找的是**任意位置**的子串。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ "abc" | strings.Count "z" }}`（不存在） | `0` | 否 |
| `{{ "aaabaab" | strings.Count "aa" }}`（重叠场景） | `2`（`aaa` 只算一次不重叠的 `aa`） | 否 |
| `{{ "aaabaab" | strings.Count "" }}` | `8`（码点数 7 加 1） | 否 |
| `{{ "汉字汉字" | strings.Count "" }}` | `5`（码点数 4 加 1，每个汉字算一个码点） | 否 |
| `{{ strings.Count nil "a" }}` | `2`（`nil` 当作空串，即「1 加 1」） | 否 |
| 返回类型 | `int`，不存在时返回 `0` 而不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 次数总比自己数出来的少 | 重叠部分不重复计数（实测 `"aaabaab"` 数 `"aa"` 得 2） | 需要重叠计数就改用 [`strings.FindRE`](/functions/strings/findre/) 配前瞻写法，或按实际需求调整子串 |
| 没报错但结果不对 | 结果恒为 `1` 或恒为长度加一 | `SUBSTR` 传成了空字符串 | 检查变量是否为空，用 `with` 先确认 |
| 没报错但结果不对 | 数字对不上 | 参数顺序写反了：本函数是 `SUBSTR` 在前、`STRING` 在后 | 用管道写法 `{{ $s | strings.Count "x" }}` 避免记错顺序 |

更多排查入口见[故障排查](/troubleshooting/)。
