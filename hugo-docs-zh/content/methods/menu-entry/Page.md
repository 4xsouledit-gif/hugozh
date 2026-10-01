+++
title = "Page"
linkTitle = "Page"
description = "返回与给定菜单条目关联的 Page 对象。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/menu-entry/page/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Page"]
returnType = "page.Page"
+++

无论你如何[定义菜单条目][define menu entries]，与页面关联的条目都可以访问该页面的[方法][methods]。

在下面的菜单定义中，前两个条目与页面关联，最后一个没有：

```toml
[[menus.main]]
pageRef = '/about'
weight = 10

[[menus.main]]
pageRef = '/contact'
weight = 20

[[menus.main]]
name = 'Hugo'
url = 'https://gohugo.io'
weight = 30
```

在下面的示例中，如果菜单条目与页面关联，渲染锚点元素时使用页面的 [`RelPermalink`][] 和 [`LinkTitle`][]。

如果条目未与页面关联，则使用它的 `url` 和 `name` 属性。

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    {{ with .Page }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ else }}
      <li><a href="{{ .URL }}">{{ .Name }}</a></li>
    {{ end }}
  {{ end }}
</ul>
```

更多信息请参见[菜单模板][menu templates]一节。

[`LinkTitle`]: /methods/page/linktitle/
[`RelPermalink`]: /methods/page/relpermalink/
[define menu entries]: /content-management/menus/
[menu templates]: /templates/menu/#page-references
[methods]: /methods/page/
