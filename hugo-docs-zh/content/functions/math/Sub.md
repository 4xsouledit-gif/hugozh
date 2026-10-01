+++
title = "math.Sub"
linkTitle = "math.Sub"
description = "返回第一个数字减去一个或多个数字的结果。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/functions/math/sub/"

[params.functions_and_methods]
signatures = ["math.Sub VALUE VALUE..."]
returnType = "any"
aliases = ["sub"]
+++

如果其中一个数字是浮点数（`float`），结果为 `float`。

```go-html-template
{{ sub 12 3 2 }} → 7
```
