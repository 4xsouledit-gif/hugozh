+++
title = "ReadingTime"
linkTitle = "ReadingTime"
description = "返回给定页面的预估阅读时间（以分钟计）。"
date = 2026-10-02
weight = 620
source = "https://gohugo.io/methods/page/readingtime/"

[params.functions_and_methods]
signatures = ["PAGE.ReadingTime"]
returnType = "int"
+++

## 这一页解决什么问题

文章列表或文章头部常见的「约 5 分钟读完」，用 `.ReadingTime` 一行就能得到：它是一个 `int`，单位是分钟，由内容词数换算而来（默认每分钟 212 词）。

它和 [`.WordCount`](/methods/page/wordcount/) 成正比但**不是**简单除法结果：Hugo 会向上取整，所以 1 个词的页面也会得到 `1`；词数为 0 时得到 `0`（实测）。

## 什么时候用，什么时候别用

**该用**：

- 文章头部/列表项显示「预计阅读 X 分钟」；
- 想按语言分别设定阅读速度（用站点参数 + `.WordCount` 自己算，见上游示例）。

**别用**：

- 只想要字数 → 用 [`.WordCount`](/methods/page/wordcount/)（还要更模糊的「百字取整」用 [`FuzzyWordCount`](/methods/page/fuzzywordcount/)）；
- 想要按自己语言习惯的阅读速度 → `.ReadingTime` 用的是固定速度（212 或 CJK 的 500），要自定义就用上游给出的 `div` + `math.Ceil` 写法；
- 中文站点没开 `hasCJKLanguage` → 词数口径会与预期差很多（见下）。

## 用法

Hugo 用内容中的单词数除以每分钟 212 词的阅读速度，据此估算阅读时间。

> [!NOTE]
> 对于 [CJK](g) 语言的内容，请在项目配置中把 [`hasCJKLanguage`][] 设为 `true`。启用后，Hugo 会对含 CJK 字符的页面应用 CJK 计数规则，并采用每分钟 500 词的阅读速度。要针对某个页面覆盖该行为，请在其前置元数据中设置 [`isCJKLanguage`][] 字段。

```go-html-template
{{ printf "Estimated reading time: %d minutes" .ReadingTime }}
```

阅读速度因语言而异。在多语言项目中，可以用站点参数为每种语言分别设置估算阅读时间。

```toml
[languages]
  [languages.de]
    contentDir = 'content/de'
    label = 'Deutsch'
    locale = 'de-DE'
    weight = 2
    [languages.de.params]
    reading_speed = 179
  [languages.en]
    contentDir = 'content/en'
    label = 'English'
    locale = 'en-US'
    weight = 1
    [languages.en.params]
      reading_speed = 228
```

然后在模板中：

```go-html-template
{{ $readingTime := div (float .WordCount) .Site.Params.reading_speed }}
{{ $readingTime = math.Ceil $readingTime }}
```

我们把 `.WordCount` 转换成浮点数，这样除以阅读速度时就能得到浮点结果。然后再向上取整到最接近的整数。

## 完整示例：显示阅读时间

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
<p>{{ .ReadingTime }} 分钟 · {{ .WordCount }} 词</p>
```

实测（Hugo 0.167.0，测试站未开启 `hasCJKLanguage`）：

| 页面 | `.WordCount` | `.ReadingTime` |
| --- | --- | --- |
| `/posts/empty-body/`（正文为空） | 0 | 0 |
| `/posts/post-2/`（一句话） | 1 | 1 |
| `/posts/post-1/`（两个小节） | 5 | 1 |
| `/posts/plain-short/`（含短代码） | 9 | 1 |
| `/posts/bundle-1/`（含 `<!--more-->`） | 3 | 1 |

**你应当看到什么**：正文为空时是 `0` 而不是 `1`；只要有任何内容，短页面都会被取整为 `1`。想要「预计 1 分钟」这样的展示，直接用 `{{ .ReadingTime }} 分钟` 即可；列表页里若不想显示 `0`，用 `{{ with .ReadingTime }}` 或 `{{ cond (eq .ReadingTime 0) "—" (printf "%d 分钟" .ReadingTime) }}`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 正文为空 | `0`（实测 `/posts/empty-body/`） | 否 |
| 短内容 | 向上取整为 `1`（实测） | 否 |
| 内容很长 | 约 `ceil(词数 / 212)`；CJK 页面按 `hasCJKLanguage` 与 500 词/分钟 | 否 |
| `hasCJKLanguage = true` | 中文按 CJK 计数规则，词数与阅读时间都会变化（上游说明；本站未启用该配置，故不列实测） | 否 |
| front matter `isCJKLanguage` | 覆盖单页的 CJK 判定（上游说明） | 否 |
| 返回类型 | `int`（可直接参与算术） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`hasCJKLanguage`]: /configuration/all/#hascjklanguage
[`isCJKLanguage`]: /content-management/front-matter/#iscjklanguage
