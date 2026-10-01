+++
title = "site"
linkTitle = "site"
description = "返回当前站点的 Site 对象，在任何上下文中都可访问。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/global/site/"

[params.functions_and_methods]
signatures = ["site"]
returnType = "page.siteWrapper"
+++

用 `site` 函数可以不受当前上下文影响地返回 `Site` 对象。

```go-html-template
{{ site.Params.foo }}
```

当上下文里有 `Site` 对象时，你可以使用 `Site` 属性：

```go-html-template
<!-- current context -->
{{ .Site.Params.foo }}
<!-- template context -->
{{ $.Site.Params.foo }}
```

> [!NOTE]
> 为了简化模板，无论上下文里有没有 `Site` 对象，都请使用全局 `site` 函数。
