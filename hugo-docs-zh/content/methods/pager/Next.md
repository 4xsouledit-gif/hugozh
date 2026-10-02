+++
title = "Next"
linkTitle = "Next"
description = "返回分页器集合中的下一个分页器。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/pager/next/"

[params.functions_and_methods]
signatures = ["PAGER.Next"]
returnType = "page.Pager"
+++

## 这一页解决什么问题

`Next` 返回**页码相邻的下一个分页器**（页码更大的那个）：实测第 1 页的 `.Next` 是第 2 页（`/page/2/`），第 2 页的 `.Next` 是第 3 页。**在最后一页上是 `nil`**——不加保护会让整个站点构建失败。

## 什么时候用，什么时候别用

**该用**：

- 生成「下一页」链接，用 `{{ with }}` 或 [`HasNext`](/methods/pager/hasnext/) 保护；
- 需要下一页的编号或地址：`$paginator.Next.PageNumber`、`$paginator.Next.URL`。

**别用**：

- 想跳到最后一页 → 用 [`Last`](/methods/pager/last/)（它永远有值）；
- 想跳到任意一页 → 用 [`Pagers`](/methods/pager/pagers/)；
- 想要**文章**的下一篇 → 用 Page 的 [`Next`](/methods/page/next/)：同名方法在两处的语义完全不同（一处是页码相邻，一处是文章上下篇）。

## 基本用法

使用 `Next` 方法在分页器之间构建导航。

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

## 完整示例：上一页 / 下一页（末页自动隐藏「下一页」）

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

**你应当看到什么**：只有中间那一页同时有前后两个链接。`{{ with }}` 之所以必要，是因为末页的 `.Next` 是 nil——直接输出 `{{ $paginator.Next.URL }}` 会让构建失败。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 第 1 页 | 第 2 页的 pager：`URL` 为 `/page/2/`、`PageNumber` 为 2 | 否 |
| 第 2 页 | 第 3 页的 pager：`URL` 为 `/page/3/`、`PageNumber` 为 3 | 否 |
| 第 3 页（最后一页） | **nil**（`with` 判为假，整段跳过） | 否（前提是加了 `with`/`if`） |
| 单页分页（7 条、每页 100） | nil | 否 |
| 空集合分页 | nil | 否 |
| **不加保护直接取 `.URL`（最后一页）** | 构建中断，不产出页面 | **是**：`Next is nil; wrap it in if or with: {{ with .Next }}{{ .URL }}{{ end }}` |
| 返回类型 | `page.Pager`，**可能是 nil** | — |

两栏对照着记：`{{ with .Next }}` 与 `{{ if .HasNext }}` 都能防住 nil；区别只是前者把对象绑定为 `.`，后者不绑定。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `Next is nil; wrap it in if or with: {{ with .Next }}{{ .URL }}{{ end }}` | 最后一页的 `.Next` 是 nil，直接取字段 | 用 `{{ with .Next }}` 包住，或改成 `{{ if .HasNext }}` |
| 没报错但结果不对 | 内容页的「下一篇」跳到了别处 | Pager 的 `Next` 与 Page 的 `Next` 同名不同义 | 内容页用 Page 的 [`Next`](/methods/page/next/) |
| 没报错但结果不对 | 「上一页」与「下一页」指向同一个地址 | 两个 `<a>` 都取了 `Prev.URL`（或都取了 `Next.URL`） | 分别取 `$paginator.Prev.URL` 与 `$paginator.Next.URL` |

更多排查入口见[故障排查](/troubleshooting/)。
