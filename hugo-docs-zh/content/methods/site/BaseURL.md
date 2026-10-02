+++
title = "BaseURL"
linkTitle = "BaseURL"
description = "返回项目配置中定义的 base URL。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/site/baseurl/"

[params.functions_and_methods]
signatures = ["SITE.BaseURL"]
returnType = "string"
+++

## 这一页解决什么问题

`BaseURL` 把配置里 `baseURL` 的值原样交回模板，回答的是「本站发布在哪个地址」。它**不**负责把某个路径变成可用链接——这两件事在 base URL 带子路径（如 `https://example.org/docs/`）时会分道扬镳。

本站（`hugo-docs-zh`）的 `baseURL` 就是带子路径的写法，所以这个区别值得记住：`.Site.BaseURL` 只是回显配置，拼链接是 `absURL` / `relURL` 的职责。

## 什么时候用，什么时候别用

**该用**：

- 只是要**显示**配置中的根地址，例如页脚一行「本站地址：…」；
- 排查构建：确认本次构建实际用的 base URL（命令行 `--baseURL` 会覆盖配置文件的值）。

**别用**：

- 要把路径变成绝对 URL → 用 [`absURL`](/functions/urls/absurl/) 或 [`absLangURL`](/functions/urls/abslangurl/)；相对链接 → 用 [`relURL`](/functions/urls/relurl/) 或 [`relLangURL`](/functions/urls/rellangurl/)。实测 base URL 为 `https://example.org/docs/` 时，`absURL "images/logo.png"` → `https://example.org/docs/images/logo.png`，而手写 `.Site.BaseURL` 加路径只在配置恰好带结尾斜杠时才碰巧正确；
- 要链接某个页面 → 用该页面的 `.Permalink` / `.RelPermalink`（见 [methods/page](/methods/page/)），它们会自动带上子路径与语言前缀；
- 想「规范化」base URL 的写法 → 别指望配置原样保留：实测配置写成不带结尾斜杠的 `https://example.org`，`.Site.BaseURL` 会返回 `https://example.org/`。

## 用法

项目配置：

```toml
baseURL = 'https://example.org/docs/'
```

模板：

```go-html-template
{{ .Site.BaseURL }} → https://example.org/docs/
```

> [!NOTE]
> 在模板中几乎从来没有正当理由使用这个方法。由于配置错误，它的用法往往很脆弱。
>
> 请改用 [`absURL`][]、[`absLangURL`][]、[`relURL`][] 或 [`relLangURL`][] 函数。

## 完整示例（实测）

在最小站点里设 `baseURL = 'https://example.org/docs/'`，把下面三行放进任意会渲染 HTML 的模板（如 home 模板 `layouts/index.html`）：

```go-html-template {file="layouts/index.html"}
{{ .Site.BaseURL }} → https://example.org/docs/
{{ absURL "images/logo.png" }} → https://example.org/docs/images/logo.png
{{ relURL "images/logo.png" }} → /docs/images/logo.png
```

**你应当看到什么**：三个结果都带上了 `/docs/` 前缀。把 base URL 改成不带结尾斜杠的 `https://example.org`，第一行变成 `https://example.org/`（Hugo 自动补斜杠），后两行则变成 `https://example.org/images/logo.png` 与 `/images/logo.png`——这正说明**拼链接要交给 URL 函数，不能手接字符串**。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `baseURL = 'https://example.org/docs/'` | `https://example.org/docs/`（保留子路径与结尾斜杠） | 否 |
| `baseURL = 'https://example.org'`（无结尾斜杠） | `https://example.org/`（Hugo 补上斜杠） | 否 |
| 命令行传 `--baseURL` | 覆盖配置文件中的值 | 否 |
| 配置里完全没有 `baseURL` | 使用 Hugo 默认值 `https://example.org/` | 否 |
| 返回值类型 | `string` | 否 |

最后一行是排查时的陷阱：默认值恰好是一个看起来正常的地址，所以「页面上链接全指向 example.org」几乎总是因为配置文件没被读到。

[`absLangURL`]: /functions/urls/abslangurl/
[`absURL`]: /functions/urls/absurl/
[`relLangURL`]: /functions/urls/rellangurl/
[`relURL`]: /functions/urls/relurl/
