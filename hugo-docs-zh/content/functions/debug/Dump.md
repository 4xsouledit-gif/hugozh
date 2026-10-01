+++
title = "debug.Dump"
linkTitle = "debug.Dump"
description = "以字符串形式返回对象转储。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/debug/dump/"

[params.functions_and_methods]
signatures = ["debug.Dump VALUE"]
returnType = "string"
+++

```go-html-template
<pre>{{ debug.Dump hugo.Data.books }}</pre>
```

```json
[
  {
    "author": "Victor Hugo",
    "rating": 4,
    "title": "The Hunchback of Notre Dame"
  },
  {
    "author": "Victor Hugo",
    "rating": 5,
    "title": "Les Misérables"
  }
]
```

> [!NOTE]
> 该函数的输出可能随版本变化。仅用于调试。
