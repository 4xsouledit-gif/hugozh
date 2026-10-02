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

## 这一页解决什么问题

`Config` 是模板里读取**项目级服务与隐私配置**的入口：`services`（Google Analytics、Disqus、RSS 等内置服务的凭据）和 `privacy`（内置短代码是否允许访问第三方）。

它**只**覆盖这两个键。自定义参数放在 `[params]` 下，要用 [`Site.Params`](/methods/site/params/) 或 [`Site.Param`](/methods/site/param/) 读；页面级参数用页面的 `.Params`。三者在配置里挨着写，读取方式却完全不同，这是初学者最常混的一处。

## 什么时候用，什么时候别用

**该用**：

- 模板要判断内置服务是否已配置（例如 `services.googleAnalytics.id` 为空时不要输出统计代码）；
- 模板要遵守 `privacy` 设置（例如禁用 `youtube` 短代码时给出静态占位符）。

**别用**：

- 自定义站点参数 → [methods/site/params](/methods/site/params/) / [methods/site/param](/methods/site/param/)；
- 页面自己的参数 → [methods/page/params](/methods/page/params/)；
- 页面标题、语言、菜单等 → 各自的专用方法（[methods/site](/methods/site/) 下同级的那些页）。

## 用法

`Site` 对象上的 `Config` 方法用于访问项目配置的一个子集，具体是 `services` 和 `privacy` 这两个键。

### Services

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

### Privacy

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

## 完整示例（实测）

配置：

```toml
[services.googleAnalytics]
id = 'G-XXXXXXXXX'

[privacy.youtube]
disable = true
```

在任意会渲染 HTML 的模板（如 home 模板 `layouts/index.html`）中：

```go-html-template {file="layouts/index.html"}
{{ with .Site.Config.Services.GoogleAnalytics.ID }}
  <p>统计 ID：{{ . }}</p>
{{ else }}
  <p>未配置统计服务</p>
{{ end }}

{{ if .Site.Config.Privacy.YouTube.Disable }}
  <p>YouTube 短代码已禁用</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>统计 ID：G-XXXXXXXXX</p>
<p>YouTube 短代码已禁用</p>
```

**你应当看到什么**：`with` 不成立的分支没有输出——这正是「未配置」与「配置为空字符串」在模板里的统一处理方式。大小写必须与配置键一致：`GoogleAnalytics`、`YouTube`、`ID`、`Disable` 都是首字母大写，**写成小写会直接构建失败**（实测 `can't evaluate field iD in type services.GoogleAnalytics`），而不是静默取空。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `.Site.Config` 本身 | `page.SiteConfig` 对象（实测 `printf "%T"` → `page.SiteConfig`） | 否 |
| 配置了 `[services.googleAnalytics] id` | 原样返回，如 `G-XXXXXXXXX` | 否 |
| 完全没配置 `[services]` | `.Site.Config.Services.GoogleAnalytics.ID` → 空字符串（在 `with` 里判为假） | 否 |
| 配置了 `[privacy.youtube] disable = true` | `true` | 否 |
| 完全没配置 `[privacy]` | `.Site.Config.Privacy.YouTube.Disable` → `false` | 否 |
| 键名大小写写错（如 `GoogleAnalytics.iD`、`Privacy.Youtube`） | —— | 是：`can't evaluate field iD in type services.GoogleAnalytics` / `can't evaluate field Youtube in type privacy.Config` |

[Google tag ID]: https://support.google.com/tagmanager/answer/12326985?hl=en
[配置 privacy]: /configuration/privacy/
[配置 services]: /configuration/services/
