+++
title = "IndexOf"
linkTitle = "IndexOf"
description = "返回给定页面在给定页面集合中从零开始的索引。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/methods/pages/indexof/"

[params.functions_and_methods]
signatures = ["PAGES.IndexOf PAGE"]
returnType = "int"
+++

**（0.166.0 新增）**

如果给定的页面不在页面集合中，`IndexOf` 方法返回 `-1`。

有如下内容结构：

```tree
content/
├── posts/
│   ├── _index.md
│   ├── post-1.md   <-- front matter: weight = 10
│   ├── post-2.md   <-- front matter: weight = 20
│   └── post-3.md   <-- front matter: weight = 30
└── _index.md
```

以及这个模板：

```go-html-template {file="layouts/posts/page.html"}
{{ $pages := .CurrentSection.Pages.ByWeight }}
{{ $index := add ($pages.IndexOf .) 1 }}
<p>This is post {{ $index }} of {{ $pages.Len }} in {{ .CurrentSection.LinkTitle }}.</p>
```

访问 post-2 时，Hugo 渲染为：

```html
<p>This is post 2 of 3 in Posts.</p>
```

也可以用 `IndexOf` 方法构建「上一个／下一个」导航链接。结合 [`index`][] 与 [`add`][]/[`sub`][] 函数，可以用它取得同一页面集合中的上一个和下一个页面：

```go-html-template
{{ $pages := .CurrentSection.Pages.ByWeight }}
{{ $index := $pages.IndexOf . }}

{{ if ge $index 0 }}
  {{ with index $pages (add $index 1) }}
    <a href="{{ .RelPermalink }}">Previous</a>
  {{ end }}

  {{ with index $pages (sub $index 1) }}
    <a href="{{ .RelPermalink }}">Next</a>
  {{ end }}
{{ end }}
```

这等价于使用 [`Prev`][] 和 [`Next`][] 方法：

```go-html-template
{{ $pages := .CurrentSection.Pages.ByWeight }}

{{ with $pages.Prev . }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with $pages.Next . }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

> [!TIP]
> 与 `Prev` 和 `Next` 不同，`IndexOf` 这种用法还能告诉你页面在集合中的位置，如本页开头的示例所示。

[`Next`]: /methods/pages/next/
[`Prev`]: /methods/pages/prev/
[`add`]: /functions/math/add/
[`index`]: /functions/collections/indexfunction/
[`sub`]: /functions/math/sub/
