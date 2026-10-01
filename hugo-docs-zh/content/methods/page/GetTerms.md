+++
title = "GetTerms"
linkTitle = "GetTerms"
description = "返回给定页面在指定分类法中定义的术语所对应的术语页集合，顺序与它们在前置元数据中出现的先后一致。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/methods/page/getterms/"

[params.functions_and_methods]
signatures = ["PAGE.GetTerms TAXONOMY"]
returnType = "page.Pages"
+++

给定如下前置元数据：

```toml
title = 'Les Misérables'
tags = ['historical','classic','fiction']
```

这段模板代码：

```go-html-template
{{ with .GetTerms "tags" }}
  <p>Tags</p>
  <ul>
    {{ range . }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

会渲染为：

```html
<p>Tags</p>
<ul>
  <li><a href="/tags/historical/">historical</a></li>
  <li><a href="/tags/classic/">classic</a></li>
  <li><a href="/tags/fiction/">fiction</a></li>
</ul>
```
