+++
title = "len"
linkTitle = "len"
description = "返回字符串、切片、映射或集合的长度。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/go-template/len/"

[params.functions_and_methods]
signatures = ["len VALUE"]
returnType = "int"
+++

## 用法

字符串：

```go-html-template
{{ "ab" | len }} → 2
{{ ""   | len }} → 0
```

切片：

```go-html-template
{{ slice "a" "b" | len }} → 2
{{ slice         | len }} → 0
```

映射：

```go-html-template
{{ dict "a" 1 "b" 2 | len }} → 2
{{ dict             | len }} → 0
```

集合：

```go-html-template
{{ site.RegularPages | len }} → 42
```

也可以用下面的写法统计集合中的页面数量：

```go-html-template
{{ site.RegularPages.Len }} → 42
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。
