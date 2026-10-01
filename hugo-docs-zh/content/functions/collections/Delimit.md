+++
title = "collections.Delimit"
linkTitle = "delimit"
description = "用指定的分隔符连接给定切片或映射中的值，返回一个字符串。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/collections/delimit/"

[params.functions_and_methods]
signatures = ["collections.Delimit SLICE|MAP DELIMITER [LAST]"]
returnType = "string"
aliases = ["delimit"]
+++

连接切片：

```go-html-template
{{ $s := slice "b" "a" "c" }}
{{ delimit $s ", " }} → b, a, c
{{ delimit $s ", " " and "}} → b, a and c
```

连接映射：

> [!NOTE]
> `delimit` 函数会先按 key 对映射排序，然后返回它的值。

```go-html-template
{{ $m := dict "b" 2 "a" 1 "c" 3 }}
{{ delimit $m ", " }} → 1, 2, 3
{{ delimit $m ", " " and "}} → 1, 2 and 3
```
