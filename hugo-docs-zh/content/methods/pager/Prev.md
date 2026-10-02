+++
title = "Prev"
linkTitle = "Prev"
description = "返回分页器集合中的上一个分页器。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/methods/pager/prev/"

[params.functions_and_methods]
signatures = ["PAGER.Prev"]
returnType = "page.Pager"
+++

## 这一页解决什么问题

`Prev` 返回**页码相邻的上一个分页器**（页码更小的那个）：实测第 2 页的 `.Prev` 是第 1 页（`/`），第 3 页的 `.Prev` 是第 2 页（`/page/2/`）。**在第 1 页上它是 `nil`**——这是本章最容易踩的边界：不加保护会直接让整个站点构建失败，而不是少渲染一个链接。

## 什么时候用，什么时候别用

**该用**：

- 生成「上一页」链接，用 `{{ with }}` 或 [`HasPrev`](/methods/pager/hasprev/) 保护；
- 需要上一页的编号或地址：`$paginator.Prev.PageNumber`、`$paginator.Prev.URL`。

**别用**：

- 想跳到第一页 → 用 [`First`](/methods/pager/first/)（它永远有值）；
- 想跳到任意一页 → 用 [`Pagers`](/methods/pager/pagers/)；
- 想要**文章**的上一篇 → 用 Page 的 [`Prev`](/methods/page/prev/)：同名方法在两处的语义完全不同（一处是页码相邻，一处是文章上下篇）。

## 基本用法

使用 `Prev` 方法在分页器之间构建导航。

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

## 完整示例：上一页 / 下一页（首页自动隐藏「上一页」）

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}
<nav>
  {{ with $paginator.Prev }}<a href="{{ .URL }}">上一页</a>{{ end }}
  {{ with $paginator.Next }}<a href="{{ .URL }}">下一页</a>{{ end }}
</nav>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`，`[pagination] pagerSize = 3`，`baseURL = "https://example.org/"`。

`/`（第 1 页）渲染为（`with` 会留下空行，这里省略）：

```html
<nav>
  <a href="/page/2/">下一页</a>
</nav>
```

`/page/2/` 渲染为：

```html
<nav>
  <a href="/">上一页</a>
  <a href="/page/3/">下一页</a>
</nav>
```

`/page/3/`（最后一页）渲染为：

```html
<nav>
  <a href="/page/2/">上一页</a>
</nav>
```

**你应当看到什么**：两端各少一个链接——`.Prev` 在第 1 页、`.Next` 在最后一页是 `nil`，`{{ with }}` 把它们跳过了。注意第 1 页的地址是 `/`、第 2 页是 `/page/2/`，不要自己拼 `/page/1/`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 第 1 页 | **nil**（`with` 判为假，整段跳过） | 否（前提是加了 `with`/`if`） |
| 第 2 页 | 第 1 页的 pager：`URL` 为 `/`、`PageNumber` 为 1 | 否 |
| 第 3 页 | 第 2 页的 pager：`URL` 为 `/page/2/`、`PageNumber` 为 2 | 否 |
| 单页分页（7 条、每页 100） | nil | 否 |
| 空集合分页 | nil | 否 |
| **不加保护直接取 `.URL`（第 1 页）** | 构建中断，不产出页面 | **是**：`Prev is nil; wrap it in if or with: {{ with .Prev }}{{ .URL }}{{ end }}` |
| 返回类型 | `page.Pager`，**可能是 nil** | — |

两栏对照着记：`{{ with .Prev }}` 与 `{{ if .HasPrev }}` 都能防住 nil；区别只是前者把对象绑定为 `.`，后者不绑定。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `Prev is nil; wrap it in if or with: {{ with .Prev }}{{ .URL }}{{ end }}` | 第 1 页的 `.Prev` 是 nil，直接取字段 | 用 `{{ with .Prev }}` 包住，或改成 `{{ if .HasPrev }}` |
| 没报错但结果不对 | 内容页的「上一篇」跳到了别处 | Pager 的 `Prev` 与 Page 的 `Prev` 同名不同义 | 内容页用 Page 的 [`Prev`](/methods/page/prev/) |
| 没报错但结果不对 | 上一页地址是 `/page/1/`（404） | 手工拼了分页地址 | 用 pager 的 [`URL`](/methods/pager/url/)，第 1 页会给出 `/` |

更多排查入口见[故障排查](/troubleshooting/)。
