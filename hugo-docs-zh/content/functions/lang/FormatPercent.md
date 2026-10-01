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

```go-html-template
{{ 512.5032 | lang.FormatPercent 2 }} → 512.50%
```

> [!NOTE]
> 日期、货币、数字与百分比的本地化由 [`bep/golocales`][] 包完成。Hugo 使用 [`locale`][] 配置项确定地区，未设置时回退到语言键本身。解析出的值必须是该包支持的地区。

[`bep/golocales`]: https://github.com/bep/golocales
[`locale`]: /configuration/all/#locale
