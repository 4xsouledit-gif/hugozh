+++
title = "lang.FormatCurrency"
linkTitle = "FormatCurrency"
description = "返回数字的货币表示，货币与精度由参数指定，并按当前语言与地区进行本地化。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/lang/formatcurrency/"

[params.functions_and_methods]
signatures = ["lang.FormatCurrency PRECISION CURRENCY NUMBER"]
returnType = "string"
+++

## 这一页解决什么问题

显示价格、会费、预算这类金额时，除了数字本身，还要有**货币符号**，而且不同地区把它放的位置不同：英语是 `$512.50`，德语是 `512,50 $`。`lang.FormatCurrency` 接受精度、货币代码与数值，按站点当前的语言与地区拼出结果。

## 什么时候用，什么时候别用

**该用**：

- 多语言站点显示金额，希望符号、位置、小数分隔符都跟着地区走；
- 需要指定货币代码（`USD`、`CNY`、`NOK`…）而不是自己拼符号。

**别用**：

- 普通数字（不带货币）→ 用 [`lang.FormatNumber`](/functions/lang/formatnumber/)；
- 格式必须固定、不能随语言变化 → 用 [`lang.FormatNumberCustom`](/functions/lang/formatnumbercustom/) 自己拼货币代码；
- 会计记法 → 用 [`lang.FormatAccounting`](/functions/lang/formataccounting/)；注意**实测**在本页的输入下两者输出完全相同（见该页说明）。

## 用法

```go-html-template
{{ 512.5032 | lang.FormatCurrency 2 "USD" }} → $512.50
```

> [!NOTE]
> 日期、货币、数字与百分比的本地化由 [`bep/golocales`][] 包完成。Hugo 使用 [`locale`][] 配置项确定地区，未设置时回退到语言键本身。解析出的值必须是该包支持的地区。

[`bep/golocales`]: https://github.com/bep/golocales
[`locale`]: /configuration/all/#locale

## 完整示例（实测）

```go-html-template {file="layouts/_partials/price.html"}
[{{ 512.5032 | lang.FormatCurrency 2 "USD" }}]|[{{ 512.5032 | lang.FormatCurrency 2 "CNY" }}]
```

Hugo 0.167.0 实测输出，`locale = 'en-US'`（或 `'zh-CN'`）时：

```text
[$512.50]|[CN¥512.50]
```

`locale = 'de-DE'` 时，**同一段模板**输出：

```text
[512,50 $]|[512,50 CN¥]
```

**你应当看到什么**：货币符号从「前置」变成「后置」，小数分隔符从 `.` 变成 `,`——两处都是地区差异，与货币代码本身无关。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；只改 `locale`。

| 输入（精度 2） | `en-US` | `de-DE` | `zh-CN` |
| --- | --- | --- | --- |
| `512.5032` + `USD` | `$512.50` | `512,50 $` | `$512.50` |
| `512.5032` + `EUR` | `€512.50` | `512,50 €` | `€512.50` |
| `512.5032` + `CNY` | `CN¥512.50` | `512,50 CN¥` | `CN¥512.50` |
| `-1234.5` + `USD` | `$-1,234.50` | `-1.234,50 $` | —— |

返回类型是 `string`；不支持的地区如何回退，**上游未说明**。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 模板里写死了 `¥`，换成 `USD` 时还在显示人民币符号 | 货币符号由 `CURRENCY` 参数决定，不要自己拼 | 传货币代码（如 `"CNY"`、`"USD"`），符号由函数给出 |
| 没报错但结果不对 | 不同语言站点符号位置不同，被当成 bug | 这是地区差异（实测 `de-DE` 后置） | 接受差异，或改用 [`lang.FormatNumberCustom`](/functions/lang/formatnumbercustom/) 固定拼法 |
| 没报错但结果不对 | 中文站点输出与英文相同 | 实测 `zh-CN` 与 `en-US` 的表现一致 | 想验证本地化是否生效，用 `de-DE` 对照 |

更多排查入口见[故障排查](/troubleshooting/)。
