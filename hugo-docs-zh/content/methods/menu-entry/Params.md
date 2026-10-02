+++
title = "Params"
linkTitle = "Params"
description = "返回给定菜单条目的 `params` 属性。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/menu-entry/params/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Params"]
returnType = "maps.Params"
+++

## 这一页解决什么问题

菜单条目的内置属性只有 `name`、`url`、`weight`、`pre`、`post` 等几个。想给某个条目添加额外信息——要不要 `rel="external"`、配哪个图标、加什么 CSS class、要不要在新窗口打开——标准做法是给条目挂一个 `params` 表，再用 `Params` 读出来。

它返回一个 `maps.Params`（映射）。**读懂本页的诀窍**：没定义 `params` 时它不是 `nil` 而是空映射，但取一个不存在的键（`.Params.rel`）会得到 `nil`，所以取值一律用 `with` 或 `if` 包住。

## 什么时候用，什么时候别用

**该用**：

- 条目的附加数据：`rel`、`target`、`icon`、`class`、`badge` 之类；
- 同一个模板要按条目差异输出不同属性，例如「外链加 `rel="external"`」。

**别用**：

- 想读**页面**的参数 → 用 `.Page.Params`（条目参数与页面参数互不相干）；
- 想读**站点**参数 → 用 `site.Params`；
- 想给整站所有菜单条目统一加数据 → 那是站点参数或模板逻辑的事，不必逐条写 `params`；
- 想按参数筛选/排序菜单 → `Params` 是映射，菜单方法只认 `weight`/`name`，需要自己 `range` 加 `if`。

## 用法

在[项目配置][]或[前置元数据][front matter]中定义菜单条目时，可以加入 `params` 键，为条目附加额外信息。例如：

```toml
[[menus.meta]]
name = 'About'
pageRef = '/about'
weight = 10

[[menus.meta]]
name = 'Contact'
pageRef = '/contact'
weight = 20

[[menus.meta]]
name = 'Hugo'
url = 'https://gohugo.io'
weight = 30

[menus.meta.params]
  rel = 'external'
```

使用下面的模板：

```go-html-template
<ul>
  {{ range .Site.Menus.meta }}
    <li><a href="{{ .URL }}"{{ with .Params.rel }} rel="{{ . }}"{{ end }}>{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染出（实测，`range` 留下的空行已省略）：

```html
<ul>
  <li><a href="/about/">About</a></li>
  <li><a href="/contact/">Contact</a></li>
  <li><a href="https://gohugo.io" rel="external">Hugo</a></li>
</ul>
```

更多信息请参见[菜单模板][menu templates]一节。

## 完整示例：有参数与没参数的条目

```go-html-template
{{ range site.Menus.meta }}[{{ .Name }}：{{ if .Params.rel }}有 rel={{ .Params.rel }}{{ else }}没有 rel{{ end }}，整表={{ printf "%v" .Params }}]{{ end }}
```

实测输出：

```text
[About：没有 rel，整表=map[]] [Contact：没有 rel，整表=map[]] [Hugo：有 rel=external，整表=map[rel:external]]
```

**你应当看到什么**：没写 `params` 的两个条目，`.Params` 是**空映射**（`map[]`）而不是 `nil`；取 `.Params.rel` 得到 `nil`，`if` 判为假，于是 `rel` 属性根本不输出——这正是 `{{ with .Params.rel }}` 的用法要点。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 条目写了 `params` 表 | 该映射（实测 `map[rel:external]`） | 否 |
| 条目没写 `params` | 空映射，`printf "%v"` 显示 `map[]`；`range` 不进入循环 | 否 |
| 取不存在的键（`.Params.rel`） | `nil`：`if`/`with` 判为假；若硬用 `printf "%q"` 会输出 `%!q(<nil>)` | 否 |
| 参数值类型 | 由 TOML/YAML 决定（字符串、布尔、数字、数组、嵌套表都可以） | 否 |
| 返回类型 | `maps.Params`（实测类型名 `hmaps.Params`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 产物里出现 `rel=""` 或 `%!q(<nil>)` | 直接输出 `.Params.x`，没有判断是否存在 | 用 `{{ with .Params.rel }}rel="{{ . }}"{{ end }}` |
| 没报错但结果不对 | 在条目上读页面参数读不到 | 条目 `params` 与页面 `params` 是两套 | 需要页面参数就用 `.Page.Params.x` |
| 没报错但结果不对 | `params` 写了但模板取不到 | TOML 表头位置写错：`[menus.meta.params]` 必须写在对应 `[[menus.meta]]` 之后 | 把 `[menus.<菜单名>.params]` 紧跟在该条目定义之后 |

更多排查入口见[故障排查](/troubleshooting/)。

[front matter]: /content-management/menus/#define-in-front-matter
[menu templates]: /templates/menu/#menu-entry-parameters
[项目配置]: /content-management/menus/
