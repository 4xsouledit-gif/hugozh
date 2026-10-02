+++
title = "数学函数"
linkTitle = "math"
description = "使用这些函数执行数学运算。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/functions/math/"
+++

## 这一页解决什么问题

模板里经常需要一点点算术：把两个参数相加、把价格格式化到两位小数、求一列数字的和、控制循环次数、按比例算宽度。Go 模板本身**没有算术运算符**——`+`、`-`、`*`、`/` 都不能直接写，所有运算都要通过本节这些函数完成。

这也是新手最容易困惑的地方：既然不能写 `{{ .Params.a + 1 }}`，那就必须知道有 `add`、`sub`、`mul`、`div`，以及它们**返回整型还是浮点型**。

## 什么时候用，什么时候别用

按用途分：

| 你想做的事 | 用哪个 |
| --- | --- |
| 加减乘除（两个或多个数） | [`math.Add`](/functions/math/add/)、[`math.Sub`](/functions/math/sub/)、[`math.Mul`](/functions/math/mul/)、[`math.Div`](/functions/math/div/) |
| 取余、判断整除 | [`math.Mod`](/functions/math/mod/)、[`math.ModBool`](/functions/math/modbool/) |
| 绝对值、幂、平方根、自然对数 | [`math.Abs`](/functions/math/abs/)、[`math.Pow`](/functions/math/pow/)、[`math.Sqrt`](/functions/math/sqrt/)、[`math.Log`](/functions/math/log/) |
| 向上/向下取整、四舍五入 | [`math.Ceil`](/functions/math/ceil/)、[`math.Floor`](/functions/math/floor/)、[`math.Round`](/functions/math/round/) |
| 一组数的最大值/最小值/和/积 | [`math.Max`](/functions/math/max/)、[`math.Min`](/functions/math/min/)、[`math.Sum`](/functions/math/sum/)、[`math.Product`](/functions/math/product/) |
| 三角函数、反三角函数（弧度） | [`math.Sin`](/functions/math/sin/)、[`math.Cos`](/functions/math/cos/)、[`math.Tan`](/functions/math/tan/)、[`math.Asin`](/functions/math/asin/)、[`math.Acos`](/functions/math/acos/)、[`math.Atan`](/functions/math/atan/)、[`math.Atan2`](/functions/math/atan2/) |
| 角度与弧度互转 | [`math.ToDegrees`](/functions/math/todegrees/)、[`math.ToRadians`](/functions/math/toradians/) |
| 常量、随机数、计数器 | [`math.Pi`](/functions/math/pi/)、[`math.MaxInt64`](/functions/math/maxint64/)、[`math.Rand`](/functions/math/rand/)、[`math.Counter`](/functions/math/counter/) |

**别用**：

- 只想拼字符串 → 用 [`fmt.Printf`](/functions/fmt/printf/) 或 [`collections.Delimit`](/functions/collections/delimit/)；虽然 `add "hu" "go"` 实测可行（得到 `hugo`），但语义上更容易读错；
- 想格式化小数位（保留两位小数）→ 用 `printf "%.2f"`，数学函数只负责取整，不管显示位数；
- 想取前 N 个字符或截断字符串 → 用 [`strings.Substr`](/functions/strings/substr/)、[`strings.Truncate`](/functions/strings/truncate/)；
- 想算长度/个数 → 用 `len`；
- 想把字符串转成数字 → 用 [`cast`](/functions/cast/) 系列，不要指望数学函数替你解析。

## 完整示例：常见算术一次跑通

```go-html-template {file="layouts/_partials/math-demo.html"}
管道：{{ 1 | add 2 | mul 3 }}
求和：{{ math.Sum 1 (slice 2 3) 4 }}
取整：{{ math.Round 2.5 }} / {{ math.Floor 2.9 }} / {{ math.Ceil 2.1 }}
极值：{{ math.Max 3 7 5 }} / {{ math.Min 3 7 5 }}
整数除法：{{ div 7 2 }}；浮点除法：{{ div 7.0 2 }}
```

Hugo 0.167.0 实测渲染为：

```html
管道：9
求和：10
取整：3 / 2 / 3
极值：7 / 3
整数除法：3；浮点除法：3.5
```

**你应当看到什么**：两个必须记住的规律——

1. **管道方向**：`{{ 1 | add 2 | mul 3 }}` = `(1+2)*3` = `9`；管道把左边的值作为**最后一个参数**传进去。
2. **类型决定结果**：`div 7 2` 是整数除法，得到 `3`（截断）；`div 7.0 2` 因为有一个浮点数，得到 `3.5`。上游文档对 `Add`／`Sub`／`Mul`／`Div` 的说明「如果其中一个数字是 float，结果为 float」说的就是这个。

## 返回值边界（实测通则）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。各函数的细则见各自页面。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 操作数全是整数 | 结果打印为整数（实测 `add 12 3 2` → `17`，类型 `int64`） | 否 |
| 有一个操作数是浮点 | 结果打印为浮点数（实测 `add 12 3.5` → `15.5`，类型 `float64`；`mul 12 3.5` → `42` 也仍是 `float64`） | 否 |
| 数字被写成字符串（`"1.5"`） | 多数函数接受数字字符串（实测 `math.Round "1.5"` → `2`、`math.Pow 2 "3"` → `8`） | 否 |
| 传 `nil` | 视函数而定：实测 `math.Floor nil` → `0`、`math.Sum nil` → `0`；不可依赖 | 否 |
| 传布尔 `true` | 实测 `math.Abs true` → `1` | 否 |
| 传非数字字符串（`"x"`） | 报错，报错文本各函数不同（见各页） | 是 |
| 除以 0 | 报错（实测 `div 1 0` → `can't divide the value by 0`） | 是 |
| 参数个数不对 | 报错（实测 `math.Abs` 无参 → `wrong number of args for Abs: want 1 got 0`） | 是 |
| 结果超出定义域（`math.Sqrt -1`、`math.Acos 2`） | 不报错，返回 `NaN`；`math.Log 0` 返回 `-Inf` | 否 |

## 读完本章你应该能够

- 在没有算术运算符的模板里写出正确的加减乘除，并预判结果是整数还是浮点数
- 区分 `div 7 2`（`3`）与 `div 7.0 2`（`3.5`），知道什么时候必须引入浮点数
- 处理边界：除零、负数开方、超出定义域、类型不符分别会发生什么
- 用 `math.Sum`／`math.Max` 这类聚合函数处理切片，而不是自己写循环累加

## 阅读顺序

1. 先看四个基本运算：[math.Add](/functions/math/add/)、[math.Sub](/functions/math/sub/)、[math.Mul](/functions/math/mul/)、[math.Div](/functions/math/div/)；
2. 再看取整与聚合：[math.Ceil](/functions/math/ceil/)、[math.Floor](/functions/math/floor/)、[math.Round](/functions/math/round/)、[math.Sum](/functions/math/sum/)、[math.Max](/functions/math/max/)、[math.Min](/functions/math/min/)；
3. 需要时再看数学函数：[math.Abs](/functions/math/abs/)、[math.Pow](/functions/math/pow/)、[math.Sqrt](/functions/math/sqrt/)、[math.Log](/functions/math/log/)、三角函数与角度换算；
4. 最后是工具型的：[math.Pi](/functions/math/pi/)、[math.MaxInt64](/functions/math/maxint64/)、[math.Rand](/functions/math/rand/)、[math.Counter](/functions/math/counter/)。

更多排查入口见[故障排查](/troubleshooting/)。
