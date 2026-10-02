+++
title = "Site"
linkTitle = "Site"
description = "返回 Site 对象。"
date = 2026-10-02
weight = 760
source = "https://gohugo.io/methods/page/site/"

[params.functions_and_methods]
signatures = ["PAGE.Site"]
returnType = "page.siteWrapper"
+++

## 这一页解决什么问题

`.Site` 从当前页面出发，拿到**当前语言对应的站点对象**。模板里几乎所有「站点级」信息都从这里取：`Title`、`Params`、`Home`、`Menus`、`Pages`、`Language`、`Taxonomies` 等。

在多语言站点里，`.Site` 是**语言相关**的：英文页面的 `.Site.Title` 是英文站标题，中文页面是中文站标题（实测）。要一次拿到所有语言，用 [`hugo.Sites`](/functions/hugo/sites/)（[`.Sites`](/methods/page/sites/) 已弃用）。

## 什么时候用，什么时候别用

**该用**：

- 取站点标题、站点参数、首页、菜单、语言、分类法；
- 在 partial/短代码里需要「这个页面属于哪个站点」的上下文。

**别用**：

- 只想取站点参数 → 用全局 `site` 函数（`site.Params.foo`）更短，效果等价；
- 想列出所有语言站点 → 用 [`hugo.Sites`](/functions/hugo/sites/)；
- 想拿「当前页面」→ 点号本身就是页面，别绕 `.Site.Home`。

## 用法

参见 [Site 方法][]。

```go-html-template
{{ .Site.Title }}
```

## 完整示例：取站点级信息

测试站配置（节选）与模板：

```toml
title = 'MP 测试站'
[params]
author = 'MP Author'
```

```go-html-template {file="layouts/_default/single.html"}
<p>{{ .Site.Title }}</p>
<p>{{ .Site.Params.author }}</p>
<p>{{ .Site.Home.RelPermalink }}</p>
<p>{{ .Site.Language.Lang }}</p>
```

实测（Hugo 0.167.0）：

| 渲染的页面 | `.Site.Title` | `.Site.Params.author` | `.Site.Home.Path` | `.Site.Language.Lang` |
| --- | --- | --- | --- | --- |
| `/posts/post-2/`（英文） | `MP EN` | `MP Author` | `/` | `en` |
| `/tags/`（taxonomy 页） | `MP EN` | `MP Author` | `/` | `en` |

**你应当看到什么**：`.Site.Title` 取的是**当前语言**的标题（配置里 `[languages.en] title = 'MP EN'`），不是项目级的 `title = 'MP 测试站'`；`.Site.Home` 是当前语言的首页，`.Site.Language.Lang` 说明当前语言。切换到中文页面时，`.Site.Title` 会变成 `MP ZH`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 任意页面（含列表页） | 当前语言的 Site 对象 | 否 |
| `.Site.Title` | 当前语言标题（实测 `MP EN`） | 否 |
| `.Site.Params.*` | 站点参数（实测 `MP Author`） | 否 |
| `.Site.Home` | 当前语言首页的 Page 对象（`.Path` 为 `/`） | 否 |
| `.Site.Language.Lang` | 语言标识（实测 `en`） | 否 |
| 多语言 | 每个页面只看到**自己语言**的站点；要全部语言用 `hugo.Sites` | 否 |
| 返回类型 | `page.siteWrapper`（用法等同 `Site` 对象，见 [Site 方法][]） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[Site 方法]: /methods/site/
