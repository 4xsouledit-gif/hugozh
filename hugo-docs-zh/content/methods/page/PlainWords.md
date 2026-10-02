+++
title = "PlainWords"
linkTitle = "PlainWords"
description = "返回一个单词切片，由调用 Plain 方法并拆分其结果得到。"
date = 2026-10-02
weight = 570
source = "https://gohugo.io/methods/page/plainwords/"

[params.functions_and_methods]
signatures = ["PAGE.PlainWords"]
returnType = "[]string"
+++

## 这一页解决什么问题

`.PlainWords` 是 [`.Plain`](/methods/page/plain/) 的「切词版」：拿到纯文本后，调用 Go 的 `strings.Fields` 按**空白字符**切分，返回 `[]string`。用途是做词频、去重词表、自定义阅读时间、关键词提取这类需要「逐个词」的操作。

它有两个必须记住的特点（否则统计结果会让你意外）：

1. 切分依据**只有空白**——中文、日文等没有空格的语言，一整句会算作一个元素；
2. 标点**跟着词走**——`混合。` 是一个元素，不会把句号单独切掉。

## 什么时候用，什么时候别用

**该用**：

- 需要逐个词处理：去重、词频、按词过滤；
- 需要按「单词数」而不是按「字符数」统计（`WordCount` 方法就是基于这套规则）；
- 想要一个 `[]string` 而不是一整段文本。

**别用**：

- 只想要词数 → 直接用 [`.WordCount`](/methods/page/wordcount/)（更快、更省内存，且遵循 `hasCJKLanguage` 配置）；
- 想要纯文本 → 用 [`.Plain`](/methods/page/plain/)；
- 想按字符或按句子拆分 → `PlainWords` 做不到，需要自己处理字符串；
- 想要「不重复词」并直接得到数字 → 记得先 `uniq` 再用 `len`（见下文实测）。

## 用法

`Page` 对象上的 `PlainWords` 方法会调用 [`Plain`][] 方法，然后用 Go 的 [`strings.Fields`][] 函数把结果拆分成单词。

> [!NOTE]
> `Fields` 会按一个或多个连续空白字符（由 [`unicode.IsSpace`][] 定义）的每一处出现来拆分字符串 `s`，返回由 `s` 的子串构成的切片；如果 `s` 只含空白字符，则返回空切片。

因此，切片中的元素可能带有前置或后置标点。

```go-html-template
{{ .PlainWords }}
```

要确定一个页面上不重复单词的大致数量：

```go-html-template
{{ .PlainWords | uniq }} → 42
```

> [!NOTE]
> 上游示例里的 `→ 42` 容易让人以为 `uniq` 会返回数字。实际用 Go 模板打印 `uniq` 的结果得到的是**切片**（形如 `[词 词 词]`）。要得到数量，请写成 `{{ len (.PlainWords | uniq) }}`——实测如此。

## 完整示例：数词、数不重复词

内容文件 `content/posts/plain-short.md`：

```md {file="content/posts/plain-short.md"}
+++
title = "Plain 短例"
+++
这是**加粗**文字，链接 [文档](/docs/)，实体 &amp; 与 &copy; 混合。

{{</* note */>}}短代码里的内容{{</* /note */>}}

## 小节标题
小节正文。
```

模板：

```go-html-template {file="layouts/_default/single.html"}
<p>词数：{{ len .PlainWords }}</p>
<p>不重复词数：{{ len (.PlainWords | uniq) }}</p>
<ol>
  {{ range .PlainWords }}<li>{{ . }}</li>{{ end }}
</ol>
```

实测（Hugo 0.167.0）渲染结果：

```html
<p>词数：9</p>
<p>不重复词数：9</p>
<ol>
  <li>这是加粗文字，链接</li>
  <li>文档，实体</li>
  <li>&amp;amp;</li>
  <li>与</li>
  <li>©</li>
  <li>混合。</li>
  <li>短代码里的内容</li>
  <li>小节标题</li>
  <li>小节正文。</li>
</ol>
```

**你应当看到什么**：

- 9 个元素，而不是 9 个「词」——中文没有空格，所以「这是加粗文字，链接」被当成一个元素；
- 标点跟着词（`混合。`）；
- 短代码渲染出的文本（`短代码里的内容`）也参与切词；
- 值中的实体是 `&amp;`，经 HTML 转义后在页面源码里显示为 `&amp;amp;`（与 [`.Plain`](/methods/page/plain/) 的转义行为一致）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 常规内容 | `[]string`，按空白切分 | 否 |
| 中文/日文等无空格文本 | 整段算一个元素（实测「第二篇正文，只有一小段。」→ 1 个元素） | 否 |
| 标点 | 附着在前后的词上（实测） | 否 |
| 短代码 | 渲染后的文本参与切词（实测） | 否 |
| 正文为空（只有 front matter） | 空切片，`len` 为 0，在 `if` 中为假（实测） | 否 |
| `{{ .PlainWords }}` | 打印整个切片，形如 `[词 词]` | 否 |
| `{{ .PlainWords | uniq }}` | 返回**去重后的切片**，不是数字 | 否 |
| 词数（英文） | 与 [`.WordCount`](/methods/page/wordcount/) 的口径一致；CJK 页面受 `hasCJKLanguage` 影响 | 否 |
| 返回类型 | `[]string` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Plain`]: /methods/page/plain/
[`strings.Fields`]: https://pkg.go.dev/strings#Fields
[`unicode.IsSpace`]: https://pkg.go.dev/unicode#IsSpace
