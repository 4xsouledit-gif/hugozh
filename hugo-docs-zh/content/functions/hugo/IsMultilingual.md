+++
title = "hugo.IsMultilingual"
linkTitle = "hugo.IsMultilingual"
description = "报告是否配置了两个或更多语言。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/hugo/ismultilingual/"

[params.functions_and_methods]
signatures = ["hugo.IsMultilingual"]
returnType = "bool"
+++

## 用法

项目配置：

```toml
defaultContentLanguage = 'de'
defaultContentLanguageInSubdir = true
[languages]
  [languages.de]
    label = 'Deutsch'
    locale = 'de-DE'
    title = 'Projekt Dokumentation'
    weight = 1
  [languages.en]
    label = 'English'
    locale = 'en-US'
    title = 'Project Documentation'
    weight = 2
```

模板：

```go-html-template
{{ hugo.IsMultilingual }} → true
```
