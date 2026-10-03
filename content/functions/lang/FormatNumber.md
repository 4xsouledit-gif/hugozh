+++
title = "lang.FormatNumber"
linkTitle = "FormatNumber"
description = "返回数字按给定精度、面向当前语言与地区进行本地化后的数字表示。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/lang/formatnumber/"

[params.functions_and_methods]
signatures = ["lang.FormatNumber PRECISION NUMBER"]
returnType = "string"
+++

## 这一页解决什么问题

页面上要显示带千分位和小数位的数字（阅读量、金额数量、统计数字），而且**不同语言站点要显示成各自习惯的样子**：英语用 `1,234,567.89`，德语用 `1.234.567,89`——同一个数字，小数点与分组符正好相反。`lang.FormatNumber` 按站点当前的语言与地区自动选择，不用为每种语言写一套模板。

## 什么时候用，什么时候别用

**该用**：

- 多语言站点里显示数字，希望跟随语言/地区习惯；
- 需要固定小数位（精度参数直接指定）。

**别用**：

- 需要**固定不变**的格式（不随语言变化，例如机器可读的导出）→ 用 [`lang.FormatNumberCustom`](/functions/lang/formatnumbercustom/)：实测它不受 `locale` 影响；
- 货币 → 用 [`lang.FormatCurrency`](/functions/lang/formatcurrency/)；百分比 → 用 [`lang.FormatPercent`](/functions/lang/formatpercent/)；会计记法 → 用 [`lang.FormatAccounting`](/functions/lang/formataccounting/)；
- 只想简单拼数字、不要分组 → 用 [`fmt.Printf`](/functions/fmt/printf/) 的 `%.2f`。

## 用法

```go-html-template
{{ 512.5032 | lang.FormatNumber 2 }} → 512.50
```

> [!NOTE]
> 日期、货币、数字与百分比的本地化由 [`bep/golocales`][] 包完成。Hugo 使用 [`locale`][] 配置项确定地区，未设置时回退到语言键本身。解析出的值必须是该包支持的地区。

[`bep/golocales`]: https://github.com/bep/golocales
[`locale`]: /configuration/all/#locale

## 完整示例（实测）

```go-html-template {file="layouts/_partials/stats.html"}
[{{ 512.5032 | lang.FormatNumber 2 }}]|[{{ 1234567.891 | lang.FormatNumber 2 }}]
```

Hugo 0.167.0 实测输出，`locale = 'en-US'` 时：

```text
[512.50]|[1,234,567.89]
```

`locale = 'de-DE'` 时，**同一段模板**输出：

```text
[512,50]|[1.234.567,89]
```

**你应当看到什么**：数字本身没变，只是**小数点与分组符互换了**，精度都保持两位。`locale = 'zh-CN'` 实测与 `en-US` 相同（`512.50` / `1,234,567.89`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；只改 `locale`。

| 输入 | `en-US` | `de-DE` | `zh-CN` |
| --- | --- | --- | --- |
| `512.5032`，精度 2 | `512.50` | `512,50` | `512.50` |
| `1234567.891`，精度 2 | `1,234,567.89` | `1.234.567,89` | `1,234,567.89` |
| 是否报错 | 否 | 否 | 否 |
| 返回类型 | `string` | `string` | `string` |

精度参数决定小数位数（`512.5032` 精度 2 → 四舍五入到两位）。本函数对无法识别的地区会回退，但具体回退目标**上游未说明**。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修复 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 不同语言站点显示格式不同，被当成 bug | 这正是本函数的用途：格式跟随 `locale` | 需要统一格式就用 [`lang.FormatNumberCustom`](/functions/lang/formatnumbercustom/) |
| 没报错但结果不对 | 数字与预期不符（多/少千分位） | 精度参数只控制**小数位**，分组按地区规则 | 对照本页实测表确认目标地区的写法 |
| 没报错但结果不对 | 中英文站点格式一样，以为没生效 | 实测 `zh-CN` 与 `en-US` 的输出相同 | 用 `de-DE` 之类差异明显的地区验证是否生效 |

更多排查入口见[故障排查](/troubleshooting/)。
