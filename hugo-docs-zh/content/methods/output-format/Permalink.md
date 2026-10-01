+++
title = "Permalink"
linkTitle = "Permalink"
description = "返回当前输出格式所生成页面的永久链接。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/output-format/permalink/"

[params.functions_and_methods]
signatures = ["OUTPUTFORMAT.Permalink"]
returnType = "string"
+++

要使用该方法，你必须先通过 [`Get`][] 或 [`Canonical`][] 方法，从页面的 [`OutputFormats`][] 集合中选出特定的 [output format](g)（输出格式）。

```go-html-template
{{ with .Site.Home.OutputFormats.Get "rss" }}
  {{ .Permalink }} → https://example.org/index.xml
{{ end }}
```

[`Canonical`]: /methods/page/outputformats/#canonical
[`Get`]: /methods/page/outputformats/#get
[`OutputFormats`]: /methods/page/outputformats/
