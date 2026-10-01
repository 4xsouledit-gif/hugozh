+++
title = "FuzzyWordCount"
linkTitle = "FuzzyWordCount"
description = "返回给定页面内容的单词数，向上取整到最接近的 100 的倍数。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/methods/page/fuzzywordcount/"

[params.functions_and_methods]
signatures = ["PAGE.FuzzyWordCount"]
returnType = "int"
+++

```go-html-template
{{ .FuzzyWordCount }} → 200
```

要得到精确的单词数，请使用 [`WordCount`][] 方法。

> [!NOTE]
> 对于 [CJK](g) 语言的内容，请在项目配置中把 [`hasCJKLanguage`][] 设为 `true`。启用后，Hugo 会对含 CJK 字符的页面应用 CJK 计数规则。若要覆盖某个页面的这一行为，请在其前置元数据中设置 [`isCJKLanguage`][] 字段。

[`WordCount`]: /methods/page/wordcount/
[`hasCJKLanguage`]: /configuration/all/#hascjklanguage
[`isCJKLanguage`]: /content-management/front-matter/#iscjklanguage
