+++
title = "BaseURL"
linkTitle = "BaseURL"
description = "返回项目配置中定义的 base URL。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/site/baseurl/"

[params.functions_and_methods]
signatures = ["SITE.BaseURL"]
returnType = "string"
+++

项目配置：

```toml
baseURL = 'https://example.org/docs/'
```

模板：

```go-html-template
{{ .Site.BaseURL }} → https://example.org/docs/
```

> [!NOTE]
> 在模板中几乎从来没有正当理由使用这个方法。由于配置错误，它的用法往往很脆弱。
>
> 请改用 [`absURL`][]、[`absLangURL`][]、[`relURL`][] 或 [`relLangURL`][] 函数。

[`absLangURL`]: /functions/urls/abslangurl/
[`absURL`]: /functions/urls/absurl/
[`relLangURL`]: /functions/urls/rellangurl/
[`relURL`]: /functions/urls/relurl/
