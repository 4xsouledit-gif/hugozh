+++
title = "Pages"
linkTitle = "Pages"
description = "返回所有页面的集合。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/methods/site/pages/"

[params.functions_and_methods]
signatures = ["SITE.Pages"]
returnType = "page.Pages"
+++

这个方法按[默认排序](g)返回当前语言中所有页面 [kind](g)，其中包括首页、section 页面、分类法页面、术语页面和常规页面。

大多数情况下你应该改用 [`RegularPages`][] 方法。

```go-html-template
{{ range .Site.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

[`RegularPages`]: /methods/site/regularpages/
