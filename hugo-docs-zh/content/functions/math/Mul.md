+++
title = "math.Mul"
linkTitle = "math.Mul"
description = "返回第一个数字与一个或多个数字相乘的结果。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/functions/math/mul/"

[params.functions_and_methods]
signatures = ["math.Mul VALUE VALUE..."]
returnType = "any"
aliases = ["mul"]
+++

如果其中一个数字是浮点数（`float`），结果为 `float`。

```go-html-template
{{ mul 12 3 2 }} → 72
```
