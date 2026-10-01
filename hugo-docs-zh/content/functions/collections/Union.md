+++
title = "collections.Union"
linkTitle = "union"
description = "返回两个给定切片中的全部不重复元素。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/functions/collections/union/"

[params.functions_and_methods]
signatures = ["collections.Union SLICE1 SLICE2"]
returnType = "[]any"
aliases = ["union"]
+++

## 基本用法

用 `union` 函数合并两个切片，并去掉重复元素：

```go-html-template
{{ union (slice 1 2 3) (slice 3 4 5) }} → [1 2 3 4 5]
{{ union (slice 1 2 3) nil }}           → [1 2 3]
{{ union nil (slice 1 2 3) }}           → [1 2 3]
{{ union nil nil }}                     → []
```

## where 查询中的 OR 过滤

与 where 组合使用时，它也可以当作 `OR` 过滤器：

```go-html-template
{{ $pages := where .Site.RegularPages "Type" "not in" (slice "page" "about") }}
{{ $pages = $pages | union (where .Site.RegularPages "Params.pinned" true) }}
{{ $pages = $pages | intersect (where .Site.RegularPages "Params.images" "!=" nil) }}
```

上面的代码会取出类型不是 `page` 或 `about` 的普通页面，除非它们被 pin 了。最后，我们排除掉所有未在 Page 参数中设置 `images` 的页面。

`AND` 请参见 [intersect][]。

[intersect]: /functions/collections/intersect/
