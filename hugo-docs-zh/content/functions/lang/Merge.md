+++
title = "lang.Merge"
linkTitle = "Merge"
description = "返回给定页面集合的副本，其中缺失的译文页面由另一个页面集合补齐。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/lang/merge/"

[params.functions_and_methods]
signatures = ["lang.Merge FROM TO"]
returnType = "any"
+++

例如：

```sh
{{ $pages := .Site.RegularPages | lang.Merge $frSite.RegularPages | lang.Merge $enSite.RegularPages }}
```

会按从左到右的顺序，先用法语站点的内容、最后用英语站点的内容，为当前站点「填补空缺」。

更实用的例子是用其它语言补齐缺失的译文：

```sh
{{ $pages := .Site.RegularPages }}
{{ range .Site.Home.Translations }}
  {{ $pages = $pages | lang.Merge .Site.RegularPages }}
{{ end }}
```
