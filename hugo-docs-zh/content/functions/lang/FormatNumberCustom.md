+++
title = "lang.FormatNumberCustom"
linkTitle = "FormatNumberCustom"
description = "使用负数、小数点与分组选项，返回数字按给定精度的数字表示。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/lang/formatnumbercustom/"

[params.functions_and_methods]
signatures = ["lang.FormatNumberCustom PRECISION NUMBER [OPTIONS...]"]
returnType = "string"
+++

## 这一页解决什么问题

需要一个**完全由自己指定**的数字格式：小数点用 `.`、分组用 `,`，不管站点是什么语言。与 [`lang.FormatNumber`](/functions/lang/formatnumber/) 相反，本函数**不看语言与地区**（实测三种 `locale` 输出完全一致），适合生成导出文件、代码片段或需要跨语言一致的数值展示。

## 什么时候用，什么时候别用

**该用**：

- 格式必须固定（CSV、JSON、代码示例）；
- 需要用非标准的负号、小数点、分组符，甚至用竖线之类的替代定界字符。

**别用**：

- 希望跟随站点语言自动适配 → 用 [`lang.FormatNumber`](/functions/lang/formatnumber/)；
- 货币、百分比 → 用 [`lang.FormatCurrency`](/functions/lang/formatcurrency/)、[`lang.FormatPercent`](/functions/lang/formatpercent/)。

## 用法

该函数按给定精度格式化数字。第一个选项参数是一个以空格分隔的字符串，其中的字符分别表示负号、小数点与分组分隔符，默认值为 `- . ,`。第二个选项参数用于指定替代的定界字符。

注意，数字在 5 及以上时进位。因此精度设为 0 时，1.5 变为 2，而 1.4 变为&nbsp;1。

如需一个自动适配当前语言的更简单的函数，请参见 [`lang.FormatNumber`][]。

```go-html-template
{{ lang.FormatNumberCustom 2 12345.6789 }} → 12,345.68
{{ lang.FormatNumberCustom 2 12345.6789 "- , ." }} → 12.345,68
{{ lang.FormatNumberCustom 6 -12345.6789 "- ." }} → -12345.678900
{{ lang.FormatNumberCustom 0 -12345.6789 "- . ," }} → -12,346
{{ lang.FormatNumberCustom 0 -12345.6789 "-|.| " "|" }} → -12 346
```

> [!NOTE]
> 日期、货币、数字与百分比的本地化由 [`bep/golocales`][] 包完成。Hugo 使用 [`locale`][] 配置项确定地区，未设置时回退到语言键本身。解析出的值必须是该包支持的地区。

[`lang.FormatNumber`]: /functions/lang/formatnumber/
[`bep/golocales`]: https://github.com/bep/golocales
[`locale`]: /configuration/all/#locale

## 完整示例（实测）

```go-html-template {file="layouts/_partials/fixed-number.html"}
[{{ lang.FormatNumberCustom 2 12345.6789 }}]|[{{ lang.FormatNumberCustom 2 12345.6789 "- , ." }}]|[{{ lang.FormatNumberCustom 0 1.5 }}]|[{{ lang.FormatNumberCustom 0 1.4 }}]
```

Hugo 0.167.0 实测输出：

```text
[12,345.68]|[12.345,68]|[2]|[1]
```

**你应当看到什么**：默认选项下是 `12,345.68`；把选项换成 `"- , ."` 后小数点与分组符互换，得 `12.345,68`；最后两项演示「5 及以上进位」——`1.5` 变 `2`，`1.4` 变 `1`。这段模板在 `en-US`、`de-DE`、`zh-CN` 三种 `locale` 下**输出完全相同**（实测）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；分别在 `locale` 为 `en-US`、`de-DE`、`zh-CN` 的站点各跑一遍，结果一致。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `2 12345.6789`（默认选项 `- . ,`） | `12,345.68` | 否 |
| `2 12345.6789 "- , ."` | `12.345,68`（小数点与分组符互换） | 否 |
| `6 -12345.6789 "- ."` | `-12345.678900`（未指定分组符 → 不分组） | 否 |
| `0 -12345.6789 "- . ,"` | `-12,346`（精度 0 且四舍五入） | 否 |
| `0 -12345.6789 "-|.| " "|"` | `-12 346`（用 `|` 作替代定界字符） | 否 |
| `2 12345.6789 "- ,"` | `12345,68`（只给两个选项字符 → 无分组） | 否 |
| 0 与 1 的舍入（`1.5` / `1.4`） | `2` / `1` | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 分组符没生效 | 选项字符串只写了负号与小数点（如 `"- ,"`），没有分组符 | 补齐三个字符，或用默认值 `- . ,` |
| 没报错但结果不对 | 中文站点与英文站点显示一样，以为函数失效 | 本函数**不读** `locale`（实测一致），格式完全由选项决定 | 需要跟随语言就用 [`lang.FormatNumber`](/functions/lang/formatnumber/) |
| 没报错但结果不对 | 小数被「截断」而不是进位 | 记错了舍入规则 | 实测是 5 及以上进位（`1.5` → `2`，`1.4` → `1`） |
| 没报错但结果不对 | 传了非数字的值 | 参数是 NUMBER，类型不符时按 Go 的通用规则处理 | 先用 `float` 或 `int` 明确类型 |

更多排查入口见[故障排查](/troubleshooting/)。
