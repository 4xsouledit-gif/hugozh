+++
title = "Path"
linkTitle = "Path"
description = "返回给定页面的逻辑路径。"
date = 2026-10-02
weight = 540
source = "https://gohugo.io/methods/page/path/"

[params.functions_and_methods]
signatures = ["PAGE.Path"]
returnType = "string"
+++

## 这一页解决什么问题

一个页面有两个「身份」：**发布出去的 URL**（会被 `slug`、`url`、语言前缀、`baseURL` 子路径改写）和**在 Hugo 逻辑树中的位置**（稳定、与 URL 无关）。`.Path` 返回后者：

```go-html-template
{{ .Path }} → /posts/post-1
```

它在两种场景里不可替代：一是当作查找页面的键（`site.GetPage`、`Page.GetPage`、`Page.Ref`、`ref`/`relref` 短代码都用逻辑路径），二是当稳定的唯一标识（例如生成锚点、给列表项加 `id`、排查「两个页面 URL 不同但其实是同一逻辑位置」）。

## 什么时候用，什么时候别用

**该用**：

- 给 `site.GetPage` / `Page.GetPage` / `Page.Ref` / `Page.RelRef` 传参数；
- 需要「忽略 URL 修饰符」的稳定标识；
- 多语言站点里判断两个页面是不是同一个逻辑位置（不同语言的同名页面 `.Path` 相同）。

**别用**：

- 要链接 → 用 [`.RelPermalink`](/methods/page/relpermalink/) 或 [`.Permalink`](/methods/page/permalink/)；
- 要磁盘上的源文件路径 → 用 [`.File`](/methods/page/file/)（页面包与页面包之外的资源要用不同方法）；
- 想拿 URL 里的 slug → 用 [`.Slug`](/methods/page/slug/)。

## 用法

`Page` 对象上的 `Path` 方法返回给定页面的逻辑路径，无论该页面是否由文件支撑。

[逻辑路径（logical path）](/quick-reference/glossary/logical-path/)

```go-html-template
{{ .Path }} → /posts/post-1
```

`Page` 对象上的 `Path` 方法返回的值与内容格式、语言，以及 `slug`、`url` 等前置元数据 URL 修饰符无关。

### 查找页面

以下方法、函数和短代码使用逻辑路径来查找给定页面：

方法|函数|短代码
:--|:--|:--
[`Site.GetPage`][]|[`urls.Ref`][]|[`ref`][]
[`Page.GetPage`][]|[`urls.RelRef`][]|[`relref`][]
[`Page.Ref`][]|&nbsp;|&nbsp;
[`Page.RelRef`][]|&nbsp;|&nbsp;
[`Shortcode.Ref`][]|&nbsp;|&nbsp;
[`Shortcode.RelRef`][]|&nbsp;|&nbsp;

> [!NOTE]
> 使用上述任何方法、函数或短代码时，请指定逻辑路径。如果你写上了文件扩展名或语言标识符，Hugo 会在逻辑树中查找该页面之前先剥离这些值。

### 逻辑树

正如文件路径构成文件树，逻辑路径构成逻辑树。

文件树：

```tree
content/
└── s1/
    ├── p1/
    │   └── index.md
    └── p2.md
```

同样的内容用逻辑树表示：

```tree
content/
└── s1/
    ├── p1
    └── p2
```

这两棵树的一个关键区别是 p1 到 p2 的相对路径：

- 在文件树中，p1 到 p2 的相对路径是 `../p2.md`
- 在逻辑树中，相对路径是 `p2`

> [!NOTE]
> 请记住，使用上一节列出的任何方法、函数或短代码时都要用逻辑路径。如果你写上了文件扩展名或语言标识符，Hugo 会在逻辑树中查找该页面之前先剥离这些值。

## 示例

以下示例演示 `Path` 方法在不同情形下的行为。

### 单语言项目

请注意，逻辑路径与内容格式和 URL 修饰符无关。

文件路径|前置元数据 slug|逻辑路径
:--|:--|:--
`content/_index.md`||`/`
`content/posts/_index.md`||`/posts`
`content/posts/post-1.md`|`foo`|`/posts/post-1`
`content/posts/post-2.html`|`bar`|`/posts/post-2`

