+++
title = "Keywords"
linkTitle = "Keywords"
description = "返回前置元数据中定义的关键词切片。"
date = 2026-10-02
weight = 370
source = "https://gohugo.io/methods/page/keywords/"

[params.functions_and_methods]
signatures = ["PAGE.Keywords"]
returnType = "[]string"
+++

## 这一页解决什么问题

`Keywords` 取出前置元数据里的 `keywords` 切片。默认配置下，它参与[相关内容][]的匹配；对读者而言，它常被用来输出 `meta name="keywords"` 或页面上的关键词标签。

## 什么时候用，什么时候别用

**该用**：

- 输出 `<meta name="keywords">`；
- 相关内容（related content）按关键词匹配时，确保页面上有 `keywords`。

**别用**：

- 想按标签**归类**页面 → 用[分类法](/content-management/taxonomies/)（`tags` / `categories`）；
- 想在正文里显示关键词的可点击链接 → 用 [`GetTerms`](/methods/page/getterms/) 取术语页；
- 想要页面摘要/正文 → 用 `.Summary` / `.Content`。

## 用法

默认情况下，Hugo 在创建[相关内容][]集合时会用到关键词。

```toml
title = 'How to make spicy tuna hand rolls'
keywords = ['tuna','sriracha','nori','rice']
```

在模板中列出关键词：

```go-html-template
{{ range .Keywords }}
  {{ . }}
{{ end }}
```

或者使用 [`delimit`][] 函数：

```go-html-template
{{ delimit .Keywords ", " ", and " }} → tuna, sriracha, nori, and rice
```

关键词也可以用作一种有用的[分类法][]：

```toml
[taxonomies]
tag = 'tags'
keyword = 'keywords'
category = 'categories'
```

[`delimit`]: /functions/collections/delimit/
## 完整示例：两种输出方式

最小站点：`content/docs/guide/alpha.md` 的前置元数据写 `keywords = ['tuna', 'sriracha', 'nori', 'rice']`；`beta.md` 没有写。模板：

```go-html-template {file="layouts/_default/single.html"}
<meta name="keywords" content="{{ delimit .Keywords ", " }}">
<p>与、连接：{{ delimit .Keywords ", " ", and " }}</p>
<p>逐个：{{ range .Keywords }}{{ . }} {{ end }}</p>
```

`hugo --source <站点目录> --ignoreCache` 构建后，alpha 输出：

```html
<meta name="keywords" content="tuna, sriracha, nori, rice">
<p>与、连接：tuna, sriracha, nori, and rice</p>
<p>逐个：tuna sriracha nori rice </p>
```

beta（没有关键词）输出 `<meta name="keywords" content="">`，两个段落的内容为空。

**你应当看到什么**：`delimit` 的第 3 个参数是「最后一项的连接词」，所以第二行得到 `tuna, sriracha, nori, and rice`（与上游示例一致）；`range` 形式会保留模板里的空白，因此末尾多一个空格。返回的是**切片**，不是字符串。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`alpha.md` 有 4 个关键词，`beta.md` 没有。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 前置元数据有 `keywords` | `[]string`，顺序与前置元数据一致 | 否 |
| 没有 `keywords` | 空切片，`len` 为 0，`with` 判为假 | 否 |
| 返回类型 | `[]string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 输出成了 `[tuna sriracha]` | 直接输出切片 | Go 模板打印切片会带方括号 | 用 `delimit` 或 `range` |
| 相关内容匹配不到 | 页面没有 `keywords`，或相关索引没配置 | 关键词只是数据，匹配要靠 `[related]` 配置 | 补 `keywords`，并按[相关内容][]配置索引 |
| 与 `tags` 混淆 | `meta keywords` 里出现了标签 | 两个字段用途不同 | 要归类用 `tags`，要相关匹配用 `keywords` |

更多排查入口见[故障排查](/troubleshooting/)。

[相关内容]: /content-management/related-content/
[分类法]: /content-management/taxonomies/
