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
