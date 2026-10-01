+++
title = "hugo.IsMultihost"
linkTitle = "hugo.IsMultihost"
description = "报告每个已配置的语言是否拥有各自独立的 base URL。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/hugo/ismultihost/"

[params.functions_and_methods]
signatures = ["hugo.IsMultihost"]
returnType = "bool"
+++

## 用法

项目配置：

```toml
defaultContentLanguage = 'de'
defaultContentLanguageInSubdir = true
[languages]
  [languages.de]
    baseURL = 'https://de.example.org/'
    label = 'Deutsch'
    locale = 'de-DE'
    title = 'Projekt Dokumentation'
    weight = 1
  [languages.en]
    baseURL = 'https://en.example.org/'
    label = 'English'
    locale = 'en-US'
    title = 'Project Documentation'
    weight = 2
```

模板：

```go-html-template
{{ hugo.IsMultihost }} → true
```
