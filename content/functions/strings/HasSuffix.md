+++
title = "strings.HasSuffix"
linkTitle = "HasSuffix"
description = "报告给定字符串是否以指定后缀结尾。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/strings/hassuffix/"

[params.functions_and_methods]
signatures = ["strings.HasSuffix STRING SUFFIX"]
returnType = "bool"
aliases = ["hasSuffix"]
+++

## 这一页解决什么问题

按「结尾」做判断：这个文件是不是 `.webp` 图片、这个 URL 是不是以斜杠结尾、这个资源名是不是 `.min.js`。`strings.HasSuffix` 返回 `true` / `false`，是模板里做格式分流最常用的判断之一。

## 什么时候用，什么时候别用

**该用**：

- 按扩展名、按结尾标记分流（图片格式、压缩文件、目录式 URL）；
- 判断字符串是否以某个固定标记结尾。

**别用**：

- 判断「里面有没有」→ 用 [`strings.Contains`](/functions/strings/contains/)；
- 判断开头 → 用 [`strings.HasPrefix`](/functions/strings/hasprefix/)；
- 目的是**删掉**结尾的后缀 → 用 [`strings.TrimSuffix`](/functions/strings/trimsuffix/)；
- 后缀是模式（例如「以若干数字结尾」）→ 用 [`strings.FindRE`](/functions/strings/findre/)。

## 用法

```go-html-template
{{ hasSuffix "Hugo" "go" }} → true
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/image.html"}
{{ $f := "cover.webp" }}
{{ hasSuffix $f ".webp" }}|{{ hasSuffix $f ".jpg" }}
```

Hugo 0.167.0 实测输出：

```text
true|false
```

**你应当看到什么**：`cover.webp` 以 `.webp` 结尾，所以第一项 `true`；`false` 那一项说明判断是精确匹配结尾，不会因为文件名里含 `jpg`（本例其实也不含）而误判。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ hasSuffix "Hugo" "go" }}` | `true` | 否 |
| `{{ hasSuffix "Hugo" "Go" }}` | `false`（区分大小写） | 否 |
| `{{ hasSuffix "" "" }}` | `true`（空后缀匹配任何字符串） | 否 |
| 后缀比字符串长 | `false`，不会报错 | 否 |
| 返回类型 | `bool`，永远不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `cover.jpg.webp` 之类判断与预期不符 | 只比较**结尾**；中间出现过的内容不影响结果 | 需要看中间内容改用 [`strings.Contains`](/functions/strings/contains/) |
| 没报错但结果不对 | 扩展名大小写不一致导致漏判（`COVER.JPG`） | 检查区分大小写 | 先用 [`strings.ToLower`](/functions/strings/tolower/) 归一化再判断 |
| 没报错但结果不对 | 想让后缀「消失」却只得到 `true` | 本函数只回答是否，不修改字符串 | 要拿到去掉后缀的结果用 [`strings.TrimSuffix`](/functions/strings/trimsuffix/) |

更多排查入口见[故障排查](/troubleshooting/)。
