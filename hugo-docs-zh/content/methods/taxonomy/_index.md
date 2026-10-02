+++
title = "Taxonomy 方法"
linkTitle = "Taxonomy"
description = "在 Taxonomy 对象上使用这些方法。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/taxonomy/"
aliases = ["/variables/taxonomy/"]
+++

## 这一页解决什么问题

一个 `Taxonomy` 对象代表**某个分类法整体**（例如 `genres`）——它是一张映射：术语名 → 该术语下的加权页面。本章的 5 个方法都建立在这张映射之上，分别解决「列术语」「数术语」「取某术语的页面」「拿分类法自己的页面」四件事：

- 按术语字母序列出整张表 → [Alphabetical](/methods/taxonomy/alphabetical/)
- 按术语关联页面数量排序（做标签云）→ [ByCount](/methods/taxonomy/bycount/)
- 数某个术语有多少页面 → [Count](/methods/taxonomy/count/)
- 取某个术语下的页面切片 → [Get](/methods/taxonomy/get/)
- 取这个分类法自己的页面（可能是 `nil`）→ [Page](/methods/taxonomy/page/)

**先解决「对象从哪来」**：在分类法页面（如 `/genres/`）的模板里用 `.Data.Terms`；在其它任何模板里用 `.Site.Taxonomies.genres`。两者是同一个对象。

## 读完本章你应该能够

- 在**任意模板**与**taxonomy 模板**两种场合各取到 `Taxonomy` 对象，并说明它们的区别；
- 用 `Alphabetical` / `ByCount` 列出术语及其计数，并会 `.Reverse` 反转；
- 用 `Count` 数某个术语，并知道**不存在的术语返回 `0` 而不是报错**；
- 用 `Get` 取某术语下的页面，并处理**不存在的术语返回空切片**；
- 为「术语名含连字符」这种不能用链式语法的情况改用 `index` 函数；
- 用 `Page` 链接到分类法页面，并处理空分类法返回 `nil` 的情况。

## 什么时候用本章的方法，什么时候别用

**该用**：

- 正在渲染**分类法页面**或**术语页面**，需要术语列表、术语计数、某术语下的文章；
- 需要按字母序或计数排序术语（这正是 `Alphabetical` / `ByCount` 的价值）。

**别用**：

- 只是想在某处列一下所有分类法的键 → [`Site.Taxonomies`](/methods/site/taxonomies/) 就够了，不排序时不需要本章；
- 想把 `Taxonomy` 对象当切片直接 `range` → 它是**映射**，`range` 要接两个变量（`$term, $weightedPages`）；要切片就用 `Alphabetical` / `ByCount`；
- 想按条件筛页面 → 用 [`where`](/functions/collections/where/)；
- 想要「某个页面属于哪些术语」→ 用页面上的 `.GetTerms`（见 [methods/page](/methods/page/)）。

## 阅读顺序

1. 取对象：`.Data.Terms`（taxonomy 模板）或 [Site.Taxonomies](/methods/site/taxonomies/)（任意模板）
2. 列术语：[Alphabetical](/methods/taxonomy/alphabetical/) → [ByCount](/methods/taxonomy/bycount/)
3. 查单个术语：[Count](/methods/taxonomy/count/) → [Get](/methods/taxonomy/get/)
4. 链接分类法页面：[Page](/methods/taxonomy/page/)

## 一个能跑通的最小示例

`hugo.toml` 中配置 `genre = 'genres'`，四本书的 `genres` 分别为 suspense、suspense、suspense+romance、romance。分类法模板 `layouts/taxonomy.html`（渲染 `/genres/`）：

```go-html-template {file="layouts/taxonomy.html"}
{{ $taxonomyObject := .Data.Terms }}
<p>术语数：{{ len $taxonomyObject }}</p>
<p>字母序：{{ range $taxonomyObject.Alphabetical }}{{ .Term }}={{ .Count }}|{{ end }}</p>
<p>按计数：{{ range $taxonomyObject.ByCount }}{{ .Term }}={{ .Count }}|{{ end }}</p>
<p>suspense 有 {{ $taxonomyObject.Count "suspense" }} 本</p>
<p>不存在的术语：{{ $taxonomyObject.Count "nope" }}</p>
```

Hugo 渲染为：

```html
<p>术语数：2</p>
<p>字母序：romance=2|suspense=3|</p>
<p>按计数：suspense=3|romance=2|</p>
<p>suspense 有 3 本</p>
<p>不存在的术语：0</p>
```

**你应当看到什么**：`len $taxonomyObject` 是**术语个数**（2），不是页面数；`Alphabetical` 与 `ByCount` 的唯一差别就是排序依据，计数相同；`Count` 对不存在的术语返回 `0`，**不报错**——这正是它容易被误用的地方（拼错术语名时看起来「这个术语没有内容」）。
