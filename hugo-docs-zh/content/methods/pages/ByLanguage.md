+++
title = "ByLanguage"
linkTitle = "ByLanguage"
description = "返回给定页面集合按语言排序后的结果。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/pages/bylanguage/"

[params.functions_and_methods]
signatures = ["PAGES.ByLanguage"]
returnType = "page.Pages"
+++

按语言排序时，Hugo 使用以下优先级对页面集合排序：

1. 语言权重（升序）
1. 日期（降序）
1. LinkTitle（升序）

这个方法几乎用不到。已经包含多种语言的页面集合，例如 `Page` 对象上的 [`Rotate`][]、[`Translations`][] 或 [`AllTranslations`][] 方法返回的集合，本身就按语言权重排好序了。

下面这个刻意构造的例子先把所有站点的页面汇总起来，再按语言排序：

```go-html-template
{{ $p := slice }}
{{ range hugo.Sites }}
  {{ range .Pages }}
    {{ $p = $p | append . }}
  {{ end }}
{{ end }}

{{ range $p.ByLanguage }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range $p.ByLanguage.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

[`AllTranslations`]: /methods/page/alltranslations/
[`Rotate`]: /methods/page/rotate/
[`Translations`]: /methods/page/translations/
