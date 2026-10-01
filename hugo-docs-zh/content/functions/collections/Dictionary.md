+++
title = "collections.Dictionary"
linkTitle = "dict"
description = "根据给定的键值对创建一个映射（map）。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/collections/dictionary/"

[params.functions_and_methods]
signatures = ["collections.Dictionary [VALUE...]"]
returnType = "map[string]any"
aliases = ["dict"]
+++

把键值对作为一个个独立参数传入：

```go-html-template
{{ $m := dict "a" 1 "b" 2 }}
```

上面会生成如下数据结构：

```json
{
  "a": 1,
  "b": 2
}
```

注意 `key` 既可以是 `string`，也可以是 `[]string`。后者可用于创建深层嵌套的结构，例如：

```go-html-template
{{ $m := dict (slice "a" "b" "c") "value" }}
```

上面会生成如下数据结构：

```json
{
  "a": {
    "b": {
      "c": "value"
    }
  }
}
```

要创建空映射：

```go-html-template
{{ $m := dict }}
```
