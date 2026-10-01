+++
title = "hugo.Sites"
linkTitle = "hugo.Sites"
description = "返回所有维度上全部站点的集合。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/hugo/sites/"

[params.functions_and_methods]
signatures = ["hugo.Sites"]
returnType = "page.Sites"
+++

**（0.156.0 新增）**

## 排序

返回的集合按层级排序，后一个维度用于打破前一个维度的并列：

1. 先按语言（Language）的 weight 升序排序；如果 weight 相同或未定义，则退回字典序。
1. 再按版本（Version）的 weight 升序排序；并列时 Hugo 默认按语义化版本降序排列。
1. 最后按角色（Role）的 weight 升序排序；仍并列时用字典序作为最终回退。

## 用法

使用以下项目配置：

```toml
defaultContentLanguage = 'en'
defaultContentLanguageInSubdir = true
defaultContentVersionInSubdir = true

[languages.de]
contentDir = 'content/de'
direction = 'ltr'
label = 'Deutsch'
locale = 'de-DE'
title = 'Projekt Dokumentation'
weight = 1

[languages.en]
contentDir = 'content/en'
direction = 'ltr'
label = 'English'
locale = 'en-US'
title = 'Project Documentation'
weight = 2

[versions.'v1.0.0']
[versions.'v2.0.0']
[versions.'v3.0.0']
```

这个模板：

```go-html-template
<ul>
  {{ range hugo.Sites }}
    <li><a href="{{ .Home.RelPermalink }}">{{ .Title }} {{ .Version.Name }}</a></li>
  {{ end }}
</ul>
```

会生成一串指向各站点首页的链接：

```html
<ul>
  <li><a href="/v3.0.0/de/">Projekt Dokumentation v3.0.0</a></li>
  <li><a href="/v2.0.0/de/">Projekt Dokumentation v2.0.0</a></li>
  <li><a href="/v1.0.0/de/">Projekt Dokumentation v1.0.0</a></li>
  <li><a href="/v3.0.0/en/">Project Documentation v3.0.0</a></li>
  <li><a href="/v2.0.0/en/">Project Documentation v2.0.0</a></li>
  <li><a href="/v1.0.0/en/">Project Documentation v1.0.0</a></li>
</ul>
```

渲染指向默认站点首页的链接：

```go-html-template
{{ with hugo.Sites.Default }}
  <a href="{{ .Home.RelPermalink }}">{{ .Title }}</a>
{{ end }}
```

使用上面的配置时，这会渲染指向英语版 v3.0.0 站点首页的链接。默认站点是使用默认语言、默认版本与默认角色的那个站点，与它在集合中的位置无关。在这个例子里，三个德语站点因为语言 weight 较小而排在前面，但根据 `defaultContentLanguage` 配置，英语才是默认语言。

[`defaultContentLanguage`]: /configuration/all/#defaultcontentlanguage
