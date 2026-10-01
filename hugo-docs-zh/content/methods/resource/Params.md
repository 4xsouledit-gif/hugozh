+++
title = "Params"
linkTitle = "Params"
description = "返回前置元数据中定义的资源参数映射。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/resource/params/"

[params.functions_and_methods]
signatures = ["RESOURCE.Params"]
returnType = "map"
+++

`Params` 方法用于[page resource](g)（页面资源），不适用于[global resource](g)（全局资源）或[remote resource](g)（远程资源）。

有如下内容结构：

```tree
content/
├── posts/
│   ├── cats/
│   │   ├── images/
│   │   │   └── a.jpg
│   │   └── index.md
│   └── _index.md
└── _index.md
```

以及如下前置元数据：

```toml
title = 'Cats'
[[resources]]
  src = 'images/a.jpg'
  title = 'Felix the cat'
  [resources.params]
    alt = 'Photograph of black cat'
    temperament = 'vicious'
```

以及这个模板：

```go-html-template
{{ with .Resources.Get "images/a.jpg" }}
  <figure>
    <img alt="{{ .Params.alt }}" src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}">
    <figcaption>{{ .Title }} is {{ .Params.temperament }}</figcaption>
  </figure>
{{ end }}
```

Hugo 渲染为：

```html
<figure>
  <img alt="Photograph of black cat" src="/posts/post-1/images/a.jpg" width="600" height="400">
  <figcaption>Felix the cat is vicious</figcaption>
</figure>
```

更多信息请参见[页面资源][]一节。

[页面资源]: /content-management/page-resources/
