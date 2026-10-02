+++
title = "collections.Delimit"
linkTitle = "delimit"
description = "用指定的分隔符连接给定切片或映射中的值，返回一个字符串。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/collections/delimit/"

[params.functions_and_methods]
signatures = ["collections.Delimit SLICE|MAP DELIMITER [LAST]"]
returnType = "string"
aliases = ["delimit"]
+++

## 这一页解决什么问题

要把一个列表渲染成**一行文本**时用 `delimit`：标签列表 `Hugo, Go, 模板`、文章作者、关键词、面包屑。它接收集合和一个分隔符，返回拼接好的字符串；可选的第三个参数 `LAST` 会用在**最后两项之间**，于是英文可以是 `a, b and c`、中文可以是 `Hugo、Go 与 模板`。

关键点：`DELIMITER` 和 `LAST` 都是纯文本——`delimit` **不生成 HTML**。要输出带 `<a>` 的链接列表，请用 `range` 手写。

## 什么时候用，什么时候别用

**该用**：

- 输出逗号／顿号分隔的标签、作者、分类；
- 列举的最后一项要换连接词；
- 输入是映射时，需要「按 key 排序后连接 value」（上游已说明，实测一致）。

**别用**：

- 想给每项套 HTML 标签 → 用 `range`，`delimit` 只能拼纯文本；
- 想把字符串**拆成**列表 → 方向相反，用 [`strings.Split`](/functions/strings/split/)；
- 想生成 URL 查询串 → 用 [`collections.Querify`](/functions/collections/querify/)；
- **别把字符串当集合传进来**：实测 `delimit "abc" ", "` 不报错，而是按**字节**拆开得到 `97, 98, 99`——这是本页最容易踩的坑。

## 用法

连接切片：

```go-html-template
{{ $s := slice "b" "a" "c" }}
{{ delimit $s ", " }} → b, a, c
{{ delimit $s ", " " and "}} → b, a and c
```

连接映射：

> [!NOTE]
> `delimit` 函数会先按 key 对映射排序，然后返回它的值。

```go-html-template
{{ $m := dict "b" 2 "a" 1 "c" 3 }}
{{ delimit $m ", " }} → 1, 2, 3
{{ delimit $m ", " " and "}} → 1, 2 and 3
```

## 完整示例：把标签列表拼成一行

```go-html-template {file="layouts/_partials/tags.html"}
{{ $tags := slice "Hugo" "Go" "模板" }}
<p>{{ delimit $tags ", " }}</p>
<p>{{ delimit $tags "、" " 与 " }}</p>
<p>只有一个元素时：{{ delimit (slice "Hugo") "、" " 与 " }}</p>
<p>空列表：[{{ delimit (slice) ", " }}]</p>
```

Hugo 渲染为：

```html
<p>Hugo, Go, 模板</p>
<p>Hugo、Go 与 模板</p>
<p>只有一个元素时：Hugo</p>
<p>空列表：[]</p>
```

**你应当看到什么**：分隔符可以任意指定；`LAST` 只在元素多于一个时出现在最后两项之间；空切片返回空字符串而**不报错**，所以「有没有标签」要靠 `len` 判断，不能靠输出是否为空。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 空切片 | 空字符串（`len` 为 0） | 否 |
| 只有一个元素（带 `LAST`） | 只输出该元素，`LAST` 不出现 | 否 |
| 输入是映射 | 按 key 排序后连接其值（实测 `1, 2, 3`） | 否 |
| 元素是数字 | 转成字符串连接（实测 `1-2`） | 否 |
| 输入是字符串 | 按**字节**拆开连接，实测 `delimit "abc" ", "` 得 `97, 98, 99` | 否 |
| 元素是映射 | 实测输出为空字符串 | 否 |
| 输入是 `nil` | —— | 是：`error calling delimit: can't iterate over <nil>` |
| 返回类型 | `string`，不会返回 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 输出了一串数字（`97, 98, 99`） | 把字符串当集合传了，`delimit` 按字节拆开 | 先用 [`strings.Split`](/functions/strings/split/) 转成切片，或确认变量本来就是切片 |
| 没报错但结果不对 | 页面上直接显示了 HTML 标签 | `delimit` 的结果是文本，被模板自动转义 | 确实需要 HTML 就用 `range` 手写，或对结果用 `safeHTML`（注意 XSS 风险） |
| 没报错但结果不对 | 判断「有没有标签」失败 | 空切片返回的是空字符串，没有可判定的 `nil` | 用 `{{ with $tags }}` 或 `len $tags` 判断 |
| 报错看不懂 | `can't iterate over <nil>` | 变量在某些页面上是 `nil` | 先用 `with` 包一层再 `delimit` |

更多排查入口见[故障排查](/troubleshooting/)。
