+++
title = "GetPage"
linkTitle = "GetPage"
description = "返回给定路径对应的 Page 对象。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/site/getpage/"

[params.functions_and_methods]
signatures = ["SITE.GetPage PATH"]
returnType = "page.Page"
+++

`GetPage` 方法在 `Page` 对象上同样可用，此时可以指定相对于当前页面的路径。详见[说明][]。

在 `Site` 对象上使用 `GetPage` 方法时，请指定相对于 `content` 目录的路径。

如果 Hugo 无法把路径解析为页面，该方法返回 `nil`。

考虑如下内容结构：

```tree
content/
├── works/
│   ├── paintings/
│   │   ├── _index.md
│   │   ├── starry-night.md
│   │   └── the-mona-lisa.md
│   ├── sculptures/
│   │   ├── _index.md
│   │   ├── david.md
│   │   └── the-thinker.md
│   └── _index.md
└── _index.md
```

下面这个 _home_ 模板：

```go-html-template {file="layouts/home.html"}
{{ with .Site.GetPage "/works/paintings" }}
  <ul>
    {{ range .Pages }}
      <li>{{ .Title }} by {{ .Params.artist }}</li>
    {{ end }}
  </ul>
{{ end }}
```

渲染结果为：

```html
<ul>
  <li>Starry Night by Vincent van Gogh</li>
  <li>The Mona Lisa by Leonardo da Vinci</li>
</ul>
```

要获取常规页面而不是 section 页面：

```go-html-template {file="layouts/home.html"}
{{ with .Site.GetPage "/works/paintings/starry-night" }}
  {{ .Title }} → Starry Night
  {{ .Params.artist }} → Vincent van Gogh
{{ end }}
```

## 多语言项目

在多语言项目中，`Site` 对象上的 `GetPage` 方法会把给定路径解析为当前语言的页面。

要获取其他语言的页面，请查询 `Sites` 对象：

```go-html-template
{{ with where hugo.Sites "Language.Name" "eq" "de" }}
  {{ with index . 0 }}
    {{ with .GetPage "/works/paintings/starry-night" }}
      {{ .Title }} → Sternenklare Nacht
    {{ end }}
  {{ end }}
{{ end }}
```

## 页面包

考虑如下内容结构：

```tree
content/
├── headless/
│   ├── a.jpg
│   ├── b.jpg
│   ├── c.jpg
│   └── index.md  <-- front matter: headless = true
└── _index.md
```

在 _home_ 模板中，用 `Site` 对象上的 `GetPage` 方法渲染 headless [页面包](g)中的所有图片：

```go-html-template {file="layouts/home.html"}
{{ with .Site.GetPage "/headless" }}
  {{ range .Resources.ByType "image" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

[说明]: /methods/page/getpage/
