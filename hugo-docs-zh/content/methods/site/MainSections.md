+++
title = "MainSections"
linkTitle = "MainSections"
description = "返回项目配置中定义的主要 section 名称切片，若未定义则回退到包含页面最多的顶层 section。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/site/mainsections/"

[params.functions_and_methods]
signatures = ["SITE.MainSections"]
returnType = "[]string"
+++

项目配置：

```toml
mainSections = ['books','films']
```

模板：

```go-html-template
{{ .Site.MainSections }} → [books films]
```

如果项目配置中没有定义 `mainSections`，这个方法返回的切片只包含一个元素——即包含页面最多的顶层 section。

在如下内容结构中，`films` section 包含的页面最多：

```tree
content/
├── books/
│   ├── book-1.md
│   └── book-2.md
├── films/
│   ├── film-1.md
│   ├── film-2.md
│   └── film-3.md
└── _index.md
```

模板：

```go-html-template
{{ .Site.MainSections }} → [films]
```

制作主题时，与其在首页列出最相关页面时把 section 名称写死，不如指导用户在他们的项目配置中设置 `mainSections`。

这样你的 _home_ 模板就可以这样写：

```go-html-template {file="layouts/home.html"}
{{ range where .Site.RegularPages "Section" "in" .Site.MainSections }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```
