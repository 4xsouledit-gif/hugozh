+++
title = "PlainWords"
linkTitle = "PlainWords"
description = "返回一个单词切片，由调用 Plain 方法并拆分其结果得到。"
date = 2026-10-02
weight = 570
source = "https://gohugo.io/methods/page/plainwords/"

[params.functions_and_methods]
signatures = ["PAGE.PlainWords"]
returnType = "[]string"
+++

`Page` 对象上的 `PlainWords` 方法会调用 [`Plain`][] 方法，然后用 Go 的 [`strings.Fields`][] 函数把结果拆分成单词。

> [!NOTE]
> `Fields` 会按一个或多个连续空白字符（由 [`unicode.IsSpace`][] 定义）的每一处出现来拆分字符串 `s`，返回由 `s` 的子串构成的切片；如果 `s` 只含空白字符，则返回空切片。

因此，切片中的元素可能带有前置或后置标点。

```go-html-template
{{ .PlainWords }}
```

要确定一个页面上不重复单词的大致数量：

```go-html-template
{{ .PlainWords | uniq }} → 42
```

[`Plain`]: /methods/page/plain/
[`strings.Fields`]: https://pkg.go.dev/strings#Fields
[`unicode.IsSpace`]: https://pkg.go.dev/unicode#IsSpace
