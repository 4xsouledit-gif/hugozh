+++
title = "Home"
linkTitle = "Home"
description = "返回给定站点的首页 Page 对象。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/site/home/"

[params.functions_and_methods]
signatures = ["SITE.Home"]
returnType = "page.Page"
+++

`Site` 对象上的 `Home` 方法是访问首页的便捷方式，其功能等价于：

```go-html-template
{{ .Site.GetPage "/" }}
```

由于它返回 `Page` 对象，你可以通过链式调用使用任何可用的 [page 方法][]。例如：

```go-html-template
{{ .Site.Home.Store.Set "greeting" "Hello" }}
```

这个方法常用于生成指向首页的链接。例如：

项目配置：

```toml
baseURL = 'https://example.org/docs/'
```

模板：

```go-html-template
{{ .Site.Home.Permalink }} → https://example.org/docs/
{{ .Site.Home.RelPermalink }} → /docs/
```

[page 方法]: /methods/page/
