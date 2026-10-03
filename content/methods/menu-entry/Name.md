+++
title = "Name"
linkTitle = "Name"
description = "返回给定菜单条目的 `name` 属性。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/menu-entry/name/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Name"]
returnType = "string"
+++

## 这一页解决什么问题

`Name` 是菜单模板里出现频率最高的方法：`<a>{{ .Name }}</a>` 里的那个显示文字。它的价值在于**回退链**——菜单条目往往只写了 `pageRef`，没写 `name`，这时 `Name` 会去页面上找 `LinkTitle`，再找 `Title`，所以你不必给每个条目都抄一遍文字。

## 什么时候用，什么时候别用

**该用**：

- 菜单链接的可见文字；
- 想在「条目没写 `name`」时自动用页面标题兜底。

**别用**：

- 需要稳定、唯一的键（翻译表、`parent` 对照）→ 用 [`Identifier`](/methods/menu-entry/identifier/) 或 [`KeyName`](/methods/menu-entry/keyname/)；
- 要填 `<a title="…">` 提示文字 → 用 [`Title`](/methods/menu-entry/title/)；它与 `Name` 的回退来源不同（`Title` 优先用条目的 `title`，再回退页面 `Title`，不看 `LinkTitle`）；
- 要页面标题本身 → 用 `.Page.Title`。

## 用法

如果[自动][]定义菜单条目，`Name` 方法返回该页面的 [`LinkTitle`][]，若不存在则回退到其 [`Title`][]。

如果在[前置元数据][front matter]或[项目配置][]中定义菜单条目，`Name` 方法返回给定菜单条目的 `name` 属性。如果未定义 `name`，且该菜单条目解析到某个页面，则 `Name` 返回该页面的 [`LinkTitle`][]，若不存在则回退到其 [`Title`][]。

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

## 完整示例：Name 从哪儿来

同一个页面 `/about` 的 `LinkTitle` 是 `About short`、`Title` 是 `About us`（`/services` 的 `Title` 是 `Our services`）。用到的四个菜单：

- `main`：三条都写了 `name`（`Services`、`About`、`Contact`）；
- `bare`：两条只写 `pageRef`（`/about`、`/services`），没有 `name`；
- `auto`：`content/auto-page.md` 的前置元数据 `menus = ['auto']`，该页 `linkTitle` 是 `Auto Short`；
- `idonly`：一条只写 `identifier = 'only-id'`，另一条写 `identifier = 'zed'` 加 `name = 'Zed'`。

```go-html-template
main：  {{ range site.Menus.main }}{{ .Name }},{{ end }}
bare：  {{ range site.Menus.bare }}{{ .Name }},{{ end }}
auto：  {{ range site.Menus.auto }}{{ .Name }},{{ end }}
idonly：{{ range site.Menus.idonly }}[{{ printf "%q" .Name }}],{{ end }}
```

实测输出：

```text
main：  Services,About,Contact,
bare：  About short,Our services,
auto：  Auto Short,
idonly：[""],["Zed"],
```

**你应当看到什么**：

- `main` 的条目都在配置里写了 `name`，原样输出；
- `bare` 的条目只写了 `pageRef`，于是拿到页面的 `LinkTitle`（`About short`）；
- `auto` 是前置元数据 `menus = ['auto']` 加入的条目，同样走 `LinkTitle`（`Auto Short`）；
- `idonly` 第一个条目**只写了 `identifier`**，既没有 `name` 也没解析到页面，`Name` 就是空字符串——链接会变成没有文字的空 `<a>`，这是模板里最容易被忽略的一种坏结果。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 条目的定义方式 | `.Name` | 是否报错 |
| --- | --- | --- |
| 有 `name` | 原样返回 | 否 |
| 无 `name`，解析到页面且页面有 `LinkTitle` | 页面 `LinkTitle`（实测 `"About short"`） | 否 |
| 无 `name`，解析到页面但没有 `LinkTitle` | 页面 `Title`（实测 `"Our services"`） | 否 |
| 无 `name`、无页面，但有 `identifier` | 空字符串（实测 `""`），不会退回 `identifier` | 否 |
| 外链条目（只有 `url` + `name`） | 该 `name`；若连 `name` 都没有则为空 | 否 |
| 返回类型 | `string`（可能为 `""`，不会 `nil`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 菜单里出现空白链接 | 条目只写了 `identifier`，没写 `name`，也没关联页面 | 补 `name`，或改用会回退到页面的写法（给 `pageRef`）；模板里可用 `{{ or .Name .Identifier .URL }}` 兜底 |
| 没报错但结果不对 | 菜单文案是页面标题，不是想要的短名 | 条目没写 `name`，回退到了页面 `LinkTitle`/`Title` | 在条目上显式写 `name`，或给页面加 `linkTitle` |
| 没报错但结果不对 | 多语言站点菜单文案不翻译 | `Name` 只读配置值 | 用翻译表：`{{ or (T (.KeyName \| lower)) .Name }}`，见 [`KeyName`](/methods/menu-entry/keyname/) |

更多排查入口见[故障排查](/troubleshooting/)。

[`LinkTitle`]: /methods/page/linktitle/
[`Title`]: /methods/page/title/
[自动]: /content-management/menus/#define-automatically
[front matter]: /content-management/menus/#define-in-front-matter
[项目配置]: /content-management/menus/#define-in-project-configuration
