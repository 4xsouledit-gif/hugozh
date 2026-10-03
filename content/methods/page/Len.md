+++
title = "Len"
linkTitle = "Len"
description = "返回给定页面渲染后内容的长度（字节数）。"
date = 2026-10-02
weight = 420
source = "https://gohugo.io/methods/page/len/"

[params.functions_and_methods]
signatures = ["PAGE.Len"]
returnType = "int"
+++

## 这一页解决什么问题

`Len` 返回页面**渲染后内容的字节数**。它是快速的「这一页有多少内容」指标，常用于列表里给空页面兜底、或做粗略的分量判断（真正给读者看的字数请用 [`WordCount`](/methods/page/wordcount/)）。

## 什么时候用，什么时候别用

**该用**：

- 判断一个页面是否「有正文」（`gt .Len 0`）；
- 需要字节长度（例如截断输出、估算传输体积）。

**别用**：

- 想要**词数**或阅读时长 → 用 [`WordCount`](/methods/page/wordcount/) / [`FuzzyWordCount`](/methods/page/fuzzywordcount/) / `.ReadingTime`；
- 想要**纯文本**长度 → 用 [`Plain`](/methods/page/plain/)；
- 期望它等于正文文件的字节数 → 它统计的是**渲染后 HTML**（含标签、换行），比 Markdown 源文件大。

## 用法

```go-html-template
{{ .Len }} → 42
```

## 完整示例：区分空正文页面与有正文页面

最小站点：`content/docs/guide/alpha.md`（正文含标题、摘要与短代码）、`content/docs/guide/_index.md`（只有前置元数据的 section 页）、`content/_index.md`（首页）。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<p>{{ .Len }} 字节</p>
{{ if gt .Len 0 }}<p>本页有正文</p>{{ else }}<p>本页没有正文</p>{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，各页面的实测值：

页面|`.Len`
:--|:--
`alpha.md`（正文含中文、三个标题、一个短代码）|267
`beta.md`（一句话正文）|55
`posts/first.md`（一句英文）|93
首页（一句中文）|32
section 页 `/docs/`、`/docs/guide/`|0
术语页 `/tags/hugo/`|0

**你应当看到什么**：分支页面（section、术语页）通常为 `0`，普通页面为其渲染 HTML 的字节数；一个汉字在 UTF-8 下占 3 字节，所以中文页面的 `.Len` 会明显大于字数。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；内容与上表一致。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有正文的普通页面 | 渲染后 HTML 的字节数（如 267、55、93） | 否 |
| 只有前置元数据的 section 页 | `0` | 否 |
| 术语页 / 分类法页 | `0` | 否 |
| 首页有正文时 | 大于 `0`（实测 32） | 否 |
| 返回类型 | `int` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 数值远大于源文件 | 以为算错了 | 统计的是渲染后的 HTML（含标签与换行） | 想要字数用 `WordCount` |
| 中文页面数值偏大 | 一个汉字 3 字节 | 字节数 ≠ 字数 | 用 `WordCount`（配合 `hasCJKLanguage`） |
| 分支页面判断为「空」 | section 页 `.Len` 为 0 | 分支页面通常没有正文 | 用 `IsPage` / `IsBranch` 分流，不要只靠 `.Len` |

更多排查入口见[故障排查](/troubleshooting/)。

