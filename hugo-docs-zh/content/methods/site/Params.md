+++
title = "Params"
linkTitle = "Params"
description = "返回项目配置中定义的自定义参数映射。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/methods/site/params/"

[params.functions_and_methods]
signatures = ["SITE.Params"]
returnType = "maps.Params"
+++

项目配置如下：

```toml
[params]
  subtitle = 'The Best Widgets on Earth'
  copyright-year = '2023'
  [params.author]
    email = 'jsmith@example.org'
    name = 'John Smith'
  [params.layouts]
    rfc_1123 = 'Mon, 02 Jan 2006 15:04:05 MST'
    rfc_3339 = '2006-01-02T15:04:05-07:00'
```

通过[链式](g)调用[标识符](g)来访问自定义参数：

```go-html-template
{{ .Site.Params.subtitle }} → The Best Widgets on Earth
{{ .Site.Params.author.name }} → John Smith

{{ $layout := .Site.Params.layouts.rfc_1123 }}
{{ .Site.Lastmod.Format $layout }} → Tue, 17 Oct 2023 13:21:02 PDT
```

在上面这个模板示例中，每个键都是合法的标识符，例如没有哪个键包含连字符。要访问不是合法标识符的键，请使用 [`index`][] 函数：

```go-html-template
{{ index .Site.Params "copyright-year" }} → 2023
```

[`index`]: /functions/collections/indexfunction/
