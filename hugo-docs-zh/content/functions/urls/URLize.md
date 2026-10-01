+++
title = "urls.URLize"
linkTitle = "URLize"
description = "返回给定字符串，并把它清理为可用于 URL 的形式。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/urls/urlize/"

[params.functions_and_methods]
signatures = ["urls.URLize INPUT"]
returnType = "string"
aliases = ["urlize"]
+++

[`anchorize`][] 与 [`urlize`][] 两个函数很相似：

- 用 `anchorize` 函数生成 HTML `id` 属性的值
- 用 `urlize` 函数把字符串清理为可用于 URL 的形式

例如：

```go-html-template
{{ $s := "A B C" }}
{{ $s | anchorize }} → a-b-c
{{ $s | urlize }} → a-b-c

{{ $s := "a b   c" }}
{{ $s | anchorize }} → a-b---c
{{ $s | urlize }} → a-b-c

{{ $s := "< a, b, & c >" }}
{{ $s | anchorize }} → -a-b--c-
{{ $s | urlize }} → a-b-c

{{ $s := "main.go" }}
{{ $s | anchorize }} → maingo
{{ $s | urlize }} → main.go

{{ $s := "Hugö" }}
{{ $s | anchorize }} → hugö
{{ $s | urlize }} → hug%C3%B6
```

用 `urlize` 函数可以创建指向术语页面（term page）的链接。

假设项目配置如下：

```toml
[taxonomies]
author = 'authors'
```

前置元数据如下：

```toml
title = 'Les Misérables'
authors = ['Victor Hugo']
```

发布后的站点将具有这样的结构：

```tree
public/
├── authors/
│   ├── victor-hugo/
│   │   └── index.html
│   └── index.html
├── books/
│   ├── les-miserables/
│   │   └── index.html
│   └── index.html
└── index.html
```

要创建指向术语页面的链接：

```go-html-template
{{ $taxonomy := "authors" }}
{{ $term := "Victor Hugo" }}
{{ with index .Site.Taxonomies $taxonomy (urlize $term) }}
  <a href="{{ .Page.RelPermalink }}">{{ .Page.LinkTitle }}</a>
{{ end }}
```

要生成与某个内容页面关联的术语页面列表，请在 `Page` 对象上使用 [`GetTerms`][] 方法。

[`anchorize`]: /functions/urls/anchorize/
[`urlize`]: /functions/urls/urlize/
[`GetTerms`]: /methods/page/getterms/
