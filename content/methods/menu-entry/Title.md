+++
title = "Title"
linkTitle = "Title"
description = "返回给定菜单条目的 `title` 属性。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/menu-entry/title/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Title"]
returnType = "string"
+++

## 这一页解决什么问题

菜单上显示的短名（[`Name`](/methods/menu-entry/name/)）和鼠标悬停时想给出的完整说明，往往不是一回事：导航里写「关于」，提示里想写「关于我们与团队」。`title` 属性就是给条目补这层说明的，`Title` 方法负责把它读出来。

没有写 `title` 时，它会退回**条目的页面**的 `Title`（不是 `LinkTitle`）。所以这个方法的典型用法是填 `<a title="…">`：写了就用自己的，没写就用页面标题兜底。

## 什么时候用，什么时候别用

**该用**：

- `<a title="…">` 提示文字、`aria-label`、图片 `alt` 的备选文案；
- 想让提示文字默认跟随页面标题，只在个别条目上覆盖。

**别用**：

- 要显示在菜单上的文字 → 用 [`Name`](/methods/menu-entry/name/)；`Name` 的回退链是 `LinkTitle` → `Title`，与 `Title` 方法不同；
- 要稳定的键 → 用 [`Identifier`](/methods/menu-entry/identifier/) 或 [`KeyName`](/methods/menu-entry/keyname/)；
- 要页面标题本身 → 用 `.Page.Title`（`Title` 方法与它在「条目没写 `title`」时结果相同，但前者多一次页面查找）。

## 用法

`Title` 方法返回给定菜单条目的 `title` 属性。如果未定义 `title`，且该菜单条目解析到某个页面，则 `Title` 返回该页面的 [`Title`][]。

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ .URL }}" title="{{ .Title }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

> [!NOTE]
> 上游原文的示例少了 `title` 属性右引号（`title="{{ .Title }}>`），照抄会得到非法 HTML；上面的写法是补好引号的结果，实测按上面这样渲染。

## 完整示例：写了 title 与没写 title

用到的两个菜单：`main` 的三条（`Services`/`About`/`Contact`）都没写 `title`，它们指向的页面标题分别是 `Our services`、`About us`、`Contact us`；`meta` 的第一条写了 `title = 'About title'`，第三条是只写 `url` 的外链。

```go-html-template
main：{{ range site.Menus.main }}[{{ .Name }} title={{ printf "%q" .Title }}]{{ end }}
meta：{{ range site.Menus.meta }}[{{ .Name }} title={{ printf "%q" .Title }}]{{ end }}
```

实测输出：

```text
main：[Services title="Our services"] [About title="About us"] [Contact title="Contact us"]
meta：[About title="About title"] [Contact title="Contact us"] [Hugo title=""]
```

**你应当看到什么**：`main` 的三个条目都没写 `title`，于是各自拿到页面标题（`Our services` 等）；`meta` 的 `About` 写了 `title`，原样输出；外链条目 `Hugo` 没有关联页面，也没有 `title`，结果是空字符串——直接写进 `title=""` 是合法的，但等于没有提示。

完整渲染成锚点元素：

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ .URL }}" title="{{ .Title }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

实测输出（`range` 留下的空行已省略）：

```html
<ul>
  <li><a href="/services/" title="Our services">Services</a></li>
  <li><a href="/about/" title="About us">About</a></li>
  <li><a href="/contact/" title="Contact us">Contact</a></li>
</ul>
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 条目写了 `title` | 原样返回（实测 `"About title"`） | 否 |
| 条目没写 `title`，解析到页面 | 页面 `Title`（实测 `"Our services"`、`"About us"`） | 否 |
| 条目没写 `title`，也没有页面（外链、或 `pageRef` 找不到） | 空字符串 `""`（实测外链条目 `Hugo`） | 否 |
| 条目只写了 `identifier` | 空字符串（不会退回 `identifier`） | 否 |
| 返回类型 | `string`（可能为 `""`，不会 `nil`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `title` 提示显示成页面名字，不是想要的说明 | 条目没写 `title`，回落到了页面 `Title` | 在该条目上显式写 `title` |
| 没报错但结果不对 | 菜单文字显示的是页面标题而不是短名 | 把 `Title` 用在了可见文字上 | 可见文字用 [`Name`](/methods/menu-entry/name/)，`Title` 留给属性 |
| 报错/异常输出 | 产物里 `title` 属性把后面的内容都吞了 | 从上游示例照抄时漏了引号（`title="{{ .Title }}>`） | 补上右引号：`title="{{ .Title }}">` |

更多排查入口见[故障排查](/troubleshooting/)。

[`Title`]: /methods/page/title/
