+++
title = "strings.Chomp"
linkTitle = "Chomp"
description = "返回给定字符串，并删除末尾的所有换行符与回车符。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/strings/chomp/"

[params.functions_and_methods]
signatures = ["strings.Chomp STRING"]
returnType = "any"
aliases = ["chomp"]
+++

## 这一页解决什么问题

用 [`os.ReadFile`](/functions/os/readfile/) 读进来的文本、短代码里手写的多行参数、或从数据文件里取出的字符串，末尾常常带着一个或几个换行符。直接拼进模板，产物里就会多出空行甚至多出一段空白——`chomp` 专门删掉**末尾**的换行符（`\n`）与回车符（`\r`）。

## 什么时候用，什么时候别用

**该用**：

- 把文件内容、多行参数拼到一行输出里之前，先去掉行尾；
- 想保留字符串**中间**的换行，只清理结尾。

**别用**：

- 想删掉首尾的空白（空格、制表符、换行一起） → 用 [`strings.TrimSpace`](/functions/strings/trimspace/)；
- 只想删开头的空白 → 用 [`strings.TrimLeft`](/functions/strings/trimleft/)；
- 想删掉**所有**换行（包括中间的，例如把多行压成一行）→ 用 [`strings.ReplaceRE`](/functions/strings/replacere/) 配 `\s+`，或先用 [`strings.Split`](/functions/strings/split/) 再 [`collections.Delimit`](/functions/collections/delimit/)；
- 想按长度截断 → 用 [`strings.Truncate`](/functions/strings/truncate/)。

## 用法

如果参数的类型是 `template.HTML`，则返回 `template.HTML`；否则返回 `string`。

```go-html-template
{{ chomp "foo\n" }} → foo
{{ chomp "foo\n\n" }} → foo

{{ chomp "foo\r\n" }} → foo
{{ chomp "foo\r\n\r\n" }} → foo
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/line.html"}
{{ $s := "第一行\n第二行\n" }}
长度 {{ len $s }} → chomp 后 {{ len (chomp $s) }}
```

Hugo 0.167.0 实测输出：

```text
长度 20 → chomp 后 19
```

**你应当看到什么**：长度从 `20` 变成 `19`——只少了末尾那一个换行。`len` 数的是**字节数**，所以中文一个字占 3 字节（实测这一串为 20 字节）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"foo\n"`、`"foo\n\n"`、`"foo\r\n"`、`"foo\r\n\r\n"` | 都是 `foo`（末尾换行**全部**删除） | 否 |
| `"foo"`（末尾无换行） | `foo`（原样返回） | 否 |
| `""`（空字符串） | `""` | 否 |
| `42`（数字） | `"42"`，自动转成字符串 | 否 |
| `nil` | `""` | 否 |
| 参数是 `template.HTML`（如 `"<b>x</b>" | safeHTML`） | 返回类型变成 `template.HTML`，不会被转义 | 否 |
| 返回类型 | 普通字符串是 `string`，安全 HTML 是 `template.HTML`（签名统一写作 `any`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 产物里还是有空行 | 空行来自字符串**中间**的换行，`chomp` 只管末尾 | 用 [`strings.ReplaceRE`](/functions/strings/replacere/) 处理中间的换行 |
| 没报错但结果不对 | 行尾空格还在 | `chomp` 只删换行符与回车符，不删空格 | 改用 [`strings.TrimSpace`](/functions/strings/trimspace/) |
| 报错看不懂 | 页面里出现 `&lt;b&gt;` | 原文是含 HTML 标签的普通字符串，被自动转义了 | 先 `safeHTML` 再 `chomp`（返回类型会变成 `template.HTML`） |

更多排查入口见[故障排查](/troubleshooting/)。
