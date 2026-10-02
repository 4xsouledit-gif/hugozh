+++
title = "URL"
linkTitle = "URL"
description = "返回与给定菜单条目关联的页面的相对永久链接，否则返回其 `url` 属性。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/menu-entry/url/"

[params.functions_and_methods]
signatures = ["MENUENTRY.URL"]
returnType = "string"
+++

## 这一页解决什么问题

菜单模板里最不能出错的一个值就是 `href`：要么指向站内页面，要么指向站外地址。`URL` 方法把两种情况合成一个答案——条目关联了页面就用页面的相对永久链接，否则用配置里的 `url`。

**读懂本页的诀窍**：`URL` 给的是「已经算好的地址」。站内条目拿到的是**永久链接**（带结尾斜杠、随 `baseURL` 与 `uglyURLs` 等配置变化），而不是你写在 `pageRef` 里的那串路径。

## 什么时候用，什么时候别用

**该用**：

- 所有菜单锚点的 `href`：`<a href="{{ .URL }}">`；
- 站内、站外混合的菜单（例如主导航里夹一个指向文档站的外链）。

**别用**：

- 想知道这个地址是「页面来的」还是「`url` 属性来的」→ 用 [`Page`](/methods/menu-entry/page/) 判断：`.Page` 非 `nil` 就是页面条目；
- 想拿配置里写的 `pageRef` 原字符串 → 用 [`PageRef`](/methods/menu-entry/pageref/)；
- 想生成带域名和协议的绝对地址（RSS、结构化数据）→ 菜单里没有现成方法，用 [`absURL`](/functions/urls/absurl/) 或页面上的 `.Permalink` 自行拼接。

## 用法

对于与页面关联的菜单条目，`URL` 方法返回该页面的 [`RelPermalink`][]；否则返回条目的 `url` 属性。

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

## 完整示例：四种条目的 URL 对照

菜单 `page` 的四条依次是：`pageRef` 指向存在页面的 `Products`、`pageRef` 指向不存在页面的 `Services`、只写 `url` 的外链 `Hugo`、什么都没写的 `Bare`：

```toml
[[menus.page]]
name = 'Products'
pageRef = '/products'
weight = 10

[[menus.page]]
name = 'Services'
pageRef = '/services-missing'
weight = 20

[[menus.page]]
name = 'Hugo'
url = 'https://gohugo.io'
weight = 30

[[menus.page]]
name = 'Bare'
weight = 40
```

```go-html-template
{{ range site.Menus.page }}[{{ .Name }} URL={{ printf "%q" .URL }}]{{ end }}
```

实测输出：

```text
[Products URL="/products/"] [Services URL=""] [Hugo URL="https://gohugo.io"] [Bare URL=""]
```

**你应当看到什么**：

- 页面条目给的是**永久链接** `/products/`（带结尾斜杠）；
- `pageRef` 没找到页面、又没写 `url` 的条目，`URL` 是**空字符串**——`<a href="">` 会让浏览器回到当前页，是个隐蔽的坏结果；
- 外链条目原样返回 `url`；
- 什么都没写的条目同样是空字符串。

用 `{{ with }}` 给空地址兜底，可以避免渲染出空链接（注意先把条目存进变量，`with` 之后 `.` 已经变成地址字符串）：

```go-html-template
{{ range site.Menus.page }}
  {{ $e := . }}
  {{ with .URL }}<a href="{{ . }}">{{ $e.Name }}</a>{{ else }}<span>{{ $e.Name }}</span>{{ end }}
{{ end }}
```

实测输出：

```text
<a href="/products/">Products</a><span>Services</span><a href="https://gohugo.io">Hugo</a><span>Bare</span>
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`baseURL = "https://example.org/"`），Windows。

| 条目的定义方式 | `.URL` | 是否报错 |
| --- | --- | --- |
| `pageRef` 指向存在的页面 | 该页面的相对永久链接（实测 `"/products/"`，**带**结尾斜杠） | 否 |
| 只写了 `url`（外链） | 原样返回（实测 `"https://gohugo.io"`） | 否 |
| `pageRef` 找不到页面，且没写 `url` | 空字符串 `""` | 否 |
| `pageRef` 找不到页面，但写了 `url` | 返回该 `url` | 否 |
| 什么都没写 | 空字符串 `""` | 否 |
| 返回类型 | `string`（可能为 `""`，不会 `nil`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 菜单里出现点了没反应的链接 | `pageRef` 没匹配到页面且没有 `url`，`.URL` 是空字符串 | 核对内容路径，或按 [`PageRef`](/methods/menu-entry/pageref/) 用 `{{ or .URL .PageRef }}` 兜底；更稳的是 `with` 判断 |
| 没报错但结果不对 | 拿 `.URL` 当配置里的 `pageRef` 用，比较字符串时对不上 | `.URL` 是解析后的永久链接（可能带结尾斜杠、可能被 `uglyURLs` 改写） | 要比原值就用 [`PageRef`](/methods/menu-entry/pageref/) |
| 没报错但结果不对 | 换域名/子路径部署后菜单链接全错 | 手工拼了地址 | 一律用 `.URL`，让它跟着 `baseURL` 走 |

更多排查入口见[故障排查](/troubleshooting/)。

[`RelPermalink`]: /methods/page/relpermalink/
