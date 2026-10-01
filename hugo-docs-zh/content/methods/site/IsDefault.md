+++
title = "IsDefault"
linkTitle = "IsDefault"
description = "报告给定站点在所有维度上是否为默认站点。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/site/isdefault/"

[params.functions_and_methods]
signatures = ["SITE.IsDefault"]
returnType = "bool"
+++

**（0.156.0 新增）**

`Site` 对象上的 `IsDefault` 方法报告给定站点在所有维度上是否为[默认站点](g)，这些维度包括[语言](g)、[版本](g)和[角色](g)。要确保某段代码在每次构建中只执行一次，无论你的[维度](g)生成了多少个[站点](g)，这个方法都很有用。

例如，下面的配置定义了一个横跨语言和版本两个维度的站点矩阵。

```toml
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

如果你调用一个初始化_局部模板_来处理一次性构建逻辑或全局变量设置，请用这个函数把该调用包在 [`if`][] 语句中。这样可以避免该逻辑在每个维度变体上都执行一次。

```go-html-template
{{ if .Site.IsDefault }}
  {{ partial "init.html" . }}
{{ end }}
```

在这种配置下，代码块只会为英语 v3.0.0 站点执行。选择英语是因为没有定义 [`defaultContentLanguage`][] 设置，英语因而成为[默认语言](g)。选择 v3.0.0 版本是因为没有定义 [`defaultContentVersion`][] 设置，v3.0.0 因而成为[默认版本](g)。

[`defaultContentLanguage`]: /configuration/all/#defaultcontentlanguage
[`defaultContentVersion`]: /configuration/all/#defaultcontentversion
[`if`]: /functions/go-template/if/
