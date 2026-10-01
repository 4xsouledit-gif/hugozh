+++
title = "inflect.Humanize"
linkTitle = "inflect.Humanize"
description = "返回输入的人性化形式，并大写首字母。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/inflect/humanize/"

[params.functions_and_methods]
signatures = ["inflect.Humanize INPUT"]
returnType = "string"
aliases = ["humanize"]
+++

```go-html-template
{{ humanize "my-first-post" }} → My first post
{{ humanize "myCamelPost" }} → My camel post
```

如果输入是整数或整数的字符串表示，humanize 会返回附加了正确序数词尾的数字。

```go-html-template
{{ humanize "52" }} → 52nd
{{ humanize 103 }} → 103rd
```
