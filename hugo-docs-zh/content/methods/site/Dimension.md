+++
title = "Dimension"
linkTitle = "Dimension"
description = "返回给定站点中指定维度的维度对象。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/site/dimension/"

[params.functions_and_methods]
signatures = ["SITE.Dimension DIMENSION"]
returnType = "page.SiteDimension"
+++

**（0.153.0 新增）**

`Site` 对象上的 `Dimension` 方法返回给定[维度](g)的维度对象。

`DIMENSION` 参数必须是 `language`、`version` 或 `role` 之一。

示例|返回值|等价于
:--|:--|:--
`{{ .Site.Dimension "language" }}`|`langs.Language`|`{{ .Site.Language }}`
`{{ .Site.Dimension "version" }}`|`version.Version`|`{{ .Site.Version }}`
`{{ .Site.Dimension "role" }}`|`roles.Role`|`{{ .Site.Role }}`

```go-html-template
{{ $languageObject := .Site.Dimension "language" }}
{{ $languageObject.IsDefault }} → true
{{ $languageObject.Name }} → en

{{ $versionObject := .Site.Dimension "version" }}
{{ $versionObject.IsDefault }} → true
{{ $versionObject.Name }} → v1.0.0

{{ $roleObject := .Site.Dimension "role" }}
{{ $roleObject.IsDefault }} → true
{{ $roleObject.Name }} → guest
```
