+++
title = "Config"
linkTitle = "Config"
description = "返回项目配置的一个子集。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/site/config/"

[params.functions_and_methods]
signatures = ["SITE.Config"]
returnType = "page.SiteConfig"
+++

`Site` 对象上的 `Config` 方法用于访问项目配置的一个子集，具体是 `services` 和 `privacy` 这两个键。

## Services

参见[配置 services][]。

例如，要使用 Hugo 内置的 Google Analytics 模板，你必须添加一个 [Google tag ID][]：

```toml
[services.googleAnalytics]
id = 'G-XXXXXXXXX'
```

在模板中访问这个值：

```go-html-template
{{ .Site.Config.Services.GoogleAnalytics.ID }} → G-XXXXXXXXX
```

如上面的示例所示，每个标识符都必须大写。

## Privacy

参见[配置 privacy][]。

例如，要禁用内置 `youtube` 短代码的使用：

```toml
[privacy.youtube]
disable = true
```

在模板中访问这个值：

```go-html-template
{{ .Site.Config.Privacy.YouTube.Disable }} → true
```

如上面的示例所示，每个标识符都必须大写。

[Google tag ID]: https://support.google.com/tagmanager/answer/12326985?hl=en
[配置 privacy]: /configuration/privacy/
[配置 services]: /configuration/services/