### 多语言站点

请注意，逻辑路径与内容格式、语言标识符和 URL 修饰符无关。

文件路径|前置元数据 slug|逻辑路径
:--|:--|:--
`content/_index.en.md`||`/`
`content/_index.de.md`||`/`
`content/posts/_index.en.md`||`/posts`
`content/posts/_index.de.md`||`/posts`
`content/posts/posts-1.en.md`|`foo`|`/posts/post-1`
`content/posts/posts-1.de.md`|`foo`|`/posts/post-1`
`content/posts/posts-2.en.html`|`bar`|`/posts/post-2`
`content/posts/posts-2.de.html`|`bar`|`/posts/post-2`

### 没有文件支撑的页面

`Page` 对象上的 `Path` 方法总会有返回值，无论该页面是否由文件支撑。

```tree
content/
└── posts/
    └── post-1.md  <-- front matter: tags = ['hugo']
```

构建站点时：

```tree
public/
├── posts/
│   ├── post-1/
│   │   └── index.html    .Page.Path = /posts/post-1
│   └── index.html        .Page.Path = /posts
├── tags/
│   ├── hugo/
│   │   └── index.html    .Page.Path = /tags/hugo
│   └── index.html        .Page.Path = /tags
└── index.html            .Page.Path = /
```

## 完整示例：URL 会变，逻辑路径不变

测试站的 `content/posts/post-1.md` 里写了 `slug = "first-post"`，模板直接打印两种「路径」：

```go-html-template {file="layouts/_default/single.html"}
<p>.Path        = {{ .Path }}</p>
<p>.RelPermalink = {{ .RelPermalink }}</p>
```

实测渲染结果（`baseURL = 'https://example.org/'`）：

```html
<p>.Path        = /posts/post-1</p>
<p>.RelPermalink = /posts/first-post/</p>
```

实测汇总（同一站点）：

| 渲染的页面 | `.Path` | 对应 URL |
| --- | --- | --- |
| `/posts/first-post/`（front matter `slug = "first-post"`） | `/posts/post-1` | `/posts/first-post/` |
| `/posts/post-2/` | `/posts/post-2` | `/posts/post-2/` |
| `/posts/`（section） | `/posts` | `/posts/` |
| `/docs/guide/`（section） | `/docs/guide` | `/docs/guide/` |
| `/tags/alpha/`（term 页） | `/tags/alpha` | `/tags/alpha/` |
| `/zh/posts/post-1/`（中文版） | `/posts/post-1` | `/zh/posts/post-1/` |

**你应当看到什么**：第一行与第六行最关键——`slug` 与语言前缀都改变了 URL，`.Path` 岿然不动。所以不要把 `.Path` 当 URL 用，也不要用它去拼链接。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 首页 | `/` | 否 |
| section 页 | `/posts`、`/docs/guide`（无尾斜杠） | 否 |
| 常规页面 | `/posts/post-2`（无扩展名、无尾斜杠） | 否 |
| taxonomy / term 页 | `/tags`、`/tags/alpha` | 否 |
| 设了 `slug` / `url` | 值不变（实测 `/posts/first-post/` 的 `.Path` 仍是 `/posts/post-1`） | 否 |
| 多语言 | 各语言同名页面返回相同值（实测中英文 `post-1` 均为 `/posts/post-1`） | 否 |
| 返回类型 | `string`，始终以 `/` 开头 | 否 |
| 拿它当 URL 拼链接 | 会得到 404（例如 `/posts/post-1` 未必存在） | 否（页面照常构建） |

更多排查入口见[故障排查](/troubleshooting/)。

[`Page.GetPage`]: /methods/page/getpage/
[`Page.Ref`]: /methods/page/ref/
[`Page.RelRef`]: /methods/page/relref/
[`Shortcode.Ref`]: /methods/shortcode/ref/
[`Shortcode.RelRef`]: /methods/shortcode/relref/
[`Site.GetPage`]: /methods/site/getpage/
[`ref`]: /shortcodes/ref/
[`relref`]: /shortcodes/relref/
[`urls.Ref`]: /functions/urls/ref/
[`urls.RelRef`]: /functions/urls/relref/
