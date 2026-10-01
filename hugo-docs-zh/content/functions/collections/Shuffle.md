+++
title = "collections.Shuffle"
linkTitle = "shuffle"
description = "把给定切片中的元素顺序随机打乱后返回。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/functions/collections/shuffle/"

[params.functions_and_methods]
signatures = ["collections.Shuffle SLICE"]
returnType = "[]any"
aliases = ["shuffle"]
+++

```go-html-template
{{ collections.Shuffle (slice "a" "b" "c") }} → [b a c]
```

结果每次构建都会不同。

要从页面集合中渲染 5 个随机页面的无序列表：

```go-html-template
<ul>
  {{ $p := site.RegularPages }}
  {{ range $p | collections.Shuffle | first 5 }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

（0.149.0 新增）

用 [`collections.D`][] 函数完成同样的任务会快得多。

[`collections.D`]: /functions/collections/d/
