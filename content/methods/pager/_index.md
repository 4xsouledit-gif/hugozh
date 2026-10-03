+++
title = "Pager 方法"
linkTitle = "Pager"
description = "为分页列表页构建导航时，在 Pager 对象上使用这些方法。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/pager/"
+++

## 这一页解决什么问题

列表页文章一多就要分页：`/posts/`、`/posts/page/2/`、`/posts/page/3/`……[`Paginate`](/methods/page/paginate/) 方法把页面集合切成若干个**分页器（pager）**，本章讲的就是分页器对象上的方法：取当前页的页面、算总数、生成「首页 / 上一页 / 下一页 / 末页」和数字页码条。

上游这些页每页只有一个同名方法的小例子，本站为每页补上了「什么时候用 / 什么时候别用」「一个可直接粘贴的实测示例」与「返回值边界（空、nil、取不到时）」三部分。全章示例统一在同一个最小站点上实测：7 篇 `posts`、`[pagination] pagerSize = 3`、`baseURL = "https://example.org/"`，因此首页 3 条、`/page/2/` 3 条、`/page/3/` 1 条。

## 读完本章你应该能够

- 分清**分页器**与**页面**：[`Pages`](/methods/pager/pages/) 是当前分页器里的页面集合，[`Pagers`](/methods/pager/pagers/) 是全部 pager 的集合；
- 用 [`PageNumber`](/methods/pager/pagenumber/) / [`TotalPages`](/methods/pager/totalpages/) / [`PagerSize`](/methods/pager/pagersize/) / [`NumberOfElements`](/methods/pager/numberofelements/) / [`TotalNumberOfElements`](/methods/pager/totalnumberofelements/) 五个数字回答「第几页 / 共几页 / 每页几条 / 本页几条 / 一共几条」；
- 用 [`HasPrev`](/methods/pager/hasprev/) / [`HasNext`](/methods/pager/hasnext/) 配 [`Prev`](/methods/pager/prev/) / [`Next`](/methods/pager/next/) 生成导航，并知道首尾两页的 `Prev` / `Next` 是 **nil**，必须用 `with` 或 `Has*` 保护，否则整个构建失败；
- 用 [`First`](/methods/pager/first/) / [`Last`](/methods/pager/last/) 生成「首页 / 末页」链接——它们**永远有值**；
- 用 [`PageGroups`](/methods/pager/pagegroups/) 在分页的同时按月分组，并知道此时 `.Pages` 会是空的。

## 什么时候用本章的方法，什么时候别用

**该用**：

- 在 `home` / `section` / `taxonomy` / `term` 模板里做分页；
- 分页器一旦拿到（`{{ $paginator := .Paginate $pages }}`），本章所有方法都以它为上下文。

**别用**：

- **在普通内容页上分页**：实测直接构建失败——`error calling Paginate: pagination not supported for this page`；
- 想排序或筛选：那是 [`Paginate`](/methods/page/paginate/) **之前**的事（用 `where`、`ByDate` 等）；
- 想换个集合再分页一次：实测同一页面上第二次 `Paginate` 调用**被静默忽略**，沿用它缓存的 pager（`PagerSize` 仍是第一次的值），不报错、不警告；
- 把 pager 的 [`Prev`](/methods/pager/prev/) / [`Next`](/methods/pager/next/) 与 Page 的 [`Prev`](/methods/page/prev/) / [`Next`](/methods/page/next/) 混为一谈：前者是「页码相邻」，后者是「文章上下篇」。

## 建议阅读顺序

1. **先看当前页有什么**：[Pages](/methods/pager/pages/) → [NumberOfElements](/methods/pager/numberofelements/) → [PageNumber](/methods/pager/pagenumber/) → [TotalPages](/methods/pager/totalpages/) → [TotalNumberOfElements](/methods/pager/totalnumberofelements/)；
2. **再生成导航**：[URL](/methods/pager/url/) → [Prev](/methods/pager/prev/) / [Next](/methods/pager/next/) → [HasPrev](/methods/pager/hasprev/) / [HasNext](/methods/pager/hasnext/)；
3. **首末跳转**：[First](/methods/pager/first/) → [Last](/methods/pager/last/)；
4. **完整页码条**：[Pagers](/methods/pager/pagers/) → [PagerSize](/methods/pager/pagersize/)；
5. **分页 + 分组**：[PageGroups](/methods/pager/pagegroups/)。

每页条数与分页 URL 的配置见[分页](/templates/pagination/)，`Paginate` 自身的用法见 [methods/page/paginate](/methods/page/paginate/)。
