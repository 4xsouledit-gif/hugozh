+++
title = "Ordinal"
linkTitle = "Ordinal"
description = "返回短代码相对于其父级的从零开始的序号。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/shortcode/ordinal/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Ordinal"]
returnType = "int"
+++

`Ordinal` 方法返回短代码相对于其父级的从零开始的序号。如果父级就是页面本身，该序号表示这个短代码在页面内容中的位置。

> [!NOTE]
> 无论调用的是哪种具体的短代码类型，Hugo 都会在每次短代码调用时递增序号。也就是说，序号值是在给定页面内的所有短代码之间按顺序累计的。

这个方法的一个用途是：当同一个短代码在同一个页面中被调用两次或更多次时，为元素指定唯一的 ID。例如：

```md {file="content/about.md"}
{{</* img src="images/a.jpg" */>}}

{{</* img src="images/b.jpg" */>}}
```

这个短代码先做错误检查，然后渲染一个带唯一 `id` 属性的 HTML `img` 元素：

```go-html-template {file="layouts/_shortcodes/img.html"}
{{ $src := "" }}
{{ with .Get "src" }}
  {{ $src = . }}
  {{ with resources.Get $src }}
    {{ $id := printf "img-%03d" $.Ordinal }}
    <img id="{{ $id }}" src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ else }}
    {{ errorf "The %q shortcode was unable to find %s. See %s" $.Name $src $.Position }}
  {{ end }}
{{ else }}
  {{ errorf "The %q shortcode requires a 'src' argument. See %s" .Name .Position }}
{{ end }}
```

Hugo 把页面渲染为：

```html
<img id="img-000" src="/images/a.jpg" width="600" height="400" alt="">
<img id="img-001" src="/images/b.jpg" width="600" height="400" alt="">
```

> [!NOTE]
> 在上面的_短代码_模板中，[`with`][] 语句用于创建条件块。请记住，`with` 语句会把上下文（点号）绑定到它的表达式上。在 `with` 块内部，调用短代码方法时要加上 `$` 前缀，才能访问传入模板的顶层上下文。

[`with`]: /functions/go-template/with/
