+++
title = "collections.In"
linkTitle = "in"
description = "报告某个值是否存在于给定的切片或字符串中。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/collections/in/"

[params.functions_and_methods]
signatures = ["collections.In SLICE|STRING VALUE"]
returnType = "bool"
aliases = ["in"]
+++

## 这一页解决什么问题

模板里要判断「这个标签在不在标签列表里」「这段文字里有没有某个词」时，Go 模板没有 `in` 运算符，有的是 `collections.In` 这个**返回布尔值**的函数：`{{ if in $tags "Hugo" }}`。

它有两种输入，语义不同：**切片**判断「值是否是其中一员」；**字符串**判断「VALUE 是否是它的子串」。两者都**区分大小写**。

## 什么时候用，什么时候别用

**该用**：

- 标签、分类、类型等成员判断，用来控制某一小块内容显不显示；
- 字符串包含判断（子串）；
- 在 `if`／`with` 里做单点判断。

**别用**：

- 要按条件筛出**一批**页面 → 用 [`collections.Where`](/functions/collections/where/)；
- 要取两个集合的交集 → 用 [`collections.Intersect`](/functions/collections/intersect/)；
- 要判断**映射的 key 是否存在** → 用 [`collections.IsSet`](/functions/collections/isset/)：实测 `in (dict "a" 1) "a"` 返回 `false`，`in` 不适用于映射键；
- 想不区分大小写 → 先用 [`strings.ToLower`](/functions/strings/tolower/) 统一两边再判断。

## 用法

```go-html-template
{{ $s := slice "a" "b" "c" }}
{{ in $s "b" }} → true
```

```go-html-template
{{ $s := "abc" }}
{{ in $s "b" }} → true
```

## 完整示例：标签判断与子串判断

```go-html-template {file="layouts/_partials/tag-check.html"}
{{ $tags := slice "Hugo" "Go" }}
{{ $text := "Hugo 是一个静态站点生成器" }}
<ul>
  <li>切片成员：{{ in $tags "Hugo" }} / {{ in $tags "hugo" }}</li>
  <li>非成员：{{ in $tags "Rust" }}</li>
  <li>字符串子串：{{ in $text "静态" }} / {{ in $text "动态" }}</li>
  <li>空切片：{{ in (slice) "a" }}</li>
  <li>数字成员：{{ in (slice 1 2) 1 }}</li>
</ul>
```

Hugo 渲染为：

```html
<ul>
  <li>切片成员：true / false</li>
  <li>非成员：false</li>
  <li>字符串子串：true / false</li>
  <li>空切片：false</li>
  <li>数字成员：true</li>
</ul>
```

**你应当看到什么**：判断**区分大小写**（`"hugo"` 不等于 `"Hugo"`）；字符串按**子串**匹配，所以 `"静态"` 这个两字词也能匹配到；空切片一律 `false`，不会报错。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 空切片 | `false` | 否 |
| 输入是 `nil` | `false` | 否 |
| 输入是映射（如 `in (dict "a" 1) "a"`） | `false`（不按 key 判断） | 否 |
| 元素类型不符（数字切片里找字符串） | `false` | 否 |
| 输入是字符串 | 按**子串**判断 | 否 |
| 大小写不同 | `false`（区分大小写） | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 明明有该标签，判断却是 `false` | 大小写不一致 | 两边都过 [`strings.ToLower`](/functions/strings/tolower/) |
| 没报错但结果不对 | 判断映射里的 key 总是 `false` | `in` 不处理映射键 | 改用 [`collections.IsSet`](/functions/collections/isset/) |
| 没报错但结果不对 | 字符串判断命中了「不该命中」的片段 | 字符串按子串匹配，不是按词 | 用 [`strings.Contains`](/functions/strings/contains/) 系列或先 `split` 成词再判断 |
| 没报错但结果不对 | 页面参数里明明是数组却判断失败 | 参数可能是单值而不是切片 | 先确认类型（`printf "%T"` 或 `debug.Dump`） |

更多排查入口见[故障排查](/troubleshooting/)。
