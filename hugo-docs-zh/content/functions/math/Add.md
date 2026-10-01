+++
title = "math.Add"
linkTitle = "math.Add"
description = "返回把第一个数字与一个或多个数字相加的结果。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/math/add/"

[params.functions_and_methods]
signatures = ["math.Add VALUE VALUE..."]
returnType = "any"
aliases = ["add"]
+++

如果其中一个数字是浮点数（`float`），结果为 `float`。

```go-html-template
{{ add 12 3 2 }} → 17
```

也可以用 `add` 函数拼接字符串。

```go-html-template
{{ add "hu" "go" }} → hugo
```
