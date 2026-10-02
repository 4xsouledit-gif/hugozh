+++
title = "urls.RelURL"
linkTitle = "RelURL"
description = "返回相对 URL。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/urls/relurl/"

[params.functions_and_methods]
signatures = ["urls.RelURL INPUT"]
returnType = "string"
aliases = ["relURL"]
+++

## 这一页解决什么问题

模板里要给 `<link href>`、`<script src>`、`<img src>` 或站内链接填地址。硬编码 `/css/main.css` 在「站点部署在域名根目录」时能跑；一旦部署到子路径（`https://example.org/docs/`）或换了域名，这些地址就全都指错位置，而且**构建不会报错**，只会在浏览器里 404。

`relURL` 把这件事交回给 Hugo：你只写站内路径，它按项目配置里的 `baseURL` 拼出最终地址。它的全部难点可以归结为一句话——**结果取决于输入是否以斜杠开头**，下面两节把这一点拆开讲。

使用多语言配置时，请改用 [`urls.RelLangURL`][] 函数。返回的 URL 取决于：

- 输入是否以斜杠（`/`）开头
- 项目配置中的 `baseURL`

## 什么时候用，什么时候别用

**该用**：

- 模板里引用站内资源与站内路径：样式表、脚本、图片、`<a href>`；
- 希望地址随 `baseURL` 自动变化（本地预览、测试环境、正式域名共用一份模板）。

**别用**：

- 多语言站点里做站内链接 → 用 [`urls.RelLangURL`](/functions/urls/rellangurl/)：它会带上语言前缀，`relURL` 不会；
- 需要带域名与协议的完整地址（RSS、Open Graph、结构化数据、邮件模板）→ 用 [`urls.AbsURL`](/functions/urls/absurl/)；
- 链接到站外 → 直接写完整地址：`relURL` 只对同主机地址做特殊处理（实测其他主机原样返回）；
- 解析「页面路径 → 永久链接」→ 用 `ref`、`relref` 短代码或[链接渲染钩子](/render-hooks/links/)，不要手工拼路径。

> [!NOTE]
> 下面两节的对照表来自上游文档，实测已在 Hugo 0.167.0 上逐条复现，结果一致（测量条件：单语言站点，`baseURL` 分别为 `https://example.org/` 与 `https://example.org/docs/`）。

## 输入不以斜杠开头

如果输入不以斜杠开头，结果 URL 相对于项目配置里的 `baseURL`。

`baseURL = https://example.org/` 时

```go-html-template
{{ relURL "" }}                         → /
{{ relURL "articles" }}                 → /articles
{{ relURL "style.css" }}                → /style.css
{{ relURL "https://example.org" }}      → https://example.org
{{ relURL "https://example.org/" }}     → /
{{ relURL "https://www.example.org" }}  → https://www.example.org
{{ relURL "https://www.example.org/" }} → https://www.example.org/
```

`baseURL = https://example.org/docs/` 时

```go-html-template
{{ relURL "" }}                           → /docs/
{{ relURL "articles" }}                   → /docs/articles
{{ relURL "style.css" }}                  → /docs/style.css
{{ relURL "https://example.org" }}        → https://example.org
{{ relURL "https://example.org/" }}       → https://example.org/
{{ relURL "https://example.org/docs" }}   → https://example.org/docs
{{ relURL "https://example.org/docs/" }}  → /docs
{{ relURL "https://www.example.org" }}    → https://www.example.org
{{ relURL "https://www.example.org/" }}   → https://www.example.org/
```

## 输入以斜杠开头

如果输入以斜杠开头，结果 URL 相对于项目配置里 `baseURL` 的协议加主机部分。

`baseURL = https://example.org/` 时

```go-html-template
{{ relURL "/" }}          → /
{{ relURL "/articles" }}  → /articles
{{ relURL "/style.css" }} → /style.css
```

`baseURL = https://example.org/docs/` 时

```go-html-template
{{ relURL "/" }}          → /
{{ relURL "/articles" }}  → /articles
{{ relURL "/style.css" }} → /style.css
```

> [!NOTE]
> 正如上面的例子所示，带前导斜杠的写法很少是你想要的，而且可能导致意外的结果。几乎在所有情况下都应省略前导斜杠。

