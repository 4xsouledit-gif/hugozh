+++
title = "Position"
linkTitle = "Position"
description = "返回调用该短代码的文件名和位置。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/shortcode/position/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Position"]
returnType = "text.Position"
+++

`Position` 方法在报告错误时很有用。例如，如果你的短代码需要一个「greeting」参数：

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ $greeting := "" }}
{{ with .Get "greeting" }}
  {{ $greeting = . }}
{{ else }}
  {{ errorf "The %q shortcode requires a 'greeting' argument. See %s" .Name .Position }}
{{ end }}
```

在没有「greeting」参数时，Hugo 会抛出错误消息并让构建失败：

```text
ERROR The "myshortcode" shortcode requires a 'greeting' argument. See "/home/user/project/content/about.md:11:1"
```

> [!NOTE]
> 计算位置信息的开销可能较大。请只在报告错误时使用它。
