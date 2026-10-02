+++
title = "fmt.Println"
linkTitle = "fmt.Println"
description = "返回给定参数默认的字符串表示，并在末尾附加一个换行。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/fmt/println/"

[params.functions_and_methods]
signatures = ["fmt.Println INPUT"]
returnType = "string"
aliases = ["println"]
+++

## 这一页解决什么问题

需要把几个值拼成**一行**，并在末尾带换行时用 `println`。它和 [`fmt.Print`](/functions/fmt/print/) 有两点不同：参数之间**插入空格**，末尾**追加 `\n`**。生成纯文本文件、拼出带换行的占位内容时用它。

## 什么时候用，什么时候别用

**该用**：

- 输出需要以换行结尾（生成文本、逐行拼装）；
- 想要参数之间自动有空格。

**别用**：

- 不需要换行、也不想要空格 → 用 [`fmt.Print`](/functions/fmt/print/)；
- 需要格式控制 → 用 [`fmt.Printf`](/functions/fmt/printf/)；
- 在 HTML 里只想换行显示 → 用 HTML 标签（`<br>`、块级元素）更直接：源码里的换行会被浏览器折叠。

## 用法

```go-html-template
{{ println "foo" }} → foo\n
{{ println "foo" "bar" }} → foo bar\n
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/lines.html"}
[{{ println "foo" }}]|[{{ println "foo" "bar" }}]
```

Hugo 0.167.0 实测输出（方括号是测试时加的，用来让换行**看得见**）：

```text
[foo
]|[foo bar
]
```

**你应当看到什么**：两个 `]` 都另起了一行——`println` 在末尾加了换行。第二项里 `foo` 与 `bar` 之间多出一个空格，这是它与 [`fmt.Print`](/functions/fmt/print/) 的差别。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"foo"` | `foo\n`（末尾一个换行） | 否 |
| `"foo" "bar"` | `foo bar\n`（参数之间一个空格） | 否 |
| 与 [`fmt.Print`](/functions/fmt/print/) 对比：`"foo" "bar"` | `print` 得 `foobar`，`println` 得 `foo bar\n` | 否 |
| 返回类型 | `string`（含换行字符），永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 产物里凭空多出空行或空白 | 末尾的 `\n` 与模板里原有的换行叠加 | 不需要换行就改用 [`fmt.Print`](/functions/fmt/print/) |
| 没报错但结果不对 | 页面上的换行没生效 | HTML 会把源码里的换行折叠成空格 | 用 HTML 标签换行，或把文本放进 `<pre>` |
| 没报错但结果不对 | 参数粘在一起少了空格 | 用的是 [`fmt.Print`](/functions/fmt/print/) | 需要空格就用 `println`，或自己补 `" "` |

更多排查入口见[故障排查](/troubleshooting/)。
