+++
title = "Name"
linkTitle = "Name"
description = "返回给定输出格式的标识符。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/output-format/name/"

[params.functions_and_methods]
signatures = ["OUTPUTFORMAT.Name"]
returnType = "string"
+++

要使用该方法，你必须先通过 [`Get`][] 或 [`Canonical`][] 方法，从页面的 [`OutputFormats`][] 集合中选出特定的 [output format](g)（输出格式）。

```go-html-template
{{ with .Site.Home.OutputFormats.Get "rss" }}
  {{ .Name }} → rss
{{ end }}
```

[`Canonical`]: /methods/page/outputformats/#canonical
[`Get`]: /methods/page/outputformats/#get
[`OutputFormats`]: /methods/page/outputformats/
