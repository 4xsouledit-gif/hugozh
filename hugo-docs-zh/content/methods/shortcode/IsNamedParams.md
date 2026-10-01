+++
title = "IsNamedParams"
linkTitle = "IsNamedParams"
description = "报告短代码调用是否使用命名参数。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/shortcode/isnamedparams/"

[params.functions_and_methods]
signatures = ["SHORTCODE.IsNamedParams"]
returnType = "bool"
+++

要让短代码调用同时支持位置参数和命名参数，可以用 `IsNamedParams` 方法判断短代码是以哪种方式调用的。

使用这个_短代码_模板：

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ if .IsNamedParams }}
  {{ printf "%s %s." (.Get "greeting") (.Get "firstName") }}
{{ else }}
  {{ printf "%s %s." (.Get 0) (.Get 1) }}
{{ end }}
```

下面两个调用返回相同的值：

```md {file="content/about.md"}
{{</* myshortcode greeting="Hello" firstName="world" */>}}
{{</* myshortcode "Hello" "world" */>}}
```
