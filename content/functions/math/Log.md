+++
title = "math.Log"
linkTitle = "math.Log"
description = "返回给定数字的自然对数。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/math/log/"

[params.functions_and_methods]
signatures = ["math.Log VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

自然对数（以 e 为底）在模板里偶尔会用到：按数量级分档（例如星级、音量刻度）、把指数增长换算成线性刻度、计算复利期数。

```go-html-template
{{ math.Log 42 }} → 3.737
```

> [!NOTE]
> 上游示例把结果写作 `3.737`（约简写法）。实测 Hugo 0.167.0 输出的是完整精度 `3.7376696182833684`，见下文。**这个函数只提供自然对数**（以 e 为底）；上游未给出换底函数，需要以 10 为底时请自行换算（`math.Log $x` 除以 `math.Log 10`）。

## 什么时候用，什么时候别用

**该用**：

- 需要自然对数（以 e 为底）做数量级/刻度换算；
- 与 [`math.Pow`](/functions/math/pow/) 互为逆运算时。

**别用**：

- 想求平方根 → 用 [`math.Sqrt`](/functions/math/sqrt/)；
- 想求幂 → 用 [`math.Pow`](/functions/math/pow/)；
- 想格式化小数位 → 用 [`fmt.Printf`](/functions/fmt/printf/)；上游示例里的 `3.737` 是排版上的约简，函数本身返回完整精度。

## 完整示例：自然对数与它的边界

```go-html-template {file="layouts/_partials/log-demo.html"}
<p>log(42) = {{ math.Log 42 }}</p>
<p>log(0) = {{ math.Log 0 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>log(42) = 3.7376696182833684</p>
<p>log(0) = -Inf</p>
```

**你应当看到什么**：`log(42)` 给出完整精度的 `3.7376696182833684`；`log(0)` **不报错**，返回 `-Inf`（负无穷），会直接显示在页面上。数学上 `ln(0)` 无定义，因此对可能为 0 的输入务必先判断。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `42` | `3.7376696182833684`（上游写作 `3.737`） | 否 |
| `1` | `0` | 否 |
| `0` | `-Inf` | 否 |
| 负数（如 `-1`） | `NaN`（实测） | 否 |
| 非数字字符串 `"x"` | 上游未说明；同类函数的报错见 [`math.Sqrt`](/functions/math/sqrt/) | 是 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面显示 `-Inf` | 输入是 0（或极小值） | 先判断 `if gt $x 0` |
| 没报错但结果不对 | 结果位数与文档示例不一致 | 上游示例是约简写法，实际是完整精度 | 用 `printf "%.3f"` 控制显示位数 |
| 没报错但结果不对 | 想要以 10 为底却用了 `log` | 该函数只提供自然对数 | 用 `div (math.Log $x) (math.Log 10)` 换算（上游未给出专门函数） |

更多排查入口见[故障排查](/troubleshooting/)。
