+++
title = "格式化输出函数"
linkTitle = "fmt"
description = "使用这些函数在模板中输出字符串，或向终端输出消息。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/fmt/"
+++

## 这一页解决什么问题

这一章收录两类函数：一类**返回字符串**，用来在模板里拼装内容（`print`、`printf`、`println`）；另一类**写构建日志**，用来在构建期报告问题（`warnf`、`warnidf`、`errorf`、`erroridf`）。上游这些页原来只有签名和一两行说明，本站为每页补上了「什么时候用 / 什么时候别用」「可直接粘贴的实测示例」与「返回值边界」。

## 读完本章你应该能够

- 分清三个返回字符串的函数：`print` 不加空格、`println` 加空格并补换行、`printf` 用格式动词控制输出；
- 分清四个日志函数的后果：`warnf`/`warnidf` **不影响构建**，`errorf`/`erroridf` **让构建失败**；带 `id` 的两个可以用 `ignoreLogs` 抑制；
- 知道格式动词与参数类型不符时**不会报错**，而是把 `%!d(string=abc)` 这样的文本直接写进产物（实测），并据此排查页面上的 `%!` 片段。

## 建议阅读顺序

1. **返回值函数**：[fmt.Print](/functions/fmt/print/)、[fmt.Println](/functions/fmt/println/)、[fmt.Printf](/functions/fmt/printf/)；
2. **日志函数**：[fmt.Warnf](/functions/fmt/warnf/)、[fmt.Warnidf](/functions/fmt/warnidf/)、[fmt.Errorf](/functions/fmt/errorf/)、[fmt.Erroridf](/functions/fmt/erroridf/)；
3. **深入格式动词**：Go 官方的 [`fmt` 包文档](https://pkg.go.dev/fmt)（上游在这些页面里给出的就是它的链接）。

如果你只关心一件事：**让构建失败用 `errorf`，只想提醒用 `warnf`，想让使用者能关掉就用带 `id` 的版本。**