## 完整示例：给样式表和文章链接填地址

```go-html-template {file="layouts/_partials/head.html"}
<link rel="stylesheet" href="{{ relURL "css/main.css" }}">
<a href="{{ relURL "articles/hello/" }}">文章</a>
<p>首页：{{ relURL "" }}，带前导斜杠：{{ relURL "/articles/hello/" }}</p>
```

在 `baseURL = "https://hugozh.cn/"` 下，Hugo 渲染为：

```html
<link rel="stylesheet" href="/css/main.css">
<a href="/articles/hello/">文章</a>
<p>首页：/，带前导斜杠：/articles/hello/</p>
```

**你应当看到什么**：每个地址都以 `/` 开头——输入是站内路径时，`relURL` 返回不含域名的相对地址。在本站这种「部署在域名根目录」的场景下，`relURL "articles/hello/"` 与 `relURL "/articles/hello/"` 看起来一样。

把 `baseURL` 换成 `https://hugozh.cn/docs/`（站点部署在子路径）后，实测同一段模板变成：

```html
<link rel="stylesheet" href="/docs/css/main.css">
<a href="/docs/articles/hello/">文章</a>
<p>首页：/docs/，带前导斜杠：/articles/hello/</p>
```

注意最后一行：**带前导斜杠的输入丢掉了 `/docs/` 前缀**，地址指到了站点根目录（在子路径部署下多半就是 404）。这正是上游提示「几乎在所有情况下都应省略前导斜杠」的原因。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，`baseURL = "https://hugozh.cn/"`（Windows）。

| 输入 | 结果 | 说明 |
| --- | --- | --- |
| `""` | `/` | `baseURL` 带子路径时是 `/docs/` |
| `"articles/hello/"` | `/articles/hello/` | 拼在 `baseURL` 的路径部分之后 |
| `"https://example.org/"`（主机与 `baseURL` 相同） | `/` | 仅当它等于 `baseURL` 的路径时被折成 `/`；`baseURL` 为 `/docs/` 时原样返回 |
| `"https://www.example.org"`（别的子域） | 原样返回 | `relURL` 不会把它变成本地路径 |
| `"/articles/hello/"`（前导斜杠） | `/articles/hello/` | 相对 `baseURL` 的协议加主机，**丢掉子路径** |
| `"//example.org/x"` | `//example.org/x` | 协议相对地址原样返回 |
| `"./x"` | `/x` | 路径会被规范化 |
| `"#top"` | `/#top` | 前面补上 `/` |
| 数字（如 `42`）、`nil` | `/42`、`/` | 不报错 |
| 返回类型 | `string` | 不会返回 `nil` |

`baseURL` 末尾少写斜杠不用自己补：实测 `--baseURL "https://example.org/docs"` 时 Hugo 会先规范化成 `https://example.org/docs/`，`relURL ""` 得到 `/docs/`。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 站点部署到子路径后，样式与图片全部 404 | 输入带了前导斜杠，得到的是「协议加主机」级地址，不含站点子路径 | 去掉前导斜杠（实测 `/docs/` 部署下前导斜杠会丢掉 `/docs/`） |
| 没报错但结果不对 | 切换语言后站内链接 404 | 多语言站点用了 `relURL`，地址没有语言前缀 | 换成 [`urls.RelLangURL`](/functions/urls/rellangurl/) |
| 没报错但结果不对 | 产物里出现 `https://example.org`，不是站内路径 | 输入本身就是完整地址，或它与 `baseURL` 的主机加路径完全一致（会被折成 `/`） | 只传站内路径，不要传完整地址 |
| 没报错但结果不对 | 本地正常，线上地址错 | `baseURL` 与真实部署路径不一致 | 让 `baseURL` 与部署位置一致（子路径要带结尾斜杠），或构建时用 `--baseURL` 覆盖 |
| 报错看不懂 | 页面上原样出现 `{{ relURL ... }}` 字样 | 把模板函数写进了内容 Markdown：内容文件不是模板 | 在模板里生成地址，或改用短代码 |

更多排查入口见[故障排查](/troubleshooting/)。

[`urls.RelLangURL`]: /functions/urls/rellangurl/
