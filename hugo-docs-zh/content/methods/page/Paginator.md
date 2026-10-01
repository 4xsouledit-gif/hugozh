+++
title = "Paginator"
linkTitle = "Paginator"
description = "返回对上下文中收到的常规页面集合分页后得到的分页器。"
date = 2026-10-02
weight = 500
source = "https://gohugo.io/methods/page/paginator/"

[params.functions_and_methods]
signatures = ["PAGE.Paginator"]
returnType = "page.Pager"
+++

分页（pagination）是指把一个列表页面拆分成两个或多个分页器（pager），每个分页器包含页面集合的一个子集，以及指向其他分页器的导航链接。

每个分页器上的元素个数由你的[项目配置][]决定，默认值为 `10`。

你可以在[首页][home]、[section][section]、[分类法][taxonomy]和[术语][term]模板中调用分页。这些模板都会在[上下文](g)中接收一个常规页面集合。调用 `Paginator` 方法时，它会对上下文中收到的页面集合进行分页。

```go-html-template {file="layouts/section.html"}
{{ range .Paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
{{ partial "pagination.html" . }}
```

在上例中，内嵌的分页模板会在分页器之间创建导航链接。

> [!NOTE]
> 尽管调用起来很简单，但 `Paginator` 方法既不能过滤也不能排序页面集合。它只作用于上下文中收到的页面集合。
>
> [`Paginate`][] 方法更灵活，强烈推荐使用。

> [!NOTE]
> 请注意，分页结果会被缓存。一旦调用了 `Paginator` 或 `Paginate` 方法，分页后的集合就不可更改。再次调用这些方法不会产生任何效果。

[`Paginate`]: /methods/page/paginate/
[home]: /templates/types/#home
[project configuration]: /configuration/pagination/
[section]: /templates/types/#section
[taxonomy]: /templates/types/#taxonomy
[term]: /templates/types/#term
