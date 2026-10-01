+++
title = "AllTranslations"
linkTitle = "AllTranslations"
description = "返回给定页面的全部翻译版本（含当前语言），先按语言权重、再按语言名称排序。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/page/alltranslations/"

[params.functions_and_methods]
signatures = ["PAGE.AllTranslations"]
returnType = "page.Pages"
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

[languages.fr]
contentDir = 'content/fr'
label = 'Français'
locale = 'fr-FR'
weight = 3
```

内容如下：

```tree
content/
├── de/
│   ├── books/
│   │   ├── book-1.md
│   │   └── book-2.md
│   └── _index.md
├── en/
│   ├── books/
│   │   ├── book-1.md
│   │   └── book-2.md
│   └── _index.md
├── fr/
│   ├── books/
│   │   └── book-1.md
│   └── _index.md
└── _index.md
```

模板如下：

```go-html-template
{{ with .AllTranslations }}
  <ul>
    {{ range . }}
      <li>
        <a href="{{ .RelPermalink }}" hreflang="{{ .Language.Locale }}">{{ .LinkTitle }} ({{ or .Language.Label .Language.Name }})</a>
      </li>
    {{ end }}
  </ul>
{{ end }}
```

Hugo 会在各站点的 `book-1` 页面上渲染出这个列表：

```html
<ul>
  <li><a href="/books/book-1/" hreflang="en-US">Book 1 (English)</a></li>
  <li><a href="/de/books/book-1/" hreflang="de-DE">Book 1 (Deutsch)</a></li>
  <li><a href="/fr/books/book-1/" hreflang="fr-FR">Book 1 (Français)</a></li>
</ul>
```

在英文站点与德文站点的 `book-2` 页面上，Hugo 会渲染出：

```html
<ul>
  <li><a href="/books/book-1/" hreflang="en-US">Book 1 (English)</a></li>
  <li><a href="/de/books/book-1/" hreflang="de-DE">Book 1 (Deutsch)</a></li>
</ul>
```
