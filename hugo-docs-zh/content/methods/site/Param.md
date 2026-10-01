+++
title = "Param"
linkTitle = "Param"
description = "返回给定 key 对应的站点参数。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/methods/site/param/"

[params.functions_and_methods]
signatures = ["SITE.Param KEY"]
returnType = "any"
+++

`Site` 对象上的 `Param` 方法是一个便捷方法，用于返回项目配置中某个用户自定义参数的值。

```toml
[params]
display_toc = true
```

```go-html-template
{{ .Site.Param "display_toc" }} → true
```

上面的写法等价于下面任意一种：

```go-html-template
{{ .Site.Params.display_toc }}
{{ index .Site.Params "display_toc" }}
```
