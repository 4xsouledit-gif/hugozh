+++
title = "RelPermalink"
linkTitle = "RelPermalink"
description = "返回当前输出格式所生成页面的相对永久链接。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/output-format/relpermalink/"

[params.functions_and_methods]
signatures = ["OUTPUTFORMAT.RelPermalink"]
returnType = "string"
+++

要使用该方法，你必须先通过 [`Get`][] 或 [`Canonical`][] 方法，从页面的 [`OutputFormats`][] 集合中选出特定的 [output format](g)（输出格式）。

```go-html-template
{{ with .Site.Home.OutputFormats.Get "rss" }}
  {{ .RelPermalink }} → /index.xml
{{ end }}
```

[`Canonical`]: /methods/page/outputformats/#canonical
[`Get`]: /methods/page/outputformats/#get
[`OutputFormats`]: /methods/page/outputformats/
