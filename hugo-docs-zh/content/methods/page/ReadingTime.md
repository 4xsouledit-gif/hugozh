+++
title = "ReadingTime"
linkTitle = "ReadingTime"
description = "返回给定页面的预估阅读时间（以分钟计）。"
date = 2026-10-02
weight = 620
source = "https://gohugo.io/methods/page/readingtime/"

[params.functions_and_methods]
signatures = ["PAGE.ReadingTime"]
returnType = "int"
+++

Hugo 用内容中的单词数除以每分钟 212 词的阅读速度，据此估算阅读时间。

> [!NOTE]
> 对于 [CJK](g) 语言的内容，请在项目配置中把 [`hasCJKLanguage`][] 设为 `true`。启用后，Hugo 会对含 CJK 字符的页面应用 CJK 计数规则，并采用每分钟 500 词的阅读速度。要针对某个页面覆盖该行为，请在其前置元数据中设置 [`isCJKLanguage`][] 字段。

```go-html-template
{{ printf "Estimated reading time: %d minutes" .ReadingTime }}
```

阅读速度因语言而异。在多语言项目中，可以用站点参数为每种语言分别设置估算阅读时间。

```toml
[languages]
  [languages.de]
    contentDir = 'content/de'
    label = 'Deutsch'
    locale = 'de-DE'
    weight = 2
    [languages.de.params]
    reading_speed = 179
  [languages.en]
    contentDir = 'content/en'
    label = 'English'
    locale = 'en-US'
    weight = 1
    [languages.en.params]
      reading_speed = 228
```

然后在模板中：

```go-html-template
{{ $readingTime := div (float .WordCount) .Site.Params.reading_speed }}
{{ $readingTime = math.Ceil $readingTime }}
```

我们把 `.WordCount` 转换成浮点数，这样除以阅读速度时就能得到浮点结果。然后再向上取整到最接近的整数。

[`hasCJKLanguage`]: /configuration/all/#hascjklanguage
[`isCJKLanguage`]: /content-management/front-matter/#iscjklanguage
