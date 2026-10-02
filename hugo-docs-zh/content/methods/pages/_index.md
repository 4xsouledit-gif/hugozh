+++
title = "Pages 方法"
linkTitle = "Pages"
description = "在 Page 对象集合上使用这些方法。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/pages/"
aliases = ["/variables/pages"]
+++

## 这一章解决什么问题

模板里凡是要「列出多个页面」的地方，拿到的都是页面集合（`page.Pages`）：`.Pages`、[`site.RegularPages`](/methods/site/regularpages/)、[`collections.Where`](/functions/collections/where/) 的结果、分页器里的 `.Pages`。本章的方法都在这个集合上工作，解决四类问题：

| 你要做的事 | 用哪些方法 |
| --- | --- |
| 换一个顺序 | [`ByDate`](/methods/pages/bydate/)、[`ByWeight`](/methods/pages/byweight/)、[`ByTitle`](/methods/pages/bytitle/)、[`ByParam`](/methods/pages/byparam/) 等 |
| 倒过来 | [`Reverse`](/methods/pages/reverse/)，可接在任意排序方法后面 |
| 分组（按月归档、按颜色分栏） | [`GroupBy`](/methods/pages/groupby/)、[`GroupByDate`](/methods/pages/groupbydate/)、[`GroupByParam`](/methods/pages/groupbyparam/) 等，返回的是「分组」切片，每组有自己的 `.Key` 与 `.Pages` |
| 限量、计数、定位、导航 | [`Limit`](/methods/pages/limit/)、[`Len`](/methods/pages/len/)、[`IndexOf`](/methods/pages/indexof/)、[`Next`](/methods/pages/next/)、[`Prev`](/methods/pages/prev/)、[`Related`](/methods/pages/related/) |

本章的方法**不筛选**（要筛选用 [`collections.Where`](/functions/collections/where/)），也**不产生分页**（分页用[分页器](/templates/pagination/)）。

## 读完本章你应该能够

- 看着签名选方法：`ByXxx` 返回同类型的页面集合，`GroupByXxx` 返回分组切片，`Len`/`IndexOf` 返回整数；
- 说清「默认顺序」是什么，以及为什么 `.Pages` 与 `.ByWeight` 常常看起来一样；
- 知道**空集合不会报错**：`range` 得到空输出，`Len` 得 0，`GroupBy` 得空切片（在 `if` 里判为假）；
- 知道 `Next`/`Prev` 在集合首尾返回 **nil**，并用 `with` 包住以免输出空链接；
- 知道 `ByParam`/`GroupByParam` 遇到「没有这个参数」的页面时行为不同（一个保留、一个丢弃），并在用之前先补默认值。

## 示例站点结构

本章各页的「实测」输出都来自下面这个最小站点（Hugo 0.167.0 extended，`locale = 'en-US'`、`timeZone = 'UTC'`，`hugo --source <目录> --ignoreCache`）。要自己复现，照着建即可。

```tree
content/
├── books/
│   ├── _index.md
│   ├── book-1.md   <-- weight = 10, date = 2023-03-03, linkTitle = "book-one", color = "green"
│   └── book-2.md   <-- weight = 20, date = 2023-04-04, linkTitle = "book-two", color = "blue"
├── empty/
│   └── _index.md   <-- 没有任何子页面，用来观察空集合
├── posts/
│   ├── _index.md   <-- title = "Posts Section", linkTitle = "Posts"
│   ├── post-1.md   <-- weight = 10, date = 2023-01-10, lastmod = 2024-03-01, expiryDate = 2027-01-01, publishDate = 2023-01-05, linkTitle = "alpha",   color = "red",   rank = 2, eventDate = 2024-05-01, author = { last_name = "Zulu" }
│   ├── post-2.md   <-- weight = 20, date = 2023-02-15, lastmod = 2024-01-15, expiryDate = 2027-03-01, publishDate = 2023-02-10, linkTitle = "bravo",   color = "blue",             eventDate = 2024-06-01, author = { last_name = "Alpha" }
│   ├── post-3.md   <-- weight = 30, date = 2022-12-01, lastmod = 2024-02-20, expiryDate = 2028-02-01, publishDate = 2022-11-25, linkTitle = "charlie", color = "red",   rank = 1, eventDate = 2024-05-15, author = { last_name = "Mike" }
│   └── post-4.md   <-- 未设置 weight, date = 2024-01-01, lastmod = 2024-04-01, expiryDate = 2028-01-01, publishDate = 2024-01-02, linkTitle = "delta", color = "green", eventDate = 2024-07-01, author = { last_name = "Bravo" }
└── _index.md
```

四条 `posts` 的正文分别有 3、10、1、6 个英文单词，用于 [`ByLength`](/methods/pages/bylength/) 的实测。后文所有「实测」数字都用 `.Pages`（`posts` 这个 section 的页面集合）或 `site.RegularPages` 跑出来，模板一律写清楚放在哪个文件里。

## 建议阅读顺序

1. **[Len](/methods/pages/len/)** —— 先确认集合里有几个页面，后面的数字才有参照。
2. **排序组**：[ByWeight](/methods/pages/byweight/) → [ByDate](/methods/pages/bydate/) → [ByTitle](/methods/pages/bytitle/) / [ByLinkTitle](/methods/pages/bylinktitle/) → [ByLength](/methods/pages/bylength/) → [ByParam](/methods/pages/byparam/) → 其余 `ByXxxDate`。
3. **[Reverse](/methods/pages/reverse/)** —— 一行实现降序，不必记每个方法的反向版本。
4. **限量**：[Limit](/methods/pages/limit/)。
5. **分组**：[GroupBy](/methods/pages/groupby/) → [GroupByParam](/methods/pages/groupbyparam/) → 各 `GroupByXxxDate`。
6. **导航与定位**：[IndexOf](/methods/pages/indexof/) → [Next](/methods/pages/next/) / [Prev](/methods/pages/prev/) → [Related](/methods/pages/related/) → [ByLanguage](/methods/pages/bylanguage/)。

> [!TIP]
> 排序方法**不会改变原集合**，它们返回新的集合。所以 `{{ $sorted := .Pages.ByDate }}` 之后，`.Pages` 还是原来的顺序；把排序结果存进变量再反复使用，比每次重新排序省事也更不容易写错。

> [!WARNING]
> [`Prev`](/methods/pages/prev/) 与 [`Next`](/methods/pages/next/) 的签名里返回类型写的是 `page.Pages`，但**实测返回的是单个页面**（页面集合上没有这个方法能返回的「集合」）。判断有没有值请用 `with`；对返回值用 `len` 会直接报错：有值时是 `len of type hugolib.pageState`，nil 时是 `len of type nil pointer`。
