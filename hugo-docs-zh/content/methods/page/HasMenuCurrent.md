+++
title = "HasMenuCurrent"
linkTitle = "HasMenuCurrent"
description = "报告给定 Page 对象是否匹配某个菜单项下的子菜单项所关联的 Page 对象。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/methods/page/hasmenucurrent/"
aliases = ["/functions/hasmenucurrent"]

[params.functions_and_methods]
signatures = ["PAGE.HasMenuCurrent MENU MENUENTRY"]
returnType = "bool"
+++

## 这一页解决什么问题

导航栏要区分三种状态：当前项（`active`）、当前页所属栏目的祖先项（`ancestor`）、以及普通项。`HasMenuCurrent` 负责第二种：当前页面是**某个菜单项所关联页面的后代**。它与 [`IsMenuCurrent`](/methods/page/ismenucurrent/) 是一对，通常写在同一个 `if / else if` 链里。

## 什么时候用，什么时候别用

**该用**：

- 导航里给「当前栏目」加高亮（例如访问 `/docs/guide/alpha/` 时高亮菜单项的「指南」或「文档」）；
- 需要区分「当前页就是菜单页」与「当前页属于菜单页之下」。

**别用**：

- 判断「当前页**就是**菜单项页面」→ 用 `IsMenuCurrent`；
- 菜单项没有关联页面（只写了 `url` 而没有 `pageRef`）→ 两个方法都无法匹配（上游 NOTE）；
- 只是想给当前页加高亮 → 比较 `.RelPermalink` 更直接。

## 用法

如果菜单项关联的 `Page` 对象是一个 section，那么对该 section 的任何后代页面，这个方法同样返回 `true`。

```go-html-template
{{ $currentPage := . }}
{{ range site.Menus.main }}
  {{ if $currentPage.IsMenuCurrent .Menu . }}
    <a class="active" aria-current="page" href="{{ .URL }}">{{ .Name }}</a>
  {{ else if $currentPage.HasMenuCurrent .Menu . }}
    <a class="ancestor" aria-current="true" href="{{ .URL }}">{{ .Name }}</a>
  {{ else }}
    <a href="{{ .URL }}">{{ .Name }}</a>
  {{ end }}
{{ end }}
```

完整示例见[菜单模板][]。

> [!NOTE]
> 使用这个方法时，你要么在前置元数据中定义菜单项，要么在项目配置中定义菜单项时指定 `pageRef` 属性。

## 完整示例：导航高亮当前栏目

最小站点：`hugo.toml` 里定义三个菜单项（`pageRef` 分别是 `/docs/guide`、`/docs`、`/posts`），页面 `content/docs/guide/alpha.md`。导航模板：

```go-html-template {file="layouts/_partials/nav.html"}
{{ $currentPage := . }}
<ul>
{{ range site.Menus.main }}
  {{ if $currentPage.IsMenuCurrent .Menu . }}<li class="active"><a aria-current="page" href="{{ .URL }}">{{ .Name }}</a></li>
  {{ else if $currentPage.HasMenuCurrent .Menu . }}<li class="ancestor"><a aria-current="true" href="{{ .URL }}">{{ .Name }}</a></li>
  {{ else }}<li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
{{ end }}
</ul>
```

`hugo --source <站点目录> --ignoreCache` 构建后，在 `alpha`（位于 `/docs/guide/` 下）上输出：

```html
<ul>
  <li class="ancestor"><a aria-current="true" href="/docs/guide/">指南</a></li>
  <li class="ancestor"><a aria-current="true" href="/docs/">文档</a></li>
  <li><a href="/posts/">文章</a></li>
</ul>
```

**你应当看到什么**：`alpha` 不是任何一个菜单项页面，但它是「指南」与「文档」两个 section 页的后代，所以两项都是 `ancestor`；「文章」既不是祖先也不是当前页。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；菜单项 `pageRef` 为 `/docs/guide`、`/docs`、`/posts`。

| 调用位置 | 指南 | 文档 | 文章 |
| --- | --- | --- | --- |
| 页面 `/docs/guide/alpha/` | `true` | `true` | `false` |
| section 页 `/docs/guide/` | `false` | `true` | `false` |
| section 页 `/docs/` | `false` | `false` | `false` |

规律：**当前页就是菜单项页面**时 `HasMenuCurrent` 为 `false`（那是 `IsMenuCurrent` 的职责）；当前页位于菜单项页面**之下**时为 `true`。返回类型是 `bool`。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 高亮不生效 | 所有菜单项都是普通样式 | 菜单项只配了 `url`，没有 `pageRef`，无法关联页面 | 在 `hugo.toml` 或前置元数据里加 `pageRef`（上游 NOTE） |
| 高亮层级不对 | 当前页所在栏目没有高亮 | 菜单里没有对应**祖先** section 的菜单项 | 为祖先 section 建菜单项 |
| 没报错但结果不对 | 在 `range` 里用 `.` 调用，结果全错 | 循环改变了上下文 | 循环前存 `{{ $currentPage := . }}`（如上游示例） |
| 两个方法都返回 true | 判断顺序导致样式混乱 | `IsMenuCurrent` 与 `HasMenuCurrent` 同时成立的情况（例如同一页面配了两项） | 先判断 `IsMenuCurrent`，再用 `else if` |

更多排查入口见[故障排查](/troubleshooting/)。

[菜单模板]: /templates/menu/#example

