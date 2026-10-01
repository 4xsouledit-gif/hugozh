+++
title = "Rel"
linkTitle = "Rel"
description = "返回给定输出格式的 rel 值，可以是默认值，也可以是项目配置中定义的值。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/output-format/rel/"

[params.functions_and_methods]
signatures = ["OUTPUTFORMAT.Rel"]
returnType = "string"
+++

要使用该方法，你必须先通过 [`Get`][] 或 [`Canonical`][] 方法，从页面的 [`OutputFormats`][] 集合中选出特定的 [output format](g)（输出格式）。

```go-html-template
{{ with .Site.Home.OutputFormats.Get "rss" }}
  {{ .Rel }} → alternate
{{ end }}
```

[`Canonical`]: /methods/page/outputformats/#canonical
[`Get`]: /methods/page/outputformats/#get
[`OutputFormats`]: /methods/page/outputformats/
