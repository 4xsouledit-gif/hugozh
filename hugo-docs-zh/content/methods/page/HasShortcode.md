+++
title = "HasShortcode"
linkTitle = "HasShortcode"
description = "报告给定页面是否调用了指定的短代码。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/methods/page/hasshortcode/"

[params.functions_and_methods]
signatures = ["PAGE.HasShortcode NAME"]
returnType = "bool"
+++

举个例子，我们用 [Plotly][] 渲染一张图表：

```md {file="content/example.md"}
{{</* plotly */>}}
{
  "data": [
    {
      "x": ["giraffes", "orangutans", "monkeys"],
      "y": [20, 14, 23],
      "type": "bar"
    }
  ],
}
{{</* /plotly */>}}
```

这个短代码很简单：

```go-html-template {file="layouts/_shortcodes/plotly.html"}
{{ $id := printf "plotly-%02d" .Ordinal }}
<div id="{{ $id }}"></div>
<script>
  Plotly.newPlot(document.getElementById({{ $id }}), {{ .Inner | safeJS }});
</script>
```

现在我们可以只在调用 `plotly` 短代码的页面上按需加载所需的 JavaScript：

```go-html-template {file="layouts/baseof.html"}
<head>
  {{ if .HasShortcode "plotly" }}
    <script src="https://cdn.plot.ly/plotly-2.28.0.min.js"></script>
  {{ end }}
</head>
```

[Plotly]: https://plotly.com/javascript/
