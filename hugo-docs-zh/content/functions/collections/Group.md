+++
title = "collections.Group"
linkTitle = "group"
description = "按指定 key 对给定的页面集合（切片）分组，返回一个映射。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/collections/group/"

[params.functions_and_methods]
signatures = ["collections.Group KEY PAGES"]
returnType = "page.PageGroup"
aliases = ["group"]
+++

```go-html-template
{{ $new := .Site.RegularPages | first 10 | group "New" }}
{{ $old := .Site.RegularPages | last 10 | group "Old" }}
{{ $groups := slice $new $old }}
{{ range $groups }}
  <h3>{{ .Key }}{{/* 输出 "New"、"Old" */}}</h3>
  <ul>
    {{ range .Pages }}
      <li>
        <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
        <div class="meta">{{ .Date.Format "Mon, Jan 2, 2006" }}</div>
      </li>
    {{ end }}
  </ul>
{{ end }}
```

从 `group` 得到的页面组，与 Hugo 内置 [group 方法][group methods]返回的类型相同。上面的示例可以[分页][paginated]。

[group methods]: /quick-reference/page-collections/#group
[paginated]: /templates/pagination/
