+++
title = "Page"
linkTitle = "Page"
description = "返回分类法页面；若分类法没有任何术语则返回 nil。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/taxonomy/page/"

[params.functions_and_methods]
signatures = ["TAXONOMY.Page"]
returnType = "page.Page"
+++

## 这一页解决什么问题

`Page` 返回**这个分类法自己的页面对象**：`genres` 分类法的页面是 `/genres/`，`tags` 的是 `/tags/`。用它可以在术语页或分类法页放一个「查看全部标签」的链接，也可以把分类法页面的标题、参数用在侧栏。

关键在它的**空值语义**：分类法没有任何术语时返回 `nil`。所以这是本章唯一必须写防御式代码的方法。

## 什么时候用，什么时候别用

**该用**：

- 链接到分类法页面（`/genres/`），或在其中显示 `.Title`、`.Params`；
- 在术语页（如 `/genres/suspense/`）上放「← 返回全部 genres」的入口。

**别用**：

- 想取**某个术语**的页面 → 用有序分类法元素上的 `.Page`（见 [Alphabetical](/methods/taxonomy/alphabetical/) / [ByCount](/methods/taxonomy/bycount/)）；
- 不加判断就直接 `.RelPermalink` → 空分类法时对象是 `nil`，模板会取不到值或执行失败，务必用 `with` 包起来；
- 想取分类法的页面集合 → `Page` 给的是分类法页面本身，不是它的子页面。

## 用法

如果分类法没有任何术语，这个 `TAXONOMY` 方法会返回 `nil`，因此必须做防御式编码：

```go-html-template
{{ with .Site.Taxonomies.tags.Page }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

渲染结果为：

```html
<a href="/tags/">Tags</a>
```

## 完整示例（实测）

站点配置 `genre = 'genres'`、`tag = 'tags'`，其中 `tags` 已配置但**没有任何内容使用它**（即没有术语）。任意模板中：

```go-html-template {file="layouts/index.html"}
<p>genres：{{ with .Site.Taxonomies.genres.Page }}{{ .RelPermalink }} | {{ .LinkTitle }}{{ else }}nil{{ end }}</p>
<p>tags：{{ with .Site.Taxonomies.tags.Page }}{{ .RelPermalink }} | {{ .LinkTitle }}{{ else }}nil{{ end }}</p>
```

Hugo 渲染为：

```html
<p>genres：/genres/ | Genres</p>
<p>tags：nil</p>
```

**你应当看到什么**：有术语的 `genres` 得到分类法页面（`/genres/`，标题取配置的复数名 `Genres`）；**空分类法 `tags` 得到 `nil`**，`with` 走了 `else` 分支。注意 `/tags/` 这个页面**本身仍然会被生成**（它出现在 [`Site.Pages`](/methods/site/pages/) 里），只是从 `Taxonomy` 对象上取 `Page` 取不到——两者不是一回事。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended；`genres` 有 2 个术语，`tags` 已配置但无术语，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 分类法至少有一个术语（`genres`） | 返回该分类法页面：`.RelPermalink` → `/genres/` | 否 |
| 分类法已配置但**没有术语**（`tags`） | `nil`（`with` 判为假） | 否 |
| 分类法**未配置**（如 `categories`） | 取 `Taxonomy` 对象这一步已经是 `nil`，`with` 同样判为假 | 否 |
| 空分类法的页面是否存在 | 存在：`/tags/` 会被生成并出现在 `Site.Pages` 中（实测 kind 为 `taxonomy`） | 否 |
| 不加 `with` 直接 `.RelPermalink` | 空分类法时取不到值 | 视写法（`nil` 上调用方法会执行失败） |
| 返回值类型 | `page.Page` | 否 |
