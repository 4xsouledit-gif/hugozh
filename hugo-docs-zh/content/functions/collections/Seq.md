+++
title = "collections.Seq"
linkTitle = "seq"
description = "返回一个整数切片：从 1 或指定值开始，按 1 或指定步长递增，到指定值结束。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/functions/collections/seq/"

[params.functions_and_methods]
returnType = "[]int"
aliases = ["seq"]
+++

```go-html-template
{{ seq 2 }} → [1 2]
{{ seq 0 2 }} → [0 1 2]
{{ seq -2 2 }} → [-2 -1 0 1 2]
{{ seq -2 2 2 }} → [-2 0 2]
```

一个刻意构造的遍历整数序列的示例：

```go-html-template
{{ $product := 1 }}
{{ range seq 4 }}
  {{ $product = mul $product . }}
{{ end }}
{{ $product }} → 24
```

> [!NOTE]
> 该函数创建的切片最多包含 100 万个元素。
