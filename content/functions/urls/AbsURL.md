+++
title = "urls.AbsURL"
linkTitle = "AbsURL"
description = "返回绝对 URL。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/urls/absurl/"

[params.functions_and_methods]
signatures = ["urls.AbsURL INPUT"]
returnType = "string"
aliases = ["absURL"]
+++

## 这一页解决什么问题

有些地方**必须**给出带域名与协议的完整地址：RSS/Atom 里的 `<link>`、Open Graph 的 `og:url`、结构化数据、sitemap、邮件模板。写死域名会在换域名或切到子路径部署时失效，`urls.AbsURL` 让地址跟着项目配置里的 `baseURL` 走。它的全部难点只有一句话——**结果取决于输入是否以斜杠开头**。

## 什么时候用，什么时候别用

**该用**：

- 需要完整地址的场合（RSS、OG、结构化数据、sitemap、邮件）；
- 希望地址随 `baseURL` 自动变化。

**别用**：

- 多语言站点 → 用 [`urls.AbsLangURL`](/functions/urls/abslangurl/)：它会带上语言前缀，`absURL` 不会；
- 站内相对地址（`<a href>`、样式、脚本、图片）→ 用 [`urls.RelURL`](/functions/urls/relurl/)；
- 页面之间的链接 → 用 [`urls.Ref`](/functions/urls/ref/) 或 [`urls.RelRef`](/functions/urls/relref/)，它们会校验目标页面是否存在；
- 只是拼接片段 → 用 [`urls.JoinPath`](/functions/urls/joinpath/)。

## 用法

使用多语言配置时，请改用 [`urls.AbsLangURL`][] 函数。返回的 URL 取决于：

- 输入是否以斜杠（`/`）开头
- 项目配置中的 `baseURL`

### 输入不以斜杠开头

如果输入不以斜杠开头，结果 URL 中的路径相对于项目配置里的 `baseURL`。

`baseURL = https://example.org/` 时

```go-html-template
{{ absURL "" }}          → https://example.org/
{{ absURL "articles" }}  → https://example.org/articles
{{ absURL "style.css" }} → https://example.org/style.css
```

`baseURL = https://example.org/docs/` 时

```go-html-template
{{ absURL "" }}          → https://example.org/docs/
{{ absURL "articles" }}  → https://example.org/docs/articles
{{ absURL "style.css" }} → https://example.org/docs/style.css
```

### 输入以斜杠开头

如果输入以斜杠开头，结果 URL 中的路径相对于项目配置里 `baseURL` 的协议加主机部分。

`baseURL = https://example.org/` 时

```go-html-template
{{ absURL "/" }}          → https://example.org/
{{ absURL "/articles" }}  → https://example.org/articles
{{ absURL "/style.css" }} → https://example.org/style.css
```

`baseURL = https://example.org/docs/` 时

```go-html-template
{{ absURL "/" }}          → https://example.org/
{{ absURL "/articles" }}  → https://example.org/articles
{{ absURL "/style.css" }} → https://example.org/style.css
```

> [!NOTE]
> 正如上面的例子所示，带前导斜杠的写法很少是你想要的，而且可能导致意外的结果。几乎在所有情况下都应省略前导斜杠。

[`urls.AbsLangURL`]: /functions/urls/abslangurl/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/canonical.html"}
[{{ absURL "" }}]|[{{ absURL "articles" }}]|[{{ absURL "/articles" }}]
```

Hugo 0.167.0 实测输出，`baseURL = "https://example.org/"` 时：

```text
[https://example.org/]|[https://example.org/articles]|[https://example.org/articles]
```

把 `baseURL` 换成 `"https://example.org/docs/"` 后，同一段模板实测输出：

```text
[https://example.org/docs/]|[https://example.org/docs/articles]|[https://example.org/articles]
```

**你应当看到什么**：前两项带上了 `/docs/` 前缀，**第三项没有**——输入带了前导斜杠，`absURL` 只把它接到「协议 + 主机」后面，站点子路径被丢掉了。在子路径部署的站点上，这正是「本地看着对、线上 404」的常见原因。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；`baseURL` 分别取 `https://example.org/` 与 `https://example.org/docs/`。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `""` | 等于 `baseURL`（含结尾斜杠） | 否 |
| `"articles"` | `baseURL` 的路径部分 + `articles` | 否 |
| `"/articles"` | 协议 + 主机 + `/articles`，**丢掉** `baseURL` 的路径（实测 `/docs/` 部署下得到 `https://example.org/articles`） | 否 |
| `"/"` | 协议 + 主机 + `/` | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 站点部署到子路径后，RSS/OG 里的地址 404 | 输入带前导斜杠，丢掉了子路径 | 省略前导斜杠（实测去掉后才带上 `/docs/`） |
| 没报错但结果不对 | 切换语言后地址指向默认语言 | 多语言站点用了 `absURL`，没有语言前缀 | 改用 [`urls.AbsLangURL`](/functions/urls/abslangurl/) |
| 没报错但结果不对 | 本地预览的域名跑到了线上 | `baseURL` 是本地地址或被 `--baseURL` 临时覆盖 | 构建时用生产环境的 `baseURL` |

更多排查入口见[故障排查](/troubleshooting/)。
