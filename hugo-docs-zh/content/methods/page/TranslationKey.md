+++
title = "TranslationKey"
linkTitle = "TranslationKey"
description = "返回给定页面的翻译 key。"
date = 2026-10-02
weight = 840
source = "https://gohugo.io/methods/page/translationkey/"

[params.functions_and_methods]
signatures = ["PAGE.TranslationKey"]
returnType = "string"
+++

翻译 key 在给定页面的所有译文之间建立关联。翻译 key 由文件路径推导而来；如果前置元数据中定义了 `translationKey` 参数，则由该参数决定。

项目配置如下：

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
│   │   ├── buch-1.md
│   │   └── book-2.md
│   └── _index.md
├── en/
│   ├── books/
│   │   ├── book-1.md
│   │   └── book-2.md
│   └── _index.md
└── _index.md
```

前置元数据如下：

```toml
title = 'Book 1'
translationKey = 'foo'
```

```toml
title = 'Buch 1'
translationKey = 'foo'
```

渲染上述任一页面时：

```go-html-template
{{ .TranslationKey }} → page/foo
```

如果两种语言中 Book 2 的前置元数据都没有包含翻译 key：

```go-html-template
{{ .TranslationKey }} → page/books/book-2
```
