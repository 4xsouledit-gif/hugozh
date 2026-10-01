+++
title = "Param"
linkTitle = "Param"
description = "返回具有给定 key 的页面参数；若页面中没有，则回退到站点参数。"
date = 2026-10-02
weight = 510
source = "https://gohugo.io/methods/page/param/"

[params.functions_and_methods]
signatures = ["PAGE.Param KEY"]
returnType = "any"
+++

`Page` 对象上的 `Param` 方法会在页面参数中查找给定的 `KEY`，并返回对应的值。如果在页面参数中找不到该 `KEY`，它会到站点参数中查找。如果两处都找不到，`Param` 方法返回 `nil`。

站点和主题开发者通常会在站点层面设置参数，从而让内容作者可以在页面层面覆盖这些参数。

例如，要在每个页面上显示目录，同时允许作者按需隐藏目录：

配置：

```toml
[params]
display_toc = true
```

内容：

```toml
title = 'Example'
date = 2023-01-01
draft = false
[params]
display_toc = false
```

模板：

```go-html-template
{{ if .Param "display_toc" }}
  {{ .TableOfContents }}
{{ end }}
```

`Param` 方法返回与给定 `KEY` 关联的值，无论该值是 truthy 还是 falsy。如果你需要忽略 falsy 值，请改用下面这种写法：

```go-html-template
{{ or .Params.foo site.Params.foo }}
```
