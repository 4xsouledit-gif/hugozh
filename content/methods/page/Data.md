+++
title = "Data"
linkTitle = "Data"
description = "为每种页面种类返回各自特有的数据对象。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/page/data/"

[params.functions_and_methods]
signatures = ["PAGE.Data"]
returnType = "page.Data"
+++

## 这一页解决什么问题

`Data` 是**分类法页与术语页专属的附加数据对象**：这两类页面用它取得「当前是哪个分类法、哪个术语」，分类法页还能拿到全部术语及其页面数。写分类法相关模板时，这些值只能从这里取。

## 什么时候用，什么时候别用

**该用**：

- 分类法页需要列出所有术语（`.Data.Terms`）并按页面数排序；
- 术语页需要知道「当前术语是什么」「属于哪个分类法」（`.Data.Term` / `.Data.Singular` / `.Data.Plural`）。

**别用**：

- 在**普通内容页**上取 `.Data` → 实测返回 `nil`，`with` 判为假；要页面参数请用 `.Params` / `.Param`；
- 需要页面集合 → 在分类法 / 术语模板里优先用 [`Pages`](/methods/page/pages/)、[`RegularPages`](/methods/page/regularpages/)、[`RegularPagesRecursive`](/methods/page/regularpagesrecursive/)；上游也提示不要再用老式的 `.Data.Pages`；
- 需要分类法对象的排序与计数 → 先用 `.Data.Terms` 取到 `Taxonomy` 对象，再用[分类法方法](/methods/taxonomy/)。

## 用法

`Page` 对象上的 `Data` 方法为每种[页面种类](g)返回各自特有的数据对象。

> [!NOTE]
> `Data` 方法只在[分类法](g)模板与[术语](g)模板中有用。
>
> 维护不活跃的主题可能仍在模板里使用 `.Data.Pages`。这种写法虽然还能用，但请改用下列方法之一：[`Pages`][]、[`RegularPages`][] 或 [`RegularPagesRecursive`][]

下面的示例基于如下项目配置：

```toml
[taxonomies]
genre = 'genres'
author = 'authors'
```

内容结构如下：

```tree
content/
├── books/
│   ├── and-then-there-were-none.md --> genres: suspense
│   ├── death-on-the-nile.md        --> genres: suspense
│   └── jamaica-inn.md              --> genres: suspense, romance
│   └── pride-and-prejudice.md      --> genres: romance
└── _index.md
```

## 在分类法模板中

在*分类法*模板中的 `Data` 对象上使用这些方法。

`Singular`
: （`string`）返回分类法的单数名称。

```go-html-template
{{ .Data.Singular }} → genre
```

`Plural`
: （`string`）返回分类法的复数名称。

```go-html-template
{{ .Data.Plural }} → genres
```

`Terms`
: （`page.Taxonomy`）返回 `Taxonomy` 对象，它由术语映射以及各术语关联的[加权页面](g)组成。

```go-html-template
{{ $taxonomyObject := .Data.Terms }}
```

> [!NOTE]
> 取得 `Taxonomy` 对象之后，可以用任何[分类法方法][]对它的加权页面排序、计数，或取出其中一部分。

进一步了解[分类法模板][]。

## 在术语模板中

在*术语*模板中的 `Data` 对象上使用这些方法。

`Singular`
: （`string`）返回分类法的单数名称。

```go-html-template
{{ .Data.Singular }} → genre
```

`Plural`
: （`string`）返回分类法的复数名称。

```go-html-template
{{ .Data.Plural }} → genres
```

`Term`
: （`string`）返回术语名称。

```go-html-template
{{ .Data.Term }} → suspense
```

进一步了解[术语模板][]。

## 完整示例：术语页与分类法页各取一次

最小站点：`hugo.toml` 使用默认的 `tags` 分类法；`content/docs/guide/alpha.md` 的前置元数据写 `tags = ['hugo', 'docs']`。

术语页模板 `layouts/_default/term.html`：

```go-html-template {file="layouts/_default/term.html"}
{{ .Data.Term }}|{{ .Data.Plural }}|{{ .Data.Singular }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，`/tags/hugo/` 输出：

```html
hugo|tags|tag
```

分类法页模板 `layouts/_default/terms.html`：

```go-html-template {file="layouts/_default/terms.html"}
{{ range .Data.Terms.ByCount }}{{ .Term }}:{{ .Count }} {{ end }}
```

`/tags/` 输出：

```html
docs:2 hugo:2 
```

**你应当看到什么**：`Singular` 是单数名（`tag`），`Plural` 是配置里的键名（`tags`），`Term` 是当前术语的原始值（小写 `hugo`）；`.Data.Terms.ByCount` 已按页面数排好序，可以直接遍历。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；默认 `tags` 分类法，两个术语各关联 2 个页面。

| 调用位置 | 结果 | 是否报错 |
| --- | --- | --- |
| 分类法页 `/tags/` | `.Data.Singular` = `tag`、`.Data.Plural` = `tags`、`.Data.Terms` 可用 | 否 |
| 术语页 `/tags/hugo/` | 额外有 `.Data.Term` = `hugo`；`.Data.Pages` 仍可用 | 否 |
| 普通内容页 | `nil`，`with .Data` 判为假 | 否 |
| 首页 | 非 `nil`（`with` 为真），但没有分类法相关的字段 | 否 |
| 返回类型 | `page.Data` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但什么都没有 | 普通内容页上 `with .Data` 不执行 | `.Data` 在普通页面上为 `nil` | 分类法相关取值只放在 taxonomy / term 模板里 |
| 没报错但结果不对 | `.Data.Term` 的写法与前置元数据不一致 | Hugo 会把术语规范化为 URL 形式（小写、连字符） | 用 `.Data.Term` 的返回值，不要自行 `lower` 或 `title` |
| 主题很老 | `.Data.Pages` 能用但已过时 | 上游已建议改用 `Pages` / `RegularPages` | 改用 [`Pages`](/methods/page/pages/) 等方法 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Pages`]: /methods/page/pages/
[`RegularPagesRecursive`]: /methods/page/regularpagesrecursive/
[`RegularPages`]: /methods/page/regularpages/
[分类法方法]: /methods/taxonomy/
[分类法模板]: /templates/types/#taxonomy
[术语模板]: /templates/types/#term
