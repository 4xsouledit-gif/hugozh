+++
title = "Slug"
linkTitle = "Slug"
description = "返回给定页面前置元数据中定义的 URL slug。"
date = 2026-10-02
weight = 790
source = "https://gohugo.io/methods/page/slug/"

[params.functions_and_methods]
signatures = ["PAGE.Slug"]
returnType = "string"
+++

## 这一页解决什么问题

`.Slug` 返回前置元数据里写的 `slug` 值——即「这一页 URL 的最后一段用什么词」。它是一个**字符串**，没有写就是空字符串（不是 `nil`，也不报错）。

要点：`.Slug` 影响的是 **URL**，不影响 [`.Path`](/methods/page/path/)（逻辑路径）。实测：`content/posts/post-1.md` 写了 `slug = "first-post"`，它的 `.Path` 仍是 `/posts/post-1`，而 `.RelPermalink` 是 `/posts/first-post/`。

## 什么时候用，什么时候别用

**该用**：

- 需要显示或比较「URL 里那一段」（例如给页面加 `data-slug` 属性）；
- 调试「为什么链接和文件名不一样」。

**别用**：

- 想要 URL → 用 [`.RelPermalink`](/methods/page/relpermalink/) / [`.Permalink`](/methods/page/permalink/)；
- 想要逻辑路径 → 用 [`.Path`](/methods/page/path/)；
- 想在模板里**设置** slug → front matter 是唯一入口（或 [permalinks 配置](/configuration/permalinks/)）。

**三者对照（实测，同一页面）**：

| 方法 | 值 | 说明 |
| --- | --- | --- |
| `.Slug` | `first-post` | 来自 front matter |
| `.Path` | `/posts/post-1` | 逻辑路径，与 slug 无关 |
| `.RelPermalink` | `/posts/first-post/` | 实际 URL，用了 slug |

## 用法

```toml
title = 'How to make spicy tuna hand rolls'
slug = 'sushi'
```

该页面将通过以下地址访问：

    https://example.org/recipes/sushi

要在模板中获取 slug 值：

```go-html-template
{{ .Slug }} → sushi
```

## 完整示例：对比 slug、逻辑路径与 URL

测试站的 `content/posts/post-1.md` 前置元数据：

```toml
title = "第一篇"
slug = "first-post"
```

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
<p>slug = {{ .Slug }}</p>
<p>Path = {{ .Path }}</p>
<p>URL  = {{ .RelPermalink }}</p>
```

实测（Hugo 0.167.0）渲染该页：

```html
<p>slug = first-post</p>
<p>Path = /posts/post-1</p>
<p>URL  = /posts/first-post/</p>
```

没有写 slug 的页面（如 `/posts/post-2/`）实测为：

```html
<p>slug = </p>
<p>Path = /posts/post-2</p>
<p>URL  = /posts/post-2/</p>
```

**你应当看到什么**：第一组三个值各不相同——slug 只改 URL；第二组 `.Slug` 是**空字符串**（模板里输出为空，不会报错）。想在模板里判断「是否自定义了 slug」，用 `{{ with .Slug }}`（空串为假）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| front matter 写了 `slug` | 该值（实测 `first-post`） | 否 |
| 没写 `slug` | 空字符串 `""`（实测） | 否 |
| 对 `.Path` 的影响 | 无（实测仍为 `/posts/post-1`） | 否 |
| 对 `.RelPermalink` 的影响 | URL 最后一段变为 slug（实测 `/posts/first-post/`） | 否 |
| `.Slug` 与 `url` front matter | `url` 会整段覆盖 URL，优先级更高（上游未在本页说明，详见 URL 管理） | 否 |
| 返回类型 | `string` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
