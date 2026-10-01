+++
title = "Params"
linkTitle = "Params"
description = "返回短代码参数的集合。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/shortcode/params/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Params"]
returnType = "any"
+++

用位置参数调用短代码时，`Params` 方法返回一个切片。

```md {file="content/about.md"}
{{</* myshortcode "Hello" "world" */>}}
```

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ index .Params 0 }} → Hello
{{ index .Params 1 }} → world
```

用命名参数调用短代码时，`Params` 方法返回一个映射。

```md {file="content/about.md"}
{{</* myshortcode greeting="Hello" name="world" */>}}
```

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ .Params.greeting }} → Hello
{{ .Params.name }} → world
```
