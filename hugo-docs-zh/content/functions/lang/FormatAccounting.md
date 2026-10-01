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

```go-html-template
{{ 512.5032 | lang.FormatAccounting 2 "NOK" }} → NOK512.50
```

> [!NOTE]
> 日期、货币、数字与百分比的本地化由 [`bep/golocales`][] 包完成。Hugo 使用 [`locale`][] 配置项确定地区，未设置时回退到语言键本身。解析出的值必须是该包支持的地区。

[`bep/golocales`]: https://github.com/bep/golocales
[`locale`]: /configuration/all/#locale
