+++
title = "Parent"
linkTitle = "Parent"
description = "在嵌套短代码中返回父短代码的上下文。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/shortcode/parent/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Parent"]
returnType = "hugolib.ShortcodeWithPage"
+++

这对于从根级继承公共的短代码参数很有用。

在这个刻意构造的示例中，「greeting」短代码是父级，「now」短代码是子级。

```md {file="content/welcome.md"}
{{</* greeting dateFormat="Jan 2, 2006" */>}}
Welcome. Today is {{</* now */>}}.
{{</* /greeting */>}}
```

```go-html-template {file="layouts/_shortcodes/greeting.html"}
<div class="greeting">
  {{ .Inner | strings.TrimSpace | .Page.RenderString }}
</div>
```

```go-html-template {file="layouts/_shortcodes/now.html"}
{{- $dateFormat := "January 2, 2006 15:04:05" }}

{{- with .Params }}
  {{- with .dateFormat }}
    {{- $dateFormat = . }}
  {{- end }}
{{- else }}
  {{- with .Parent.Params }}
    {{- with .dateFormat }}
      {{- $dateFormat = . }}
    {{- end }}
  {{- end }}
{{- end }}

{{- now | time.Format $dateFormat -}}
```

「now」短代码按下面的顺序格式化当前时间：

1. 传给「now」短代码的 `dateFormat` 参数（如果存在）
1. 传给「greeting」短代码的 `dateFormat` 参数（如果存在）
1. 短代码顶部定义的默认布局字符串
