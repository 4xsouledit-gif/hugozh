+++
title = "lang.FormatAccounting"
linkTitle = "FormatAccounting"
description = "以会计记法返回数字的货币表示，货币与精度由参数指定，并按当前语言与地区进行本地化。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/lang/formataccounting/"

[params.functions_and_methods]
signatures = ["lang.FormatAccounting PRECISION CURRENCY NUMBER"]
returnType = "string"
+++

## 这一页解决什么问题

上游把它描述为「会计记法」的货币表示：与 [`lang.FormatCurrency`](/functions/lang/formatcurrency/) 同类，同样接受精度、货币代码与数值，并按站点的语言与地区本地化。需要按会计惯例（而不是普通货币写法）展示金额时用它。

## 什么时候用，什么时候别用

**该用**：

- 报表、账单一类需要会计记法的场景；
- 与 [`lang.FormatCurrency`](/functions/lang/formatcurrency/) 对照后，确实需要它的写法。

**别用**：

- 普通的价格、费用展示 → 用 [`lang.FormatCurrency`](/functions/lang/formatcurrency/)：语义更直白；
- 不需要货币符号的纯数字 → 用 [`lang.FormatNumber`](/functions/lang/formatnumber/)。

> [!NOTE]
> **实测提醒**：在 Hugo 0.167.0 上，用本页测试的输入（`512.5032`、`±1234.5`，货币 `USD`/`NOK`，`en-US` 与 `de-DE`）逐一对比，`FormatAccounting` 与 [`FormatCurrency`](/functions/lang/formatcurrency/) 的输出**完全相同**（例如都是 `NOK512.50` / `512,50 kr`，负数都是 `$-1,234.50` / `-1.234,50 $`）。上游没有说明两者在什么输入下会分化，因此**不要凭想象认为它一定会加括号**。

## 用法

```go-html-template
{{ 512.5032 | lang.FormatAccounting 2 "NOK" }} → NOK512.50
```

> [!NOTE]
> 日期、货币、数字与百分比的本地化由 [`bep/golocales`][] 包完成。Hugo 使用 [`locale`][] 配置项确定地区，未设置时回退到语言键本身。解析出的值必须是该包支持的地区。

[`bep/golocales`]: https://github.com/bep/golocales
[`locale`]: /configuration/all/#locale

## 完整示例（实测）

```go-html-template {file="layouts/_partials/accounting.html"}
[{{ 512.5032 | lang.FormatAccounting 2 "NOK" }}]|[{{ -1234.5 | lang.FormatAccounting 2 "USD" }}]|[{{ -1234.5 | lang.FormatCurrency 2 "USD" }}]
```

Hugo 0.167.0 实测输出，`locale = 'en-US'` 时：

```text
[NOK512.50]|[$-1,234.50]|[$-1,234.50]
```

`locale = 'de-DE'` 时：

```text
[512,50 kr]|[-1.234,50 $]|[-1.234,50 $]
```

**你应当看到什么**：第三项与第二项**完全相同**——在本例中两个函数没有区别；而第一项显示 `NOK` 在 `en-US` 下是前置代码、在 `de-DE` 下被本地化成了符号 `kr`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；`locale` 分别取 `en-US` 与 `de-DE`。

| 输入（精度 2） | `en-US` | `de-DE` |
| --- | --- | --- |
| `512.5032` + `NOK` | `NOK512.50` | `512,50 kr` |
| `-1234.5` + `USD` | `$-1,234.50` | `-1.234,50 $` |
| `1234.5` + `USD` | `$1,234.50` | `1.234,50 $` |
| 返回类型 | `string` | `string` |
| 是否报错 | 否 | 否 |

同一输入下与 [`lang.FormatCurrency`](/functions/lang/formatcurrency/) 的输出对比：**实测全部相同**（含负数的 `USD`/`NOK` 两组）。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 期望负数被括号包起来，结果只是负号 | 上游只说「会计记法」，未给出与 `FormatCurrency` 的差异；实测本例两者相同 | 需要特定写法就自己在模板里拼；不要假设括号行为 |
| 没报错但结果不对 | 两个函数结果一样，怀疑用错了 | 实测在常见输入下确实相同 | 普通金额直接用 [`lang.FormatCurrency`](/functions/lang/formatcurrency/)，语义更清楚 |
| 没报错但结果不对 | 货币符号被本地化成了 `kr` | `de-DE` 地区会这样显示 `NOK` | 属地区行为；要固定显示代码就用 [`lang.FormatNumberCustom`](/functions/lang/formatnumbercustom/) 自行拼接 |

更多排查入口见[故障排查](/troubleshooting/)。
