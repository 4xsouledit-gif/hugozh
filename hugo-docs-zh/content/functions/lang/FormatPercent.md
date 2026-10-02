+++
title = "lang.FormatPercent"
linkTitle = "FormatPercent"
description = "返回数字按给定精度、面向当前语言与地区进行本地化后的百分比表示。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/lang/formatpercent/"

[params.functions_and_methods]
signatures = ["lang.FormatPercent PRECISION NUMBER"]
returnType = "string"
+++

## 这一页解决什么问题

显示占比、增长率这类百分比数值，并让它符合站点语言的书写习惯：英语紧贴数字（`512.50%`），德语会留一个空格（`512,50 %`），小数分隔符也跟着地区变。

## 什么时候用，什么时候别用

**该用**：

- 已经持有「百分比数值」并要显示出来；
- 需要按语言/地区调整分隔符与百分号位置。

**别用**：

- 手上是 0 到 1 的比例、想显示成百分数 → 本函数**不会乘以 100**（实测 `512.5032` 得 `512.50%`），要自己先乘；
- 普通数字 → 用 [`lang.FormatNumber`](/functions/lang/formatnumber/)；货币 → 用 [`lang.FormatCurrency`](/functions/lang/formatcurrency/)。

## 用法

```go-html-template
{{ 512.5032 | lang.FormatPercent 2 }} → 512.50%
```

> [!NOTE]
> 日期、货币、数字与百分比的本地化由 [`bep/golocales`][] 包完成。Hugo 使用 [`locale`][] 配置项确定地区，未设置时回退到语言键本身。解析出的值必须是该包支持的地区。

[`bep/golocales`]: https://github.com/bep/golocales
[`locale`]: /configuration/all/#locale

## 完整示例（实测）

```go-html-template {file="layouts/_partials/percent.html"}
[{{ 512.5032 | lang.FormatPercent 2 }}]
```

Hugo 0.167.0 实测输出，`locale = 'en-US'`（或 `'zh-CN'`）时：

```text
[512.50%]
```

`locale = 'de-DE'` 时，**同一段模板**输出：

```text
[512,50 %]
```

**你应当看到什么**：百分号前多了一个空格，小数点变成逗号——`512.5032` 没有被乘成 `51250.32`，说明本函数只负责**排版**，不负责换算。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；只改 `locale`。

| 输入 | `en-US` | `de-DE` | `zh-CN` |
| --- | --- | --- | --- |
| `512.5032`，精度 2 | `512.50%` | `512,50 %` | `512.50%` |
| `0.5`，精度 2 | `0.50%`——**不是** `50%` | —— | —— |
| `0.5`，精度 0 | `1%`（四舍五入到整数） | —— | —— |
| `mul 0.75 100`，精度 0 | `75%`（要显示成百分比就得自己先乘 100） | —— | —— |
| 是否报错 | 否 | 否 | 否 |
| 返回类型 | `string` | `string` | `string` |

> [!WARNING]
> 上游示例只用 `512.5032` 演示了排版效果。**实测本函数不把 0.5 变成 50%**；如果读者期望的是「比例转百分数」，请在模板里先乘 100 再格式化。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 0.75 显示成 `0.75%` 而不是 `75%` | 本函数不做 ×100 的换算（实测） | 先乘 100：`{{ mul 0.75 100 \| lang.FormatPercent 0 }}` |
| 没报错但结果不对 | 德语站点百分号前多出空格 | 这是地区排版习惯（实测 `512,50 %`） | 属预期行为；需要紧凑写法就自己拼字符串 |
| 没报错但结果不对 | 中文站点与英文一样 | 实测 `zh-CN` 与 `en-US` 输出相同 | 用 `de-DE` 验证本地化是否生效 |

更多排查入口见[故障排查](/troubleshooting/)。
