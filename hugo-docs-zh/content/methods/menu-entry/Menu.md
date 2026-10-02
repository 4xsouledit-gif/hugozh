+++
title = "Menu"
linkTitle = "Menu"
description = "返回包含给定菜单条目的菜单标识符。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/menu-entry/menu/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Menu"]
returnType = "string"
+++

## 这一页解决什么问题

一个站点的菜单常常不止一个：`main` 是主导航，`footer` 是页脚，`social` 是社交链接。如果把它们交给同一个局部模板渲染，模板就得知道「我现在渲染的是哪个菜单」——例如给页脚菜单加上 `class="footer-nav"`。

`Menu` 就是条目自己携带的答案：返回它所属菜单的标识符（配置里 `[[menus.footer]]` 的 `footer`）。

## 什么时候用，什么时候别用

**该用**：

- 一个局部模板服务多个菜单，需要按菜单名切换结构或 class；
- 排查「这个条目到底进了哪个菜单」——尤其是同一个页面被加进多个菜单时。

**别用**：

- 想判断「当前页面是否属于这个菜单」、给当前项加 `active` → 用页面上的 [`IsMenuCurrent`](/methods/page/ismenucurrent/) / [`HasMenuCurrent`](/methods/page/hasmenucurrent/)（下文示例就是它们的准备步骤）；
- 想拿菜单里的条目 → 直接 `site.Menus.<名字>`；
- 想拿条目是第几个 → 交给 [`Weight`](/methods/menu-entry/weight/) 或 `range` 的下标。

## 用法

```go-html-template
{{ range .Site.Menus.main }}
  {{ .Menu }} → main
{{ end }}
```

把该方法与 `Page` 对象上的 [`IsMenuCurrent`][] 和 [`HasMenuCurrent`][] 方法配合使用，可以为渲染出的条目设置 "active" 和 "ancestor" 类。参见[这个示例][]。

## 完整示例：按菜单名分派样式

用到的三个菜单分别来自：`main`（项目配置，`Services`/`About`/`Contact`，weight 10/20/30）、`auto`（`content/auto-page.md` 的前置元数据 `menus = ['auto']`）、`fm`（`content/fm-page.md` 的前置元数据 `[menus.fm]`）。

```go-html-template
{{ range site.Menus.main }}[{{ .Name }} Menu={{ printf "%q" .Menu }}]{{ end }}
{{ range site.Menus.auto }}[{{ .Name }} Menu={{ printf "%q" .Menu }}]{{ end }}
{{ range site.Menus.fm }}[{{ .Name }} Menu={{ printf "%q" .Menu }}]{{ end }}
```

实测输出：

```text
[Services Menu="main"] [About Menu="main"] [Contact Menu="main"]
[Auto Short Menu="auto"]
[From FM Menu="fm"]
```

三层菜单都返回了自己的菜单名：项目配置里定义的 `main`、前置元数据 `menus = ['auto']` 加入的 `auto`、以及前置元数据 `[menus.fm]` 定义的 `fm`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 条目的定义方式 | `.Menu` | 是否报错 |
| --- | --- | --- |
| 项目配置里的 `[[menus.main]]` | `"main"` | 否 |
| 页面前置元数据 `menus = ['auto']` | `"auto"` | 否 |
| 页面前置元数据的 `[menus.fm]` 表 | `"fm"` | 否 |
| 项目配置 `sectionPagesMenu = 'autosec'` 自动生成的条目 | **空字符串**（实测；条目确实在 `site.Menus.autosec` 里，URL 与 Page 都正常） | 否 |
| 返回类型 | `string` | 否 |

最后一行值得记住：**自动生成的 section 菜单条目拿不到自己的菜单名**。如果局部模板依赖 `Menu` 分派样式，不要对这类条目抱期望——要么给它们换成显式定义，要么在模板里自行判断入口。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 自动生成的 section 菜单在模板里 class 为空 | 实测 `sectionPagesMenu` 条目的 `.Menu` 是空字符串 | 模板里给个兜底：`{{ with .Menu }}{{ . }}{{ else }}main{{ end }}`，或改用显式菜单定义 |
| 没报错但结果不对 | 当前页高亮不生效 | `Menu` 只给菜单名，不做「当前页」判断 | 用 [`IsMenuCurrent`](/methods/page/ismenucurrent/) / [`HasMenuCurrent`](/methods/page/hasmenucurrent/) |
| 没报错但结果不对 | 以为 `Menu` 返回菜单对象 | 它返回的是 `string` | 要对象就用 `site.Menus.main` 本身 |

更多排查入口见[故障排查](/troubleshooting/)。

[`HasMenuCurrent`]: /methods/page/hasmenucurrent/
[`IsMenuCurrent`]: /methods/page/ismenucurrent/
[这个示例]: /templates/menu/#example
