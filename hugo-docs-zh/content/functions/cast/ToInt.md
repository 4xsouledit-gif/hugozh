+++
title = "cast.ToInt"
linkTitle = "cast.ToInt"
description = "返回给定值转换后的十进制整数（base 10）。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/cast/toint/"

[params.functions_and_methods]
signatures = ["cast.ToInt INPUT"]
returnType = "int"
aliases = ["int"]
+++

## 这一页解决什么问题

需要整数的场合比想象中多：循环次数、切片下标、[`collections.First`](/functions/collections/first/) 的 N、`weight` 排序值、分页参数。这些值常常是字符串写进来的（前置元数据、配置、短代码参数），而 Hugo 的整数参数不接受字符串。

`int`（即 `cast.ToInt`）负责把它变成 `int`。它同时也是最容易被**前导零**坑到的转换函数，本页把这一点单独讲清楚。

## 什么时候用，什么时候别用

**该用**：

- 需要 `int` 才能用的参数与运算：`first N`、`slice` 下标、`seq`、整数比较；
- 把「字符串写法的数量」变成真正能参与算术的整数；
- 从浮点数取整（向下截断，`int 11.9` → `11`）。

**别用**：

- 需要小数 → 用 [`cast.ToFloat`](/functions/cast/tofloat/)；`int` 会直接丢掉小数部分，而且不四舍五入；
- 想按「四舍五入」取整 → 先用 [`math.Round`](/functions/math/round/) 再 `int`；
- 字符串带前导零（`"0011"`）却又想按十进制理解 → 先 [`strings.TrimLeft "0"`](/functions/strings/trimleft/) 再 `int`，否则得到八进制的 9；
- 想解析日期/时间戳 → 用 [`time`](/functions/time/) 系列函数。

## 上游给出的各种进制输入结果

输入为十进制（base 10）时：

```go-html-template
{{ int 11 }} → 11 (int)
{{ int "11" }} → 11 (int)

{{ int 11.1 }} → 11 (int)
{{ int 11.9 }} → 11 (int)
```

输入为二进制（base 2）时：

```go-html-template
{{ int 0b11 }} → 3 (int)
{{ int "0b11" }} → 3 (int)
```

输入为八进制（base 8）时（两种记法都可用）：

```go-html-template
{{ int 011 }} → 9 (int)
{{ int "011" }} → 9 (int)

{{ int 0o11 }} → 9 (int)
{{ int "0o11" }} → 9 (int)
```

输入为十六进制（base 16）时：

```go-html-template
{{ int 0x11 }} → 17 (int)
{{ int "0x11" }} → 17 (int)
```

> [!NOTE]
> 带前导零的值是八进制（base 8）。转换十进制（base 10）数字的字符串表示时，请先去掉前导零：

`{{ strings.TrimLeft "0" "0011" | int }} → 11`

## 完整示例：把字符串数量转成整数

```go-html-template {file="layouts/_partials/count.html"}
{{ $s := "0011" }}
<p>{{ int (strings.TrimLeft "0" $s) }}</p>
<p>{{ int 11.9 }} / {{ int "0x11" }}</p>
<p>{{ int "" }} / {{ int nil }} / {{ int true }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>11</p>
<p>11 / 17</p>
<p>0 / 0 / 1</p>
```

**你应当看到什么**：`"0011"` 必须先 `TrimLeft "0"` 才能得到十进制的 `11`（不处理会得到 9）；`int 11.9` 是 `11`，小数被**截断**而不是四舍五入；空字符串与 `nil` 都静默变成 `0`。最后一行的三个结果分别来自空字符串、`nil` 和布尔 `true`——它们全都不报错，所以「数据缺失」在这个函数里是隐形的。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| 整数、可解析的十进制字符串（`11`、`"11"`） | 对应 `int` | 否 |
| 浮点数字面量 / 浮点字符串（`11.9`、`"11.9"`） | `11`（**截断**，不四舍五入） | 否 |
| `"011"` | `9`（按八进制解析，上游已说明） | 否 |
| 带进制前缀的字符串（`"0b11"`、`"0o11"`、`"0x11"`） | 按对应进制解析，实测分别为 `3`、`9`、`17` | 否 |
| `""` | `0` | 否 |
| `nil` | `0` | 否 |
| 布尔 `true` / `false` | `1` / `0` | 否 |
| `"abc"`（无法解析的字符串） | —— | 是：`error calling int: unable to cast "abc" of type string to int: strconv.ParseInt: parsing "abc": invalid syntax` |
| 返回类型 | `int` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `"0011"` 得到 9 而不是 11 | 字符串被按八进制解析 | 先 [`strings.TrimLeft "0"`](/functions/strings/trimleft/)，或改用 [`cast.ToFloat`](/functions/cast/tofloat/) |
| 没报错但结果不对 | 循环次数、分页参数在数据缺失时变成 0，页面空了一块 | `int ""` 与 `int nil` 都返回 `0` | 转换前判空，或显式写默认值 |
| 没报错但结果不对 | `11.9` 变成 11，以为会四舍五入 | `int` 只截断小数部分 | 需要四舍五入就先用 [`math.Round`](/functions/math/round/) |
| 报错看不懂 | `unable to cast "abc" of type string to int` | 字符串不是合法整数 | 检查数据源；需要小数就用 [`cast.ToFloat`](/functions/cast/tofloat/) |

更多排查入口见[故障排查](/troubleshooting/)。
