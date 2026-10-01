+++
title = "Paginate"
linkTitle = "Paginate"
description = "返回对给定页面集合分页后得到的分页器。"
date = 2026-10-02
weight = 490
source = "https://gohugo.io/methods/page/paginate/"

[params.functions_and_methods]
signatures = ['PAGE.Paginate COLLECTION [N]']
returnType = "page.Pager"
+++

分页（pagination）是指把一个列表页面拆分成两个或多个分页器（pager），每个分页器包含页面集合的一个子集，以及指向其他分页器的导航链接。

默认情况下，每个分页器上的元素个数由你的[项目配置][]决定，默认值为 `10`。调用 `Paginate` 方法时传入第二个参数（一个整数）即可覆盖该值。

> [!NOTE]
> `Page` 对象上还有一个 `Paginator` 方法，但它既不能过滤也不能排序页面集合。
>
> `Paginate` 方法更加灵活。

你可以在[首页][home]、[section][section]、[分类法][taxonomy]和[术语][term]模板中调用分页。

```go-html-template {file="layouts/section.html"}
{{ $pages := where .Site.RegularPages "Section" "articles" }}
{{ $pages = $pages.ByTitle }}
{{ range (.Paginate $pages 7).Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
{{ partial "pagination.html" . }}
```

在上例中，我们：

1. 构建一个页面集合
1. 按标题对集合排序
1. 对集合分页，每个分页器含 7 个元素
1. 遍历分页后的页面集合，为每个页面渲染一个链接
1. 调用内嵌的分页模板，在分页器之间创建导航链接

> [!NOTE]
> 请注意，分页结果会被缓存。一旦调用了 `Paginator` 或 `Paginate` 方法，分页后的集合就不可更改。再次调用这些方法不会产生任何效果。

[home]: /templates/types/#home
[project configuration]: /configuration/pagination/
[section]: /templates/types/#section
[taxonomy]: /templates/types/#taxonomy
[term]: /templates/types/#term
