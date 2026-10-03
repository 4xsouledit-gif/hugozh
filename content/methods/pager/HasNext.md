+++
title = "HasNext"
linkTitle = "HasNext"
description = "报告当前分页器之后是否还有分页器。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/pager/hasnext/"

[params.functions_and_methods]
signatures = ["PAGER.HasNext"]
returnType = "bool"
+++

## 这一页解决什么问题

`HasNext` 报告当前分页器**之后**是否还有分页器——最后一页为 `false`，其余页为 `true`（实测 3 页的站点上分别是 `true`、`true`、`false`）。它回答的是「要不要渲染『下一页』按钮」，而 [`Next`](/methods/pager/next/) 回答的是「下一页在哪」。

两者配合使用最稳：`{{ if .HasNext }}` 里再取 `{{ .Next.URL }}`——实测这样写不会碰到 nil。它与 `{{ with .Next }}` 效果等价，上游两段示例都保留。

## 什么时候用，什么时候别用

**该用**：

- 决定是否渲染「下一页」按钮；
- 判断当前是否已经在最后一页（末页为 `false`）。

**别用**：

- 需要下一页的地址或编号 → 用 [`Next`](/methods/pager/next/)（但要自己防 nil）；
- 判断是否为最后一页却用 [`Last`](/methods/pager/last/) → 它永远有值，判断不出来；
- 想数页数 → 用 [`TotalPages`](/methods/pager/totalpages/)。

## 基本用法

使用 `HasNext` 方法在分页器之间构建导航。

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  <ul>
    {{ with .First }}
      <li><a href="{{ .URL }}">First</a></li>
    {{ end }}
    {{ if .HasPrev }}
      <li><a href="{{ .Prev.URL }}">Previous</a></li>
    {{ end }}
    {{ if .HasNext }}
      <li><a href="{{ .Next.URL }}">Next</a></li>
    {{ end }}
    {{ with .Last }}
      <li><a href="{{ .URL }}">Last</a></li>
    {{ end }}
  </ul>
{{ end }}
```

也可以不使用 `HasNext` 方法，写成下面这样：

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  <ul>
    {{ with .First }}
      <li><a href="{{ .URL }}">First</a></li>
    {{ end }}
    {{ with .Prev }}
      <li><a href="{{ .URL }}">Previous</a></li>
    {{ end }}
    {{ with .Next }}
      <li><a href="{{ .URL }}">Next</a></li>
    {{ end }}
    {{ with .Last }}
      <li><a href="{{ .URL }}">Last</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：用 `HasNext` 控制「下一页」按钮

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}
<nav>
  {{ if $paginator.HasPrev }}<a href="{{ $paginator.Prev.URL }}">上一页</a>{{ end }}
  {{ if $paginator.HasNext }}<a href="{{ $paginator.Next.URL }}">下一页</a>{{ end }}
</nav>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`，`[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。三个分页页分别渲染为（`if` 会留下空行，这里省略）：

```html
<nav>
  <a href="/page/2/">下一页</a>
</nav>
```

```html
<nav>
  <a href="/">上一页</a>
  <a href="/page/3/">下一页</a>
</nav>
```

```html
<nav>
  <a href="/page/2/">上一页</a>
</nav>
```

**你应当看到什么**：末页没有「下一页」。实测这段模板与用 `{{ with .Prev }}` / `{{ with .Next }}` 写出来的产物**逐字节相同**；两种写法都安全，`HasNext` 更直白地表达「还有没有下一页」。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 第 1、2 页 | `true` | 否 |
| 第 3 页（最后一页） | `false` | 否 |
| 单页分页（7 条、每页 100） | `false` | 否 |
| 空集合分页 | `false` | 否 |
| 在 `if` 里访问 `{{ .Next.URL }}` | 为真时才求值，实测安全，不会碰到 nil | 否 |
| 返回类型 | `bool`，永远不是 `nil`，不会因缺少下一页而报错 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `Next is nil; wrap it in if or with: {{ with .Next }}{{ .URL }}{{ end }}` | 在 `if`/`with` 之外直接取了 `.Next.URL` | 放进 `{{ if .HasNext }}` 或 `{{ with .Next }}` 里 |
| 没报错但结果不对 | 末页也渲染出「下一页」 | 把 `HasNext` 与 `HasPrev` 写反了 | 打印 `{{ .HasPrev }} {{ .HasNext }}` 核对：末页应为 `true false` |
| 没报错但结果不对 | 只有一页内容时也显示分页条 | 单页分页时两个布尔都是 `false`，但导航容器仍渲染了 | 用 [`TotalPages`](/methods/pager/totalpages/) 判断要不要渲染整个容器 |
| 没报错但结果不对 | 用 `{{ with .Last }}` 判断末页，永远进分支 | `.Last` 永远有值 | 用 `HasNext` 或比较 `PageNumber` 与 `TotalPages` |

更多排查入口见[故障排查](/troubleshooting/)。
