+++
title = "Param"
linkTitle = "Param"
description = "返回具有给定 key 的页面参数；若页面中没有，则回退到站点参数。"
date = 2026-10-02
weight = 510
source = "https://gohugo.io/methods/page/param/"

[params.functions_and_methods]
signatures = ["PAGE.Param KEY"]
returnType = "any"
+++

## 这一页解决什么问题

主题作者经常把「可配置的开关」放在站点参数里，再让内容作者在单页上覆盖它。`.Param` 就是这条回退链的实现：**先查页面参数，再查站点参数，都没有就返回 `nil`**。

它和 [`.Params`](/methods/page/params/) 的区别就在这里——`.Params` 只是页面前置元数据的映射，**不会**回退到站点参数。

## 什么时候用，什么时候别用

**该用**：

- 「站点级默认 + 页面级覆盖」的开关/文案（如 `display_toc`、`author`、`color`）；
- 想要一次调用就完成「页面 → 站点」查找。

**别用**：

- 只想读页面前置元数据的映射 → 用 [`.Params`](/methods/page/params/)（可 `range`、可 `index`）；
- 想忽略 falsy 值（把 `false`、`0`、`""` 也当作「没设置」）→ 用 `{{ or .Params.foo site.Params.foo }}`（上游给了这个写法）；
- 想访问带连字符的 key → `.Param "key-with-hyphens"` 可以，但 `.Params` 上要用 `index`；
- 想知道参数到底存不存在 → 用 `isset`，别用 `.Param` 的返回值判断（`nil` 与「显式设成 false」分不开）。

## 用法

`Page` 对象上的 `Param` 方法会在页面参数中查找给定的 `KEY`，并返回对应的值。如果在页面参数中找不到该 `KEY`，它会到站点参数中查找。如果两处都找不到，`Param` 方法返回 `nil`。

站点和主题开发者通常会在站点层面设置参数，从而让内容作者可以在页面层面覆盖这些参数。

例如，要在每个页面上显示目录，同时允许作者按需隐藏目录：

配置：

```toml
[params]
display_toc = true
```

内容：

```toml
title = 'Example'
date = 2023-01-01
draft = false
[params]
display_toc = false
```

模板：

```go-html-template
{{ if .Param "display_toc" }}
  {{ .TableOfContents }}
{{ end }}
```

`Param` 方法返回与给定 `KEY` 关联的值，无论该值是 truthy 还是 falsy。如果你需要忽略 falsy 值，请改用下面这种写法：

```go-html-template
{{ or .Params.foo site.Params.foo }}
```

## 完整示例：页面覆盖站点默认值

测试站配置：

```toml
[params]
author = 'MP Author'
color = 'site-color'
```

两个内容文件：

```toml
# content/posts/post-1.md
[params]
color = "red"
price = 42
```

```toml
# content/posts/post-1.zh.md（中文版，没有 color）
```

模板：

```go-html-template {file="layouts/_default/single.html"}
<p>color = {{ .Param "color" }}</p>
<p>author = {{ .Param "author" }}</p>
<p>price = {{ printf "%v" (.Param "price") }}</p>
<p>nope = {{ printf "%v" (.Param "nope") }}</p>
```

实测（Hugo 0.167.0）：

| 渲染的页面 | `color` | `author` | `price` | `nope` |
| --- | --- | --- | --- | --- |
| `/posts/first-post/`（英文，页面里设了 `color = "red"`） | `red` | `MP Author` | `42` | `<nil>` |
| `/zh/posts/post-1/`（中文版，页面里没有 `color`） | `site-color` | `MP Author` | `<nil>` | `<nil>` |

**你应当看到什么**：同一个 `key`，英文页拿到页面级 `red`，中文页回退到站点级 `site-color`；`author` 两页都来自站点；两个都没有的 `price`、`nope` 得到 `nil`。这就是「页面 → 站点 → nil」的完整回退链。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面参数里有该 key | 返回页面值（实测 `red`、`42`） | 否 |
| 页面参数没有、站点参数有 | 返回站点值（实测 `site-color`、`MP Author`） | 否 |
| 两处都没有 | `nil`（实测打印为 `<nil>`；直接 `{{ .Param "nope" }}` 输出空） | 否 |
| 值为 `false` / `0` / `""` | 原样返回（上游已说明：不看 truthy/falsy） | 否 |
| 想忽略 falsy | 用 `{{ or .Params.foo site.Params.foo }}` | 否 |
| 页面参数与站点参数同名 | 页面优先 | 否 |
| 返回类型 | `any`（取决于命中的值） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
