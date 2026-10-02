+++
title = "IsMenuCurrent"
linkTitle = "IsMenuCurrent"
description = "报告给定 Page 对象是否匹配指定菜单中某个菜单项所关联的 Page 对象。"
date = 2026-10-02
weight = 320
source = "https://gohugo.io/methods/page/ismenucurrent/"
aliases = ["/functions/ismenucurrent"]

[params.functions_and_methods]
signatures = ["PAGE.IsMenuCurrent MENU MENUENTRY"]
returnType = "bool"
+++

## 这一页解决什么问题

导航栏要标出「你正在这一项」——这就是 `IsMenuCurrent`：当前页面**就是**该菜单项关联的页面时返回 `true`。它常与 [`HasMenuCurrent`](/methods/page/hasmenucurrent/) 写在同一段 `if / else if` 里，一个管当前项，一个管祖先项。

## 什么时候用，什么时候别用

**该用**：

- 给导航当前项加 `active` / `aria-current="page"`；
- 判断当前页面是否是某个菜单项的落点。

**别用**：

- 当前页位于菜单项页面**之下**（后代）时要高亮 → 用 `HasMenuCurrent`；
- 菜单项只写了 `url`、没有 `pageRef` → 两个方法都无法匹配（上游 NOTE）；
- 只想比较链接 → 直接比较 `.RelPermalink` 更简单。

## 用法

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

## 完整示例：当前项高亮

完整示例见[菜单模板][]。

> [!NOTE]
> 使用这个方法时，你要么在前置元数据中定义菜单项，要么在项目配置中定义菜单项时指定 `pageRef` 属性。

最小站点：`hugo.toml` 定义三个菜单项，`pageRef` 分别为 `/docs/guide`、`/docs`、`/posts`。导航模板：

```go-html-template {file="layouts/_partials/nav.html"}
{{ $currentPage := . }}
<ul>
{{ range site.Menus.main }}
  {{ if $currentPage.IsMenuCurrent .Menu . }}<li class="active" aria-current="page">{{ .Name }}</li>
  {{ else if $currentPage.HasMenuCurrent .Menu . }}<li class="ancestor" aria-current="true">{{ .Name }}</li>
  {{ else }}<li>{{ .Name }}</li>
  {{ end }}
{{ end }}
</ul>
```

`hugo --source <站点目录> --ignoreCache` 构建后，在 section 页 `/docs/guide/` 上输出：

```html
<ul>
<li class="active" aria-current="page">指南</li>
<li class="ancestor" aria-current="true">文档</li>
<li>文章</li>
</ul>
```

在普通页面 `/docs/guide/alpha/` 上输出：

```html
<ul>
<li class="ancestor" aria-current="true">指南</li>
<li class="ancestor" aria-current="true">文档</li>
<li>文章</li>
</ul>
```

**你应当看到什么**：只有**当前页面就是菜单项页面**时才出现 `active`；普通内容页不会有 `active`，因为它不是任何菜单项的落点，只会命中祖先项。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；菜单项 `pageRef` 为 `/docs/guide`、`/docs`、`/posts`。

| 调用位置 | 指南 | 文档 | 文章 |
| --- | --- | --- | --- |
| section 页 `/docs/guide/` | `true` | `false` | `false` |
| section 页 `/docs/` | `false` | `true` | `false` |
| 页面 `/docs/guide/alpha/` | `false` | `false` | `false` |

返回类型是 `bool`。注意普通内容页上三项都是 `false`——这正是需要 `HasMenuCurrent` 兜底的原因。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 当前项没有高亮 | 普通文章页上没有任何 `active` | 它不是菜单项页面，只有祖先项能命中 | 补 `HasMenuCurrent` 分支 |
| 所有页面都不高亮 | 菜单项只配了 `url` | 没有页面关联，两个方法都无法匹配 | 在菜单项上加 `pageRef`（上游 NOTE） |
| 没报错但结果不对 | 在 `range` 里直接写 `.IsMenuCurrent …` | 循环改变了上下文 | 循环前存 `{{ $currentPage := . }}` |
| 想用 `.Eq` 判断菜单项页面 | `active` 判断失效 | 菜单项的 `.Page` 可能为 nil | 用 `IsMenuCurrent`，不要自己比较 |

更多排查入口见[故障排查](/troubleshooting/)。

[菜单模板]: /templates/menu/#example
