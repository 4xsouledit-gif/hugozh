+++
title = "math.Rand"
linkTitle = "math.Rand"
description = "返回半开区间 [0.0, 1.0) 内的伪随机数。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/functions/math/rand/"

[params.functions_and_methods]
signatures = ["math.Rand"]
returnType = "float64"
+++

`math.Rand` 函数返回半开区间 `[0.0, 1.0)` 内的伪随机数。

```go-html-template
{{ math.Rand }} → 0.6312770459590062
```

生成闭区间 `[0, 5]` 内的随机整数：

```go-html-template
{{ math.Rand | mul 6 | math.Floor }}
```

生成闭区间 `[1, 6]` 内的随机整数：

```go-html-template
{{ math.Rand | mul 6 | math.Ceil }}
```

生成闭区间 `[0, 4.9]` 内、小数点后保留一位的随机浮点数：

```go-html-template
{{ div (math.Rand | mul 50 | math.Floor) 10 }}
```

生成闭区间 `[0.1, 5.0]` 内、小数点后保留一位的随机浮点数：

```go-html-template
{{ div (math.Rand | mul 50 | math.Ceil) 10 }}
```
