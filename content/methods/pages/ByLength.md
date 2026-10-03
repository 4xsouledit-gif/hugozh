+++
title = "ByLength"
linkTitle = "ByLength"
description = "返回给定页面集合按内容长度升序排序后的结果。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/pages/bylength/"

[params.functions_and_methods]
signatures = ["PAGES.ByLength"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

把页面集合按**内容长度升序**重排（最短的在前）：做「短文推荐」「速读」列表，或排查「为什么摘要长度不一致」。

上游只说「content length」，**没有说明这里的长度是按词数还是按字符数**。实测四页的排序结果与 `.WordCount` 升序一致（见下表），但结论只到这一步：**排序方向可靠，具体度量别依赖**。

## 什么时候用，什么时候别用

**该用**：

- 想按篇幅长短列出页面（最短在前）；
- 站内「5 分钟速读」一类的编排。

**别用**：

- 想按字数**筛选**（「只保留超过 500 词的页面」）→ 那是 [`collections.Where`](/functions/collections/where/) 配 [`WordCount`](/methods/page/wordcount/) 的活，`ByLength` 只排序；
- 想按阅读时长 → 用 [`ReadingTime`](/methods/page/readingtime/) 排序（可用 [`collections.Sort`](/functions/collections/sort/) 自定义）；
- 想按日期/权重 → 用 [`ByDate`](/methods/pages/bydate/) / [`ByWeight`](/methods/pages/byweight/)。

## 用法

```go-html-template
{{ range .Pages.ByLength }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列（最长的在前）：

```go-html-template
{{ range .Pages.ByLength.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：四页按篇幅排序

示例沿用本章首页的[示例站点结构](/methods/pages/)，四页正文分别有 1、3、6、10 个英文单词：

| 页面 | `linkTitle` | 正文 |
| --- | --- | --- |
| `post-3.md` | `charlie` | `solo`（1 词） |
| `post-1.md` | `alpha` | `one two three`（3 词） |
| `post-4.md` | `delta` | `uno dos tres cuatro cinco seis`（6 词） |
| `post-2.md` | `bravo` | `alpha beta … kappa`（10 词） |

```go-html-template {file="layouts/_default/list.html"}
{{ range .Pages.ByLength }}{{ .LinkTitle }}({{ .WordCount }}) {{ end }}
```

Hugo 渲染为：

```html
charlie(1) alpha(3) delta(6) bravo(10) 
```

**你应当看到什么**：顺序与正文篇幅一致（最短的 `charlie` 在前）；括号里是 `.WordCount`，用来核对「长度」与你的直觉是否一致。若你的站点开了 [`hasCJKLanguage`](/configuration/all/)，中文页面的词数口径会不同，排序结果也会跟着变。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows，`hasCJKLanguage` 未开启。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页篇幅 1/3/6/10 词 | `charlie(1) alpha(3) delta(6) bravo(10)`，与数量升序一致 | 否 |
| 两页篇幅相同 | 顺序由内部实现决定，**上游未说明** | 否 |
| 空集合 | 空集合：`range` 无输出，`len` 为 0 | 否 |
| 返回类型 | `page.Pages` | 否 |
| 「长度」的具体定义（词数 or 字符数） | 上游未说明；实测方向为升序（短的在前） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 顺序与 `.WordCount` 不一致 | 中文/日文内容在未开启 `hasCJKLanguage` 时词数口径不同 | 打开 `hasCJKLanguage`，或改用自定义排序 |
| 没报错但结果不对 | 想「只留短页面」，结果一个也没少 | `ByLength` 只排序不过滤 | 用 `where ... "WordCount" "lt" 500` 过滤 |
| 没报错但结果不对 | 最长的一页排在最前 | 用了 `.Reverse`，或把升序当降序 | 对照本页输出核对 |
| 报错看不懂 | `can't evaluate field ByLength in type ...` | 对象不是页面集合 | 先取集合（`.Pages`、`.RegularPages`） |

更多排查入口见[故障排查](/troubleshooting/)。
