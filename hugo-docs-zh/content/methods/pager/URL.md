+++
title = "URL"
linkTitle = "URL"
description = "返回当前分页器相对于站点根目录的 URL。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/pager/url/"

[params.functions_and_methods]
signatures = ["PAGER.URL"]
returnType = "string"
+++

## 这一页解决什么问题

`URL` 返回当前分页器的地址，以 `/` 开头，用来填 `<a href>`。有两点必须记住：

1. **第 1 页的地址是 `/`，不是 `/page/1/`**——实测 Hugo 仍会生成一份 `/page/1/index.html`，但那只是带 `<meta http-equiv="refresh">` 的跳转页，链接应指向 `/`；
2. 站点部署在子路径时，地址**带上子路径**：实测 `baseURL = "https://example.org/docs/"` 下，第 1 页是 `/docs/`、第 2 页是 `/docs/page/2/`。

## 什么时候用，什么时候别用

**该用**：

- 生成「上一页 / 下一页 / 首页 / 末页 / 页码条」里的 `href`；
- 需要把当前分页的地址打印出来排查（例如核对分页目录是否按预期生成）。

**别用**：

- 需要**带域名的完整地址**（RSS、Open Graph、结构化数据）→ 分页器不提供：实测 `$paginator.Permalink` 会让构建失败并报 `can't evaluate field Permalink in type *page.Pager`。这类地址请用页面自身的 [`Permalink`](/methods/page/permalink/) 方法；
- 想手工拼 `/page/{{ .PageNumber }}/` → 第 1 页会拼成不存在的 `/page/1/`，用 `.URL` 才正确；
- 想要页面内容或条数 → 用 [`Pages`](/methods/pager/pages/)、[`NumberOfElements`](/methods/pager/numberofelements/)。

## 基本用法

使用 `URL` 方法在分页器之间构建导航。

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

## 完整示例：一个指向当前分页的链接

```go-html-template {file="layouts/home.html"}
{{ $paginator := .Paginate (where site.RegularPages "Type" "posts") }}
<a href="{{ $paginator.URL }}">当前页</a>
```

测量条件：Hugo 0.167.0 extended，7 篇 `posts`，`[pagination] pagerSize = 3`。

`baseURL = "https://example.org/"` 时，三个分页页分别渲染为：

```html
<a href="/">当前页</a>
```

```html
<a href="/page/2/">当前页</a>
```

```html
<a href="/page/3/">当前页</a>
```

把 `baseURL` 换成 `https://example.org/docs/` 后，实测同一段模板在 `/` 与 `/page/2/` 上分别渲染为：

```html
<a href="/docs/">当前页</a>
```

```html
<a href="/docs/page/2/">当前页</a>
```

**你应当看到什么**：第 1 页的地址没有 `page/1` 这一段；子路径部署时 `/docs/` 前缀自动出现——所以不要把 `.URL` 与 `baseURL` 手工拼接，也不要去掉前缀。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 第 1 页（`baseURL` 在根目录） | `/` | 否 |
| 第 2、3 页 | `/page/2/`、`/page/3/` | 否 |
| `baseURL = "https://example.org/docs/"` | 第 1 页 `/docs/`、第 2 页 `/docs/page/2/` | 否 |
| 单页分页（7 条、每页 100） | `/` | 否 |
| 空集合分页 | `/`（仍有一个 pager，[`TotalPages`](/methods/pager/totalpages/) 为 0） | 否 |
| 与 `PageNumber` 的关系 | 第 1 页不给 `/page/1/`；其他页与 `page/N/` 一致 | 否 |
| 取 `.Permalink` | 构建失败 | **是**：`can't evaluate field Permalink in type *page.Pager` |
| 返回类型 | `string`，以 `/` 开头，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 第 1 页的链接是 `/page/1/`，点开是别处或 404 | 手工拼了 `/page/{{ .PageNumber }}/` | 用 pager 的 `.URL` |
| 没报错但结果不对 | 子路径部署下分页链接 404 | 自己按 `/page/N/` 拼地址，丢掉了站点子路径 | 用 `.URL`（它已含前缀） |
| 报错看不懂 | `can't evaluate field Permalink in type *page.Pager` | 分页器没有 `Permalink` 方法 | 绝对地址用页面自身的 [`Permalink`](/methods/page/permalink/) |
| 没报错但结果不对 | 本地预览正常，上线后分页链接 404 | `baseURL` 与真实部署路径不一致 | 让 `baseURL` 与部署位置一致，构建时可用 `--baseURL` 覆盖 |

更多排查入口见[故障排查](/troubleshooting/)。
