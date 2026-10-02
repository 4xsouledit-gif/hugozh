+++
title = "cast.ToFloat"
linkTitle = "cast.ToFloat"
description = "返回给定值转换后的十进制浮点数（base 10）。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/cast/tofloat/"

[params.functions_and_methods]
signatures = ["cast.ToFloat INPUT"]
returnType = "float64"
aliases = ["float"]
+++

## 这一页解决什么问题

模板里的数字不总是数字：前置元数据里的 `price = "42.5"`（加了引号）、来自 `hugo.Data` 的 JSON 字段、从 URL 或 [shortcode](/functions/) 参数拿到的字符串，进入模板后都可能是 `string`。拿字符串去做 [`add`](/functions/math/add/)、[`mul`](/functions/math/mul/) 这类算术，或者与数字比较，得到的不是想要的结果。

`float`（即 `cast.ToFloat`）把它变成 `float64`，之后就能参与算术与比较。

## 什么时候用，什么时候别用

**该用**：

- 参与浮点运算：价格、评分、比例、单位换算；
- 参与数字比较（`gt`、`lt`、`eq` 与数字字面量比较时类型必须一致）；
- 值可能来自「字符串写法的配置」，又需要按数字用。

**别用**：

- 只需要整数（计数、下标、[`collections.First`](/functions/collections/first/) 的 N）→ 用 [`cast.ToInt`](/functions/cast/toint/)：`float` 返回 `float64`，再当整数用还得转一次；
- 只是想把数字输出到页面上 → 直接 `{{ 11 }}`，模板会渲染成文本；
- 想判断字符串是不是合法数字 → 先转换会直接报错（见边界表），需要先用 [`strings`](/functions/strings/) 系列或 `try` 做校验；
- 想解析时间戳 → 用 [`time.AsTime`](/functions/time/astime/)，`float` 不会把「2024-01-01」这种文本认成数字。

## 上游给出的各种进制输入结果

输入为十进制（base 10）时：

```go-html-template
{{ float 11 }} → 11 (float64)
{{ float "11" }} → 11 (float64)

{{ float 11.1 }} → 11.1 (float64)
{{ float "11.1" }} → 11.1 (float64)

{{ float 11.9 }} → 11.9 (float64)
{{ float "11.9" }} → 11.9 (float64)
```

输入为二进制（base 2）时：

```go-html-template
{{ float 0b11 }} → 3 (float64)
```

输入为八进制（base 8）时（两种记法都可用）：

```go-html-template
{{ float 011 }} → 9 (float64)
{{ float "011" }} → 11 (float64)

{{ float 0o11 }} → 9 (float64)
```

输入为十六进制（base 16）时：

```go-html-template
{{ float 0x11 }} → 17 (float64)
```

注意 `{{ float "011" }} → 11`：**字符串走的是十进制解析**，前导零不表示八进制；只有不加引号的数字字面量才按 Go 的进制规则求值。这与 [`cast.ToInt`](/functions/cast/toint/) 不同——`int "011"` 得到 `9`，`int "0b11"` 得到 `3`。**实测**：`int "0b11"` → `3`、`int "0o11"` → `9`、`int "0x11"` → `17`，而 `float` 对同样这三个带进制前缀的字符串全部报错——字符串里带进制前缀时只有 [`cast.ToInt`](/functions/cast/toint/) 能解析。

## 完整示例：把字符串价格转成数字再计算

```go-html-template {file="layouts/_partials/total.html"}
{{ $a := "11.9" }}
{{ $b := 0x11 }}
<p>{{ float $a }} / {{ float $b }}</p>
<p>相加：{{ add (float "11") 0.5 }}</p>
<p>空字符串：{{ float "" }}，nil：{{ float nil }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>11.9 / 17</p>
<p>相加：11.5</p>
<p>空字符串：0，nil：0</p>
```

**你应当看到什么**：`"11.9"` 与 `0x11` 都变成了 `float64`；`add (float "11") 0.5` 得到 `11.5`，说明转换后的值真的能参与算术（直接 `add "11" 0.5` 会因类型不符而报错）。空字符串与 `nil` 都静默变成 `0`——**这是最危险的一条**：数据缺失时不会报错，只会得到 0，所以表单/配置场景要自己判空。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| 数字字面量、数字字符串（`11`、`"11"`、`"11.9"`） | 对应的 `float64` | 否 |
| `"011"` | `11`（字符串按十进制解析） | 否 |
| `""` | `0` | 否 |
| `nil` | `0` | 否 |
| 布尔 `true` / `false` | `1` / `0` | 否 |
| `"0b11"`、`"0o11"`、`"0x11"`（带进制前缀的**字符串**） | —— | 是：`error calling float: unable to cast "0b11" of type string to float64: strconv.ParseFloat: parsing "0b11": invalid syntax` |
| `"abc"`（无法解析的字符串） | —— | 是：`error calling float: unable to cast "abc" of type string to float64: strconv.ParseFloat: parsing "abc": invalid syntax` |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 价格字段缺失时算出 0 元，页面上却看不出来 | `float ""` 与 `float nil` 都返回 `0`，不报错 | 转换前用 `with` / `isset` 判空，或给默认值 `default 0` |
| 没报错但结果不对 | `float "011"` 得到 11，不是 9 | 字符串按十进制解析，前导零是八进制只对不加引号的数字字面量成立 | 如果是八进制字符串，自己按需处理；十进制场景先 [`strings.TrimLeft "0"`](/functions/strings/trimleft/) |
| 报错看不懂 | `unable to cast "abc" of type string to float64` | 传进来的字符串不是数字 | 检查上游数据源；确认这不是把空字符串以外的文本误当数字 |
| 报错看不懂 | `wrong type for value; expected float64; got string` | 忘了转换，直接把字符串传给了算术函数 | 在传入处套一层 [`cast.ToFloat`](/functions/cast/tofloat/) |

更多排查入口见[故障排查](/troubleshooting/)。
