+++
title = "collections.IsSet"
linkTitle = "isset"
description = "报告给定的映射或切片中是否存在指定的 key 或索引。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/collections/isset/"

[params.functions_and_methods]
signatures = ["collections.IsSet MAP|SLICE KEY|INDEX"]
returnType = "bool"
aliases = ["isset"]
+++

例如，考虑下面这份项目配置：

```toml
[params]
showHeroImage = false
```

如果 `showHeroImage` 的值是 `true`，我们可以用 `if` 或 `with` 检测到它存在：

```go-html-template
{{ if site.Params.showHeroImage }}
  {{ site.Params.showHeroImage }} → true
{{ end }}

{{ with site.Params.showHeroImage }}
  {{ . }} → true
{{ end }}
```

然而，如果 `showHeroImage` 的值是 `false`，就无法用 `if` 或 `with` 检测其是否存在。这种情况下必须使用 `isset` 函数：

```go-html-template
{{ if isset site.Params "showheroimage" }}
  <p>The showHeroImage parameter is set to {{ site.Params.showHeroImage }}.<p>
{{ end }}
```

> [!NOTE]
> 使用 `isset` 函数时，必须以小写形式引用 key。参见上面的示例。
