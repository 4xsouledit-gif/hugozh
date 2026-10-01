+++
title = "collections.KeyVals"
linkTitle = "keyVals"
description = "把给定的 key 与一组值配对，返回一个 KeyVals 结构。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/collections/keyvals/"

[params.functions_and_methods]
signatures = ["collections.KeyVals KEY VALUE..."]
returnType = "types.KeyValues"
aliases = ["keyVals"]
+++

该函数的主要用途，是为传给 `Pages` 对象上 [`Related`][] 方法的 options 映射定义 `namedSlices` 值。

参见[相关内容][related content]。

```go-html-template
{{ $kv := keyVals "foo" "a" "b" "c" }}
```

得到的数据结构为：

```json
{
  "Key": "foo",
  "Values": [
    "a",
    "b",
    "c"
  ]
}
```

要取出 key 和 values：

```go-html-template
{{ $kv.Key }} → foo
{{ $kv.Values }} → [a b c]
```

[`Related`]: /methods/pages/related/
[related content]: /content-management/related-content/
