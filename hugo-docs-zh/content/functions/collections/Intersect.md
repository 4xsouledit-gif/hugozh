+++
title = "collections.Intersect"
linkTitle = "intersect"
description = "返回两个给定切片中的公共元素，顺序与第一个切片一致。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/collections/intersect/"

[params.functions_and_methods]
signatures = ["collections.Intersect SLICE1 SLICE2"]
returnType = "[]any"
aliases = ["intersect"]
+++

一个有用的例子是把它与 where 组合起来，当作 `AND` 过滤器使用：

```go-html-template
{{ $pages := where .Site.RegularPages "Type" "not in" (slice "page" "about") }}
{{ $pages := $pages | union (where .Site.RegularPages "Params.pinned" true) }}
{{ $pages := $pages | intersect (where .Site.RegularPages "Params.images" "!=" nil) }}
```

上面的代码会取出类型不是 `page` 或 `about` 的普通页面，除非它们被 pin 了。最后，我们排除掉所有未在 Page 参数中设置 `images` 的页面。

`OR` 请参见 [union][]。

[union]: /functions/collections/union/
