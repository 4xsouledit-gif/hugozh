+++
title = "Name"
linkTitle = "Name"
description = "返回短代码文件名，不含文件扩展名。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/shortcode/name/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Name"]
returnType = "string"
+++

`Name` 方法在报告错误时很有用。例如，如果你的短代码需要一个「greeting」参数：

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
