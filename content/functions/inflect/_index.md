+++
title = "词形变化函数"
linkTitle = "inflect"
description = "英语名词的单复数与大小写形态转换：Humanize、Pluralize、Singularize。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/inflect/"

[params.teach]
difficulty = "参考"
time = "按需查阅"
prereq = [
  "会写基本 Go 模板。",
]
outcomes = [
  "用 `inflect.Pluralize` / `inflect.Singularize` 根据数量决定名词形态，而不是写死「个」或「s」；",
  "用 `inflect.Humanize` 把 `snake_case`、`camelCase` 一类标识符变成可读文字；",
  "知道这套规则是**英语**的，中文场景通常用不上。",
]
next = ["/functions/strings/title/", "/functions/inflect/humanize/"]
+++

## 这一组包含什么

| 函数 | 用途 |
| --- | --- |
| [`Humanize`](/functions/inflect/humanize/) | 把标识符转成人类可读形式（`my_key` → `My key`） |
| [`Pluralize`](/functions/inflect/pluralize/) | 按数量返回单数或复数形式 |
| [`Singularize`](/functions/inflect/singularize/) | 把复数转回单数 |

## 什么时候用、什么时候别用

- **用**：站点是**英文**（或其它按词形变化表数的语言），要显示「1 post / 3 posts」这类文案；
- **别用**：中文站点——中文名词不随数量变形，直接写「3 篇文章」即可，套用本组只会得到奇怪结果；
- **注意**：词形规则是内置的英语规则，**不规则名词可能不符合你的预期**（例如专有名词）。显示给读者的文案建议实测一遍再定。

下方列出本站收录的本组全部函数。
