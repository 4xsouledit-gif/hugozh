+++
title = "Params"
linkTitle = "Params"
description = "返回给定页面前置元数据中定义的自定义参数映射。"
date = 2026-10-02
weight = 520
source = "https://gohugo.io/methods/page/params/"

[params.functions_and_methods]
signatures = ["PAGE.Params"]
returnType = "maps.Params"
+++

举例来说，考虑下面这段前置元数据：

```toml
title = 'Annual conference'
date = 2023-10-17T15:11:37-07:00
[params]
display_related = true
key-with-hyphens = 'must use index function'
[params.author]
  email = 'jsmith@example.org'
  name = 'John Smith'
```

`title` 和 `date` 是标准的[前置元数据字段][]，其余字段则由用户自定义。

需要时，可以通过[链式](g)书写[标识符](g)来访问这些自定义字段：

```go-html-template
{{ .Params.display_related }} → true
{{ .Params.author.email }} → jsmith@example.org
{{ .Params.author.name }} → John Smith
```

在上面的模板示例中，每个 key 都是合法的标识符。例如，没有一个 key 含连字符。要访问不是合法标识符的 key，请使用 [`index`][] 函数：

```go-html-template
{{ index .Params "key-with-hyphens" }} → must use index function
```

[`index`]: /functions/collections/indexfunction/
[front matter fields]: /content-management/front-matter/#fields
