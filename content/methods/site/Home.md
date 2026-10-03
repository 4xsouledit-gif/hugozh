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

## 这一页解决什么问题

`Home` 返回**首页这个页面对象**。因为它就是普通 `Page`，你可以对它用任何页面方法：`.Title`、`.Pages`、`.Params`、`.Store`、`.Resources`，也可以链接它：`.Permalink` / `.RelPermalink`。

首页是每个站点唯一必然存在、且永远不为 `nil` 的页面——所以「链接回首页」这件事不需要任何兜底代码，这也是它比手写 `baseURL` 更可靠的原因。

## 什么时候用，什么时候别用

**该用**：

- 生成指向首页的链接：用 `.Site.Home.RelPermalink`（自动处理子路径与语言前缀）；
- 在首页模板之外引用首页对象（首页模板内的 `.` 往往就是它，只有在 `range` / `with` 里才需要外层引用）；
- 把首页当作跨模板共享数据的载体，例如 `.Site.Home.Store.Set`；
- 首页要列内容时配合 [`Site.Pages`](/methods/site/pages/)、[`Site.RegularPages`](/methods/site/regularpages/)、[`Site.MainSections`](/methods/site/mainsections/)。

**别用**：

- 想取「当前页面」→ 用 `.` 或 `.Page`；
- 想取任意页面 → 用 [`Site.GetPage`](/methods/site/getpage/)；
- 想判断「当前页是不是首页」→ 用页面上的 `.IsHome`（见 [methods/page](/methods/page/)），不要拿 `.Site.Home` 去比较；
- 想遍历所有区块 → 用 [`Site.Sections`](/methods/site/sections/)。

## 用法

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

## 完整示例（实测）

配置 `baseURL = 'https://example.org/docs/'`，在任意会渲染 HTML 的模板（如 `layouts/index.html`）中：

```go-html-template {file="layouts/index.html"}
<a href="{{ .Site.Home.RelPermalink }}">{{ .Site.Home.Title }}</a>
<p>等价写法：{{ (.Site.GetPage "/").RelPermalink }}</p>
<p>URL：{{ .Site.Home.Permalink }}</p>
{{ .Site.Home.Store.Set "greeting" "Hello" }}
<p>{{ .Site.Home.Store.Get "greeting" }}</p>
```

Hugo 渲染为：

```html
<a href="/docs/">Home</a>
<p>等价写法：/docs/</p>
<p>URL：https://example.org/docs/</p>

<p>Hello</p>
```

**你应当看到什么**：`.RelPermalink` 带上了 baseURL 的子路径 `/docs/`，`.Permalink` 是完整绝对地址，两条路径写法结果一致；挂在 `.Site.Home` 上的 `Store` 值在同一次构建里可以读回。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，`baseURL = 'https://example.org/docs/'`，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 任何项目、任何模板 | 一定返回首页 `Page`（实测类型为内部页面类型，满足 `returnType` 的 `page.Page`） | 否 |
| 与 `{{ .Site.GetPage "/" }}` 比较 | 等价（实测 `.Kind` → `home`，`.Title` → `Home`） | 否 |
| 站点没有 `content/_index.md` | 仍返回首页对象（Hugo 会合成一个） | 否 |
| `baseURL` 带子路径 | `.RelPermalink` → `/docs/`，`.Permalink` → `https://example.org/docs/` | 否 |
| `baseURL` 无子路径 | `.RelPermalink` → `/` | 否 |
| 对 `.Site.Home` 直接 `range` | 不可迭代 | 是：`range can't iterate over {…}`（实测报错） |

[page 方法]: /methods/page/
