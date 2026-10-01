+++
title = "IsTranslated"
linkTitle = "IsTranslated"
description = "报告给定页面是否有一个或多个翻译版本。"
date = 2026-10-02
weight = 360
source = "https://gohugo.io/methods/page/istranslated/"

[params.functions_and_methods]
signatures = ["PAGE.IsTranslated"]
returnType = "bool"
+++

使用如下项目配置：

```toml
defaultContentLanguage = 'en'

[languages.en]
contentDir = 'content/en'
label = 'English'
locale = 'en-US'
weight = 1

[languages.de]
contentDir = 'content/de'
label = 'Deutsch'
locale = 'de-DE'
weight = 2
```

内容如下：

```tree
content/
├── de/
│   ├── books/
│   │   └── book-1.md
│   └── _index.md
├── en/
│   ├── books/
│   │   ├── book-1.md
│   │   └── book-2.md
│   └── _index.md
└── _index.md
```

渲染 `content/en/books/book-1.md` 时：

```go-html-template
{{ .IsTranslated }} → true
```

渲染 `content/en/books/book-2.md` 时：

```go-html-template
{{ .IsTranslated }} → false
```
