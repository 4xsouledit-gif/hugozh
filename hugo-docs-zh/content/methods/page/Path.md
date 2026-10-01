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
