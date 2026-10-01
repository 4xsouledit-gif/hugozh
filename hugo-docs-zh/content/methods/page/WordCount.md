+++
title = "WordCount"
linkTitle = "WordCount"
description = "返回给定页面内容中的单词数。"
date = 2026-10-02
weight = 890
source = "https://gohugo.io/methods/page/wordcount/"

[params.functions_and_methods]
signatures = ["PAGE.WordCount"]
returnType = "int"
+++

```go-html-template
{{ .WordCount }} → 103
```

要向上取整到最接近的 100 的倍数，请使用 [`FuzzyWordCount`][] 方法。

> [!NOTE]
> 对于 [CJK](g) 语言的内容，请在项目配置中把 [`hasCJKLanguage`][] 设为 `true`。启用后，Hugo 会对含 CJK 字符的页面应用 CJK 计数规则。要针对某个页面覆盖该行为，请在其前置元数据中设置 [`isCJKLanguage`][] 字段。

[`FuzzyWordCount`]: /methods/page/fuzzywordcount/
[`hasCJKLanguage`]: /configuration/all/#hascjklanguage
[`isCJKLanguage`]: /content-management/front-matter/#iscjklanguage
