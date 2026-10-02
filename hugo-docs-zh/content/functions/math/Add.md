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

## 这一页解决什么问题

模板里没有 `+` 运算符。想在页面上显示「阅读时长 = 字数 ÷ 速度」之外的任何加法（累计数、偏移量、序号加一），都得用 `add`（`math.Add` 的别名）。

```go-html-template
{{ add 12 3 2 }} → 17
```

## 什么时候用，什么时候别用

**该用**：

- 两个或多个数字相加，包括在管道里递增：`{{ $n | add 1 }}`；
- 需要「至少一个浮点数时结果为浮点数」的自动类型提升。

**别用**：

- 拼接字符串 → 用 [`fmt.Printf`](/functions/fmt/printf/) 或 [`collections.Delimit`](/functions/collections/delimit/)；虽然实测 `add "hu" "go"` 可行（得到 `hugo`），但读代码的人容易误解；
- 求一组数字的和 → 用 [`math.Sum`](/functions/math/sum/)（可以直接吃切片）；
- 把字符串解析成数字 → 用 [`cast`](/functions/cast/) 系列。

如果其中一个数字是浮点数（`float`），结果为 `float`。

```go-html-template
{{ add 12 3 2 }} → 17
```

## 完整示例：累计计数与类型提升

```go-html-template {file="layouts/_partials/add-demo.html"}
{{ $count := 0 }}
{{ range slice "a" "b" "c" }}{{ $count = add $count 1 }}{{ end }}
<p>共 {{ $count }} 项（类型 {{ printf "%T" $count }}）</p>
<p>整数相加：{{ add 12 3 2 }}（类型 {{ printf "%T" (add 12 3 2) }}）</p>
<p>含浮点数：{{ add 12 3.5 }}（类型 {{ printf "%T" (add 12 3.5) }}）</p>
<p>管道写法：{{ 1 | add 2 | add 3 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>共 3 项（类型 int64）</p>
<p>整数相加：17（类型 int64）</p>
<p>含浮点数：15.5（类型 float64）</p>
<p>管道写法：6</p>
```

**你应当看到什么**：全整数相加得到 `int64`，一旦有浮点数就提升为 `float64`；管道写法 `{{ 1 | add 2 | add 3 }}` 依次累加得到 `6`——管道把左侧的值作为**最后一个参数**传给函数。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `12 3 2` | `17`（类型 `int64`） | 否 |
| `12 3.5` | `15.5`（类型 `float64`） | 否 |
| `"hu" "go"`（上游说明可拼接字符串） | `hugo`（类型 `string`，实测一致） | 否 |
| `1 "x"`（数字 + 非数字字符串） | —— | 是：`error calling add: can't apply the operator to the values` |
| 只传一个参数（如 `add 5`） | —— | 是：`error calling add: must provide at least two numbers` |
| 不传参数 | —— | 是（同类参数个数错误） |
| 返回类型 | `any`：全整数为 `int64`，含浮点为 `float64`，字符串为 `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `error calling add: must provide at least two numbers` | 只传了一个参数（例如写成 `add $n`） | 至少写两个：`add $n 1` |
| 报错看不懂 | `can't apply the operator to the values` | 一边是数字、一边是非数字字符串 | 用 [`cast.ToInt`](/functions/cast/toint/) 转换，或核对参数来源 |
| 没报错但结果不对 | 结果是 `3` 而不是 `3.5` | 两个操作数都是整数，触发整数运算 | 至少写一个浮点数（`3.0`），或先 `cast.ToFloat` |
| 没报错但结果不对 | 循环里累加始终不变 | 忘了把返回值赋回去：`add` 不会原地修改 | 写 `{{ $n = add $n 1 }}`（注意是 `=`） |
| 没报错但结果不对 | 字符串被当数字相加，结果是拼接 | 用了字符串参数 | 明确目的：拼接用 `printf`，求和用 `math.Sum` |

更多排查入口见[故障排查](/troubleshooting/)。
