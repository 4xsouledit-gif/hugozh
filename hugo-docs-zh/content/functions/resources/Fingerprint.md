+++
title = "resources.Fingerprint"
linkTitle = "Fingerprint"
description = "返回带指纹的资源，它由给定资源的内容做密码学哈希得到。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/resources/fingerprint/"

[params.functions_and_methods]
signatures = ["resources.Fingerprint [ALGORITHM] RESOURCE"]
returnType = "resource.Resource"
aliases = ["fingerprint"]
+++

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

```go-html-template
{{ with resources.Get "js/main.js" }}
  {{ with . | fingerprint "sha256" }}
    <script src="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous"></script>
  {{ end }}
{{ end }}
```

Hugo 渲染出的结果大致如下：

```html
<script src="/js/main.62e...df1.js" integrity="sha256-Yuh...rfE=" crossorigin="anonymous"></script>
```

尽管 `resources.Fingerprint` 函数最常用于 CSS 与 JavaScript 资源，但任何类型的资源都可以使用它。

哈希算法可以是 `md5`、`sha256`（默认）、`sha384` 或 `sha512` 之一。

对资源内容做密码学哈希之后：

1. `Permalink` 与 `RelPermalink` 方法返回的值包含哈希和
1. 资源的 `.Data.Integrity` 方法返回一个[子资源完整性][]（SRI）值，由哈希算法名、一个连字符以及 base64 编码的哈希和组成

[子资源完整性]: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
