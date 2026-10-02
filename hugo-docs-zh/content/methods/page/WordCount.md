+++
title = "WordCount"
linkTitle = "WordCount"
description = "返回给定页面内容中的单词数。"
date = 2026-10-02
weight = 890
source = "https://gohugo.io/methods/page/wordcount/"

[params.functions_and_methods]
signatures = ["PAGE.WordCount"]
returnType = "int"
+++

## 这一页解决什么问题

`.WordCount` 返回页面内容的**词数**（`int`）。做「共 1,200 字」「5 分钟阅读」这类统计时它是基础数据；[`.ReadingTime`](/methods/page/readingtime/) 就是由它换算出来的。

两个必须知道的口径问题：

1. **切词依据是空白**（与 [`.PlainWords`](/methods/page/plainwords/) 同源），所以中文没有空格时，一整句接近一个「词」——要按 CJK 规则计数必须打开 `hasCJKLanguage`；
2. **只统计正文**，不含 front matter；但短代码渲染出来的文字**会**计入（实测）。

## 什么时候用，什么时候别用

**该用**：

- 显示字数/词数；自定义阅读时间（`div (float .WordCount) $speed`）；
- 判断页面是否「几乎没有内容」（例如 `lt .WordCount 50`）。

**别用**：

- 想要「取整到百位」的粗略值 → 用 [`FuzzyWordCount`](/methods/page/fuzzywordcount/)；
- 想要逐个词处理（去重、词频）→ 用 [`.PlainWords`](/methods/page/plainwords/)；
- 想要纯文本本身 → 用 [`.Plain`](/methods/page/plain/)；
- 想要字符数 → Hugo 没有现成方法，需要用 `len` 配合 `.Plain` 自己算。

## 用法

```go-html-template
{{ .WordCount }} → 103
```

要向上取整到最接近的 100 的倍数，请使用 [`FuzzyWordCount`][] 方法。

> [!NOTE]
> 对于 [CJK](g) 语言的内容，请在项目配置中把 [`hasCJKLanguage`][] 设为 `true`。启用后，Hugo 会对含 CJK 字符的页面应用 CJK 计数规则。要针对某个页面覆盖该行为，请在其前置元数据中设置 [`isCJKLanguage`][] 字段。

## 完整示例：把词数与阅读时间一起显示

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
<p>{{ .WordCount }} 词 · 约 {{ .ReadingTime }} 分钟</p>
```

实测（Hugo 0.167.0，测试站未开启 `hasCJKLanguage`）：

| 页面 | 内容概况 | `.WordCount` |
| --- | --- | --- |
| `/posts/empty-body/` | 正文为空 | `0` |
| `/posts/post-2/` | 一句话 | `1` |
| `/posts/bundle-1/` | 一段 + 一个二级标题 | `3` |
| `/posts/post-1/` | 开场段 + 两个小节 | `5` |
| `/posts/typed-page/` | 一句话 | `7` |
| `/posts/plain-short/` | 含一个短代码 | `9` |
| `/posts/plain-demo/` | 含短代码与标题 | `9` |

**你应当看到什么**：空正文是 `0`；中文短句的计数**不**等于汉字个数（例如 `/posts/post-2/` 的「第二篇正文，只有一小段。」算 1 个词），因为默认按空白切词。短代码（`note`）渲染出的文字计入总数，而 front matter 里的字段不计入。要让中文按 CJK 规则计数，请开启 `hasCJKLanguage`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 正文为空 | `0`（实测） | 否 |
| 中文且 `hasCJKLanguage = false`（默认） | 整句按一个词计（实测） | 否 |
| 含短代码 | 短代码渲染出的文字计入（实测） | 否 |
| front matter | 不计入 | 否 |
| `hasCJKLanguage = true` | 按 CJK 规则计数（上游说明；本站未启用） | 否 |
| front matter `isCJKLanguage` | 覆盖单页判定（上游说明） | 否 |
| 返回类型 | `int` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`FuzzyWordCount`]: /methods/page/fuzzywordcount/
[`hasCJKLanguage`]: /configuration/all/#hascjklanguage
[`isCJKLanguage`]: /content-management/front-matter/#iscjklanguage
