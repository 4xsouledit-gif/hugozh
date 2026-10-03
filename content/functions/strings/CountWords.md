+++
title = "strings.CountWords"
linkTitle = "CountWords"
description = "返回给定字符串中的单词数量。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/strings/countwords/"

[params.functions_and_methods]
signatures = ["strings.CountWords STRING"]
returnType = "int"
aliases = ["countwords"]
+++

## 这一页解决什么问题

想给文章标上「约 N 词」、或按词数决定摘要长度时，需要把一段文本切成词再数个数。`strings.CountWords` 就做这一件事；它也是 Hugo 计算 `.WordCount`、`.Summary` 长度时用的同一套逻辑。

## 什么时候用，什么时候别用

**该用**：

- 页面语言以空格分词（英语、法语、西班牙语等），想显示词数；
- 想复现 Hugo 对 `.WordCount` 的统计口径。

**别用**：

- 中文、日文内容想显示「多少字」→ 用 [`strings.RuneCount`](/functions/strings/runecount/) 或 [`strings.CountRunes`](/functions/strings/countrunes/)：**实测中文按字计词**（`"中文 分词 测试"` 得 `6`，每个汉字一个词），显示出来会偏大；
- 想数字符总数 → 用 [`strings.RuneCount`](/functions/strings/runecount/)；
- 想按词数截断字符串 → 本函数只返回数字，截断请用 [`strings.Truncate`](/functions/strings/truncate/)。

## 用法

```go-html-template
{{ "Hugo is a static site generator." | countwords }} → 6
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/wordcount.html"}
{{ $s := "Hugo is a static site generator." }}
{{ countwords $s }}|{{ countwords "中文 分词 测试" }}
```

Hugo 0.167.0 实测输出：

```text
6|6
```

**你应当看到什么**：两颗结果都是 `6`。英文那串确实是 6 个单词；中文那串只有 3 个「词」，但每个汉字被单独算作一个词，所以也是 6。**给中文页面显示字数时不要用本函数。**

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；中文一行的结果在 `locale = 'zh-CN'` 与不设置 `locale` 的站点上各测一次，都是 `6`。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"Hugo is a static site generator."` | `6` | 否 |
| `"one"` | `1` | 否 |
| `""` | `0` | 否 |
| `"中文 分词 测试"` | `6`（每个汉字算一个词，与是否设置 `locale` 无关） | 否 |
| 返回类型 | `int`，空串返回 `0` 而不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 中文文章显示「约 800 词」，明显偏大 | 中文没有空格分词，Hugo 把每个汉字算作一个词（实测 3 个词得 `6`） | 中文内容改用 [`strings.RuneCount`](/functions/strings/runecount/) 或 [`strings.CountRunes`](/functions/strings/countrunes/) |
| 没报错但结果不对 | 词数与编辑器统计不一致 | 连字符、标点、数字的切分口径不同 | 以本函数结果为准（它就是 `.WordCount` 的口径），或改用 [`strings.Split`](/functions/strings/split/) 自己切 |

更多排查入口见[故障排查](/troubleshooting/)。
