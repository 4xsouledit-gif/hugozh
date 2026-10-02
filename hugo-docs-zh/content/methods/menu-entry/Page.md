+++
title = "Page"
linkTitle = "Page"
description = "返回与给定菜单条目关联的 Page 对象。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/menu-entry/page/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Page"]
returnType = "page.Page"
+++

## 这一页解决什么问题

菜单条目有两种：**指向站内页面**的（写了 `pageRef`，或由页面自动生成）和**指向站外或其他地址**的（只写了 `url`）。前者可以顺着条目拿到那个页面对象，进而使用页面的全部方法——`.RelPermalink`、`.Title`、`.Section`、`.Params`、`.Summary`……

`Page` 就是这座桥：返回与条目关联的 `Page` 对象；没有关联（或是 `pageRef` 没找到页面）时返回 `nil`。

**读懂本页的诀窍**：只要用了 `.Page`，就用 `with` 包住。`nil` 时 `with` 会自动走 `else` 分支——这正是区分「页面条目」与「外链条目」的标准写法。

## 什么时候用，什么时候别用

**该用**：

- 菜单项要显示页面的某个属性，而不是条目上的文字：`{{ .Page.Section }}`、`{{ .Page.Summary }}`、`{{ .Page.Params.icon }}`；
- 要判断这个条目是不是「站内页面条目」，并据此用不同的模板分支；
- 配合 [`IsMenuCurrent`](/methods/page/ismenucurrent/) / [`HasMenuCurrent`](/methods/page/hasmenucurrent/) 做当前页高亮（它们作用在 `.Page` 上）。

**别用**：

- 只想拿一个能填进 `href` 的地址 → 用 [`URL`](/methods/menu-entry/url/)：它已经替你处理了「页面用永久链接、外链用 `url`」两种情况；
- 想拿配置里写的 `pageRef` 字符串 → 用 [`PageRef`](/methods/menu-entry/pageref/)；
- 想拿菜单文案 → 用 [`Name`](/methods/menu-entry/name/)。

## 用法

无论你如何[定义菜单条目][define menu entries]，与页面关联的条目都可以访问该页面的[方法][methods]。

在下面的菜单定义中，前两个条目与页面关联，最后一个没有：

```toml
[[menus.pagedemo]]
pageRef = '/about'
weight = 10

[[menus.pagedemo]]
pageRef = '/contact'
weight = 20

[[menus.pagedemo]]
name = 'Hugo'
url = 'https://gohugo.io'
weight = 30
```

在下面的示例中，如果菜单条目与页面关联，渲染锚点元素时使用页面的 [`RelPermalink`][] 和 [`LinkTitle`][]。

如果条目未与页面关联，则使用它的 `url` 和 `name` 属性。

```go-html-template
<ul>
  {{ range .Site.Menus.pagedemo }}
    {{ with .Page }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ else }}
      <li><a href="{{ .URL }}">{{ .Name }}</a></li>
    {{ end }}
  {{ end }}
</ul>
```

Hugo 渲染结果为（实测，`range` 留下的空行已省略）：

```html
<ul>
  <li><a href="/about/">About us</a></li>
  <li><a href="/contact/">Contact us</a></li>
  <li><a href="https://gohugo.io">Hugo</a></li>
</ul>
```

前两行来自页面（`.RelPermalink` 与页面 `Title`），第三行来自条目的 `url` 与 `name`。

更多信息请参见[菜单模板][menu templates]一节。

## 完整示例：一眼看出哪些条目是 nil

```go-html-template
{{ range site.Menus.pagedemo }}{{ .Name }}:Page={{ with .Page }}{{ .RelPermalink }}{{ else }}nil{{ end }} | {{ end }}
```

实测输出：

```text
About short:Page=/about/ | Contact us:Page=/contact/ | Hugo:Page=nil |
```

**你应当看到什么**：外链条目的 `.Page` 是 `nil`，`with` 走到了 `else`。注意前两个条目在配置里没写 `name`，所以 `.Name` 显示的是页面的 `LinkTitle`——但它们**确实有** `.Page`，两者互不影响。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 条目的定义方式 | `.Page` | 是否报错 |
| --- | --- | --- |
| `pageRef` 指向存在的页面 | 该页面对象（可继续用 `.RelPermalink`、`.Title`、`.Section` 等） | 否 |
| 只有 `url` 的外链条目 | `nil` | 否 |
| `pageRef` 指向不存在的页面 | `nil`（见 [`PageRef`](/methods/menu-entry/pageref/) 的实测） | 否 |
| 既没有 `pageRef` 也没有 `url` | `nil` | 否 |
| 用 `{{ with .Page }}` 包住 | `nil` 时走 `else`，不报错 | 否 |
| 直接对 `nil` 取 `.Page.Title` | —— | 是：会渲染失败报 `nil pointer evaluating navigation.Page.Title`；务必用 `with` 或 `if` |
| 返回类型 | `page.Page`（接口；实测 `printf "%T"` 得到具体类型 `*hugolib.pageState`，为 `nil` 时错误信息写作 `navigation.Page`——不要对它做类型断言） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `nil pointer evaluating navigation.Page.Title` | 外链条目没有页面，`.Page` 是 `nil` | 用 `{{ with .Page }}…{{ else }}…{{ end }}` |
| 没报错但结果不对 | 外链条目的 `href` 变空 | 在 `with .Page` 分支里对外链也用了 `.RelPermalink` | 外链分支改用 `.URL` 与 `.Name` |
| 没报错但结果不对 | 页面条目却拿不到 `.Page` | 条目用的是 `url`（不是 `pageRef`），或 `pageRef` 没匹配到页面 | 改成 `pageRef`，并核对路径；见 [`PageRef`](/methods/menu-entry/pageref/) |

更多排查入口见[故障排查](/troubleshooting/)。

[`LinkTitle`]: /methods/page/linktitle/
[`RelPermalink`]: /methods/page/relpermalink/
[define menu entries]: /content-management/menus/
[menu templates]: /templates/menu/#page-references
[methods]: /methods/page/
