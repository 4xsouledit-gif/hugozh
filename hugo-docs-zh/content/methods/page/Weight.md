+++
title = "Weight"
linkTitle = "Weight"
description = "返回给定页面前置元数据中定义的权重。"
date = 2026-10-02
weight = 880
source = "https://gohugo.io/methods/page/weight/"

[params.functions_and_methods]
signatures = ["PAGE.Weight"]
returnType = "int"
+++

`Page` 对象上的 `Weight` 方法返回给定页面前置元数据中定义的[权重](g)。

```toml
title = 'How to make spicy tuna hand rolls'
weight = 42
```

页面权重控制页面在按权重排序的集合中的位置。请用非零整数分配权重。较轻的条目浮到顶部，较重的条目沉到底部。未设置权重或权重为零的元素会被放在集合末尾。

尽管在模板中很少用到，你仍可以这样访问该值：

```go-html-template
{{ .Weight }} → 42
```
