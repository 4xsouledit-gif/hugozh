+++
title = "collections.Merge"
linkTitle = "merge"
description = "把两个或多个给定映射合并为一个映射并返回。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/functions/collections/merge/"

[params.functions_and_methods]
signatures = ["collections.Merge MAP MAP..."]
returnType = "map[string]any"
aliases = ["merge"]
+++

返回从左到右合并两个或多个映射的结果。如果 key 已存在，`merge` 会更新它的值；如果 key 不存在，`merge` 会在新 key 下插入该值。

key 的处理不区分大小写。

下面的示例使用这些映射定义：

```go-html-template
{{ $m1 := dict "x" "foo" }}
{{ $m2 := dict "x" "bar" "y" "wibble" }}
{{ $m3 := dict "x" "baz" "y" "wobble" "z" (dict "a" "huey") }}
```

这个示例按顺序合并 `$m1`、`$m2` 和 `$m3`：

```go-html-template
{{ $merged := merge $m1 $m2 $m3 }}

{{ $merged.x }}   → baz
{{ $merged.y }}   → wobble
{{ $merged.z.a }} → huey
```

这个示例按顺序合并 `$m3`、`$m2` 和 `$m1`：

```go-html-template
{{ $merged := merge $m3 $m2 $m1 }}

{{ $merged.x }}   → foo
{{ $merged.y }}   → wibble
{{ $merged.z.a }} → huey
```

这个示例按顺序合并 `$m2`、`$m3` 和 `$m1`：

```go-html-template
{{ $merged := merge $m2 $m3 $m1 }}

{{ $merged.x }}   → foo
{{ $merged.y }}   → wobble
{{ $merged.z.a }} → huey
```

这个示例按顺序合并 `$m1`、`$m3` 和 `$m2`：

```go-html-template
{{ $merged := merge $m1 $m3 $m2 }}

{{ $merged.x }}   → bar
{{ $merged.y }}   → wibble
{{ $merged.z.a }} → huey
```

> [!NOTE]
> 无论嵌套多深，合并都只作用于映射。切片请使用 [`collections.Append`][] 函数。

[`collections.Append`]: /functions/collections/append/
