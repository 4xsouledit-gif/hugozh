+++
title = "LanguagePrefix"
linkTitle = "LanguagePrefix"
description = "返回给定站点的 URL 语言前缀（如果有）。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/methods/site/languageprefix/"

[params.functions_and_methods]
signatures = ["SITE.LanguagePrefix"]
returnType = "string"
+++

考虑如下项目配置：

```toml
defaultContentLanguage = 'de'
defaultContentLanguageInSubdir = false

[languages.de]
direction = 'ltr'
label = 'Deutsch'
locale = 'de-DE'
title = 'Projekt Dokumentation'
weight = 1

[languages.en]
direction = 'ltr'
label = 'English'
locale = 'en-US'
title = 'Project Documentation'
weight = 2
```

访问德语站点时：

```go-html-template
{{ .Site.LanguagePrefix }} → ""
```

访问英语站点时：

```go-html-template
{{ .Site.LanguagePrefix }} → /en
```

如果把 `defaultContentLanguageInSubdir` 改为 `true`，那么访问德语站点时：

```go-html-template
{{ .Site.LanguagePrefix }} → /de
```

`LanguagePrefix` 方法既可用于单语言项目，也可用于多语言项目。
