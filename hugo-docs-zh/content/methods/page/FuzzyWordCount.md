+++
title = "FuzzyWordCount"
linkTitle = "FuzzyWordCount"
description = "返回给定页面内容的单词数，向上取整到最接近的 100 的倍数。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/methods/page/fuzzywordcount/"

[params.functions_and_methods]
signatures = ["PAGE.FuzzyWordCount"]
returnType = "int"
+++

## 这一页解决什么问题

`FuzzyWordCount` 给出「大致多少词」：把精确词数向上取整到最近的 100 的倍数，用来做列表页的篇幅提示，避免显示「437 词」这种精确但没有意义的信息。

## 什么时候用，什么时候别用

**该用**：

- 列表页显示粗略篇幅（「约 100 词」）；
- 与 `.ReadingTime` 搭配做阅读时长提示。

**别用**：

- 要**精确**词数 → 用 [`WordCount`](/methods/page/wordcount/)；
- 中文内容 → 先检查 `hasCJKLanguage`，否则计数会偏（见下方 NOTE）；
- 想按字节长度切分内容 → 那是 [`Len`](/methods/page/len/)。

## 用法

```go-html-template
{{ .FuzzyWordCount }} → 200
```

要得到精确的单词数，请使用 [`WordCount`][] 方法。

> [!NOTE]
> 对于 [CJK](g) 语言的内容，请在项目配置中把 [`hasCJKLanguage`][] 设为 `true`。启用后，Hugo 会对含 CJK 字符的页面应用 CJK 计数规则。若要覆盖某个页面的这一行为，请在其前置元数据中设置 [`isCJKLanguage`][] 字段。

## 完整示例：同一页面上对比精确与粗略词数

最小站点：`content/posts/first.md` 的正文是一句英文：

```text
The quick brown fox jumps over the lazy dog and then runs away into the forest today.
```

模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<p>{{ .WordCount }} 词 / 约 {{ .FuzzyWordCount }} 词 / 约 {{ .ReadingTime }} 分钟</p>
```

`hugo --source <站点目录> --ignoreCache` 构建后：

```html
<p>17 词 / 约 100 词 / 约 1 分钟</p>
```

**你应当看到什么**：精确词数是 17，`FuzzyWordCount` 向上取整到 **100**（不是 0，也不是 17）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`hasCJKLanguage = true`；英文样例精确 17 词，中文样例 `alpha.md` 精确 39 词，短中文样例 `beta.md` 精确 7 词。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 精确词数 17 | `100` | 否 |
| 精确词数 39（中文） | `100` | 否 |
| 精确词数 7 | `100` | 否 |
| 返回类型 | `int` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 中文页面的词数明显偏小 | 未启用 CJK 计数规则 | 在 `hugo.toml` 设 `hasCJKLanguage = true`，或给单页设 `isCJKLanguage` |
| 没报错但结果不对 | 很短的页面也显示「约 100 词」 | 不足 100 也会向上取整 | 需要精确值就用 `WordCount` |
| 页面只有标题 | 显示 0 | 没有正文，词数为 0 | 模板里用 `if` 兜底 |

更多排查入口见[故障排查](/troubleshooting/)。

[`WordCount`]: /methods/page/wordcount/
[`hasCJKLanguage`]: /configuration/all/#hascjklanguage
[`isCJKLanguage`]: /content-management/front-matter/#iscjklanguage
