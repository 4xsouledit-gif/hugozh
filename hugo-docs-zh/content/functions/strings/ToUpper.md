+++
title = "strings.ToUpper"
linkTitle = "ToUpper"
description = "返回给定字符串，并把所有字符转为大写。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/functions/strings/toupper/"

[params.functions_and_methods]
signatures = ["strings.ToUpper STRING"]
returnType = "string"
aliases = ["upper"]
+++

## 这一页解决什么问题

把一段文本统一成大写外观：状态徽标上的 `NEW`、缩写标签、首字下沉之外的强调效果。`strings.ToUpper` 把**所有**字符转成大写。

## 什么时候用，什么时候别用

**该用**：

- 需要全大写展示的短标识（状态、标签、缩写）；
- 比较之前做归一化（与 [`strings.ToLower`](/functions/strings/tolower/) 二选一即可，两者要统一）。

**别用**：

- 想改成标题式大小写 → 用 [`strings.Title`](/functions/strings/title/)；
- 只把首字符转大写 → 用 [`strings.FirstUpper`](/functions/strings/firstupper/)；
- 想生成 URL slug → 用 [`urls.URLize`](/functions/urls/urlize/)（通常还会先小写）。

## 用法

```go-html-template
{{ upper "BatMan" }} → BATMAN
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/badge.html"}
{{ upper "BatMan" }}
```

Hugo 0.167.0 实测输出：

```text
BATMAN
```

**你应当看到什么**：整串统一为大写。中文不受影响（与 [`strings.ToLower`](/functions/strings/tolower/) 一样，非拉丁字符原样保留）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"BatMan"` | `BATMAN` | 否 |
| `""`（空字符串） | `""` | 否 |
| `nil` | `""`（实测不报错） | 否 |
| 已经是大写的字符串 | 原样返回 | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 中文/日文标题没有任何变化 | 这些文字没有大小写概念 | 无需处理；需要强调请改用 CSS `text-transform` |
| 没报错但结果不对 | 只想要首字母大写 | 本函数会把整串都变大写 | 改用 [`strings.FirstUpper`](/functions/strings/firstupper/) |
| 没报错但结果不对 | 大写后的文本被屏幕阅读器逐字母朗读 | 全大写会影响可访问性 | 视觉上的大写优先交给 CSS，模板里保留原大小写 |

更多排查入口见[故障排查](/troubleshooting/)。
