+++
title = "math.MaxInt64"
linkTitle = "math.MaxInt64"
description = "返回有符号 64 位整数的最大值。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/math/maxint64/"

[params.functions_and_methods]
signatures = ["math.MaxInt64"]
returnType = "int64"
+++

**（0.147.3 新增）**

```go-html-template
{{ math.MaxInt64 }} → 9223372036854775807
```

当需要模拟一个持续到满足中断条件才结束的循环时，这个函数很有用。例如：

```go-html-template
{{ range math.MaxInt64 }}
  {{ if eq . 42 }}
    {{ break }}
  {{ end }}
{{ end }}
```
