+++
title = "math.Div"
linkTitle = "math.Div"
description = "返回第一个数字除以一个或多个数字的结果。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/math/div/"

[params.functions_and_methods]
signatures = ["math.Div VALUE VALUE..."]
returnType = "any"
aliases = ["div"]
+++

如果其中一个数字是浮点数（`float`），结果为 `float`。

```go-html-template
{{ div 12 3 2 }} → 2
```
