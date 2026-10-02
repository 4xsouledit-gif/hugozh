+++
title = "Site"
linkTitle = "Site"
description = "返回 Site 对象。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/shortcode/site/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Site"]
returnType = "page.siteWrapper"
+++

## 这一页解决什么问题

短代码经常需要**站点级**的数据：站点标题、语言、站点参数、菜单、全部页面。点号（`.`）是短代码对象，拿不到这些，`Site` 方法把 Site 对象交给你。

它和页面模板里那个全局 `site` 是同一个东西——区别只是短代码上下文不会自动暴露它，得显式取一次。

## 什么时候用，什么时候别用

**该用**：

- 需要站点标题、`site.Params.*`、`site.Language.*`、`site.Menus.*`；
- 需要遍历 `site.RegularPages`、`site.Sections` 等全站集合；
- 短代码要在多个站点/语言下表现一致（读站点配置而不是硬编码）。

**别用**：

- 拿**当前页面**的数据（标题、前置元数据、资源）→ 用 [`Page`](/methods/shortcode/page/)；
- 拿父短代码的参数 → 用 [`Parent`](/methods/shortcode/parent/)；
- 在页面模板里（而不是短代码模板里）→ 直接用全局 `site` 对象或用页面方法，不必经短代码上下文。

参见 [Site 方法][]。

```go-html-template
{{ .Site.Title }}
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点（`title = 'Method Lab'`，单语言 `en`），短代码被调用在 `content/scdoc.md` 中。

```go-html-template {file="layouts/_shortcodes/site-demo.html"}
<p>Site 标题：{{ .Site.Title }}</p>
<p>Site 语言：{{ .Site.Language.Lang }}</p>
<p>当前页面：{{ .Page.Title }}（{{ .Page.Kind }}）</p>
```

```md {file="content/scdoc.md"}
{{</* site-demo */>}}
```

Hugo 渲染为（实测）：

```html
<p>Site 标题：Method Lab</p>
<p>Site 语言：en</p>
<p>当前页面：SC Doc（page）</p>
```

**你应当看到什么**：前两行数据来自**站点配置**（同一页面上无论调用哪个短代码都一样）；第三行来自 [`Page`](/methods/shortcode/page/)，随页面变化。把 `.Site` 与 `.Page` 放在一起看，就能分清「站点级」与「页面级」数据。

`.Site` 的完整方法列表见 [Site 方法][]——它包含 `.Site.Title`、`.Site.Language`、`.Site.Params`、`.Site.Menus`、`.Site.RegularPages`、`.Site.Home` 等。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 常规短代码调用 | 可用的 Site 对象（实测 `Title`、`Language.Lang` 均可读） | 否 |
| 站点配置里没有的参数 | 空值，`with` 判为假 | 否 |
| 多语言站点 | 返回**当前语言**的站点对象（`site.Language.Lang` 为当前语言）；本站未实测多语言行为 | —— |
| 在 `with`/`range` 块内写 `.Site` | 点号已被改写 | 需改用 `$.Site` |
| 返回类型 | `page.siteWrapper` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `can't evaluate field Title in type *hugolib.ShortcodeWithPage` | 直接写了 `.Title`（那是短代码对象） | 站点标题用 `.Site.Title`，页面标题用 `.Page.Title` |
| 没报错但结果不对 | `with` 块里站点标题为空 | 块内点号被改写 | 用 `$.Site.Title` |
| 没报错但结果不对 | 多语言站点里读到了另一种语言的数据 | 没有意识到 `.Site` 跟着当前语言走 | 明确要哪一语言时用 `site.Sites` 系列方法（见 [Site 方法][]） |
| 性能 | 在循环里反复读 `site.RegularPages` | 每次都触发集合构建 | 循环外先存进变量：`{{ $pages := .Site.RegularPages }}` |

更多排查入口见[故障排查](/troubleshooting/)。

[Site 方法]: /methods/site/
