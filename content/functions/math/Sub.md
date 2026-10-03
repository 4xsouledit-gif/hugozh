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

## 这一页解决什么问题

模板里没有 `-` 运算符：剩余库存、倒计时、差额，都要用 `sub`（`math.Sub` 的别名）。它支持连续减多个数。

```go-html-template
{{ sub 12 3 2 }} → 7
```

## 什么时候用，什么时候别用

**该用**：

- 计算差值、剩余量、倒计时；
- 配合 [`math.Abs`](/functions/math/abs/) 求「差距大小」（不关心方向）。

**别用**：

- 需要「前一个减后一个」的**方向**确定 → 注意参数顺序：第一个是被减数，其余全部是减数；
- 想取反（求相反数）→ 用 [`math.Mul`](/functions/math/mul/) 乘 `-1`，例如 `mul -1 $x`；
- 想比较两个数的大小 → 用 [`compare`](/functions/compare/) 系列，不必先做减法。

如果其中一个数字是浮点数（`float`），结果为 `float`。

```go-html-template
{{ sub 12 3 2 }} → 7
```

## 完整示例：算库存与连续减

```go-html-template {file="layouts/_partials/sub-demo.html"}
{{ $stock := 100 }}{{ $sold := 37 }}
<p>库存：{{ sub $stock $sold }}（类型 {{ printf "%T" (sub $stock $sold) }}）</p>
<p>连续减：{{ sub 12 3 2 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>库存：63（类型 int64）</p>
<p>连续减：7</p>
```

**你应当看到什么**：两个整数相减得到 `int64`；`sub 12 3 2` 是 `12-3-2 = 7`（**不是** `12-(3-2)`）。一旦有浮点数参与，结果就变成 `float64`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `12 3 2` | `7`（类型 `int64`） | 否 |
| `100 37` | `63`（`int64`） | 否 |
| `12 3.5` | `8.5`（类型 `float64`，与 [`math.Add`](/functions/math/add/) 的类型规则相同） | 否 |
| 结果小于 0 | 返回负数（`sub` 不做截断，也不报错） | 否 |
| 非数字字符串 | —— | 是：`can't apply the operator to the values`（与 [`math.Add`](/functions/math/add/) 同类） |
| 参数少于两个 | —— | 是：至少需要两个数字 |
| 返回类型 | `any`：全整数为 `int64`，含浮点为 `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 连续减的结果与预期不符 | `sub` 从左到右依次相减，不是先算后面 | 需要分组时用括号：`sub 12 (sub 3 2)` |
| 没报错但结果不对 | 出现负数 | 减数比被减数大 | 需要非负量时判断后取 [`math.Abs`](/functions/math/abs/)，或改换减数顺序 |
| 报错看不懂 | `can't apply the operator to the values` | 有操作数是字符串 | 用 [`cast`](/functions/cast/) 转换 |
| 报错看不懂 | 提示至少需要两个数字 | 只传了一个参数 | 补足参数 |

更多排查入口见[故障排查](/troubleshooting/)。
