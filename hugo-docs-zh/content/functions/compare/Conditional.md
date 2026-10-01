+++
title = "compare.Conditional"
linkTitle = "compare.Conditional"
description = "根据控制参数的值返回两个参数之一。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/compare/conditional/"

[params.functions_and_methods]
signatures = ["compare.Conditional CONTROL ARG1 ARG2"]
returnType = "any"
aliases = ["cond"]
+++

## 用法

`compare.Conditional` 函数根据控制参数的值返回两个参数之一。如果 `CONTROL` 为真值，函数返回 `ARG1`，否则返回 `ARG2`。

与其他语言中的[三目运算符][]不同，`compare.Conditional` 函数不进行[短路求值][]。无论 `CONTROL` 的值是什么，它都会对 `ARG1` 和 `ARG2` 两者求值。

## 示例

```go-html-template
{{ $qty := 42 }}
{{ compare.Conditional (compare.Le $qty 3) "few" "many" }} → many
```

由于缺少短路求值，下面这些示例会抛出错误：

```go-html-template
{{ compare.Conditional true "true" (div 1 0) }}
{{ compare.Conditional false (div 1 0) "false" }}
```

[短路求值]: https://en.wikipedia.org/wiki/Short-circuit_evaluation
[三目运算符]: https://en.wikipedia.org/wiki/Ternary_conditional_operator
