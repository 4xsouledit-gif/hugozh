+++
title = "语言函数"
linkTitle = "lang"
description = "使用这些函数让站点满足语言与地区方面的要求。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/functions/lang/"
+++

## 这一页解决什么问题

这一章收录两类函数：一类按**当前语言与地区**格式化数字（`FormatNumber`、`FormatCurrency`、`FormatPercent`、`FormatAccounting`，以及不受地区影响的 `FormatNumberCustom`）；另一类服务于**多语言内容**（`Translate` 取翻译表中的文案、`Merge` 用其它语言补齐缺失译文）。上游这些页原来只有签名和几行说明，本站为每页补上了「什么时候用 / 什么时候别用」「可直接粘贴的实测示例」与「返回值边界」。

## 读完本章你应该能够

- 分清「跟随地区」与「固定格式」：[`lang.FormatNumber`](/functions/lang/formatnumber/) 等会随 `locale` 变化（实测 `512.5032` 在 `en-US` 下是 `512.50`、在 `de-DE` 下是 `512,50`），而 [`lang.FormatNumberCustom`](/functions/lang/formatnumbercustom/) 完全无视 `locale`；
- 知道 [`lang.FormatPercent`](/functions/lang/formatpercent/) **不会**把 `0.5` 变成 `50%`——输入多少就显示多少；
- 会用 [`lang.Translate`](/functions/lang/translate/) 的复数形式与 `count` 上下文，并知道缺失 key 会**静默返回空字符串**、找不到译文时会**回退到默认语言**（实测）；
- 知道 [`lang.Merge`](/functions/lang/merge/) 只支持页面集合，用在 `dict` 上会让构建失败（实测报错 `language merge not supported for map[string]interface {}`）。

## 建议阅读顺序

1. **数字本地化**：[lang.FormatNumber](/functions/lang/formatnumber/)、[lang.FormatCurrency](/functions/lang/formatcurrency/)、[lang.FormatPercent](/functions/lang/formatpercent/)、[lang.FormatAccounting](/functions/lang/formataccounting/)；
2. **固定格式**：[lang.FormatNumberCustom](/functions/lang/formatnumbercustom/)；
3. **多语言内容**：[lang.Translate](/functions/lang/translate/)（含复数与翻译表查找规则）、[lang.Merge](/functions/lang/merge/)。

这些函数的实测结果都依赖站点的 `locale`（或语言配置），看任何一页的示例时请先注意它的**测量条件**。
