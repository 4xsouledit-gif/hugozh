+++
title = "collections.Querify"
linkTitle = "querify"
description = "根据给定的映射、切片或键值对序列，返回 URL 查询字符串。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/functions/collections/querify/"

[params.functions_and_methods]
signatures = ["collections.Querify MAP|SLICE|KEY VALUE..."]
returnType = "string"
aliases = ["querify"]
+++

把键值对指定为映射、切片，或者一串标量值。例如下面几种写法等价：

```go-html-template
{{ collections.Querify (dict "a" 1 "b" 2) }}
{{ collections.Querify (slice "a" 1 "b" 2) }}
{{ collections.Querify "a" 1 "b" 2 }}
```

要在 URL 后追加查询字符串：

```go-html-template
{{ $qs := collections.Querify (dict "a" 1 "b" 2) }}
{{ $href := printf "https://example.org?%s" $qs }}

<a href="{{ $href }}">Link</a>
```

Hugo 会把它渲染成：

```html
<a href="https://example.org?a=1&amp;b=2">Link</a>
```

你也可以传入项目配置或前置元数据中的映射。例如：

```toml
title = 'Example'
[params.query]
a = 1
b = 2
```

```go-html-template
{{ collections.Querify .Params.query }}
```
