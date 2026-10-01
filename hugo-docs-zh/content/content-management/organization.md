+++
title = "内容组织"
linkTitle = "内容组织"
description = "内容目录如何映射为站点的逻辑树、URL 与 section。"
date = 2026-10-01
weight = 45
source = "https://gohugo.io/content-management/organization/"
+++

## 内容目录即站点结构

Hugo 假定用于组织源内容的结构，同样用于组织渲染后的站点。内容在 `content/` 目录中的位置构成一棵逻辑树：一级子目录即顶层 section，目录名既是 section 名，也是 URL 的一段。内容属于哪个 section 由它在目录树中的位置决定，不能在前置元数据中指定或覆盖。

Hugo 支持任意层级的内容嵌套，但 `content/<目录名>` 这样的顶层目录具有特殊含义，它被视为内容类型，用于决定布局等行为。不额外配置时，下面的结构会自动得到对应的 URL：

```text
content/
├── about/
│   └── index.md          → https://example.org/about/
├── posts/
│   ├── firstpost.md      → https://example.org/posts/firstpost/
│   ├── happy/
│   │   └── ness.md       → https://example.org/posts/happy/ness/
│   └── secondpost.md     → https://example.org/posts/secondpost/
└── quote/
    ├── first.md          → https://example.org/quote/first/
    └── second.md         → https://example.org/quote/second/
```

这些地址假定站点使用 Hugo 默认的漂亮 URL 形式，并且项目配置中设置了 `baseURL = "https://example.org/"`。

## 页面包

Hugo 支持把页面相对的图片与其他资源打包成页面包（page bundle）。页面包有两种形态：目录中是 `_index.md` 时构成分支包（branch bundle），代表一个列表页；目录中是 `index.md` 时构成叶子包（leaf bundle），代表一个不可再分的页面。

```text
content/
├── blog/
│   ├── hugo-is-cool/
│   │   ├── images/
│   │   │   ├── funnier-cat.jpg
│   │   │   └── funny-cat.jpg
│   │   ├── cats-info.md
│   │   └── index.md
│   ├── posts/
│   │   ├── post1.md
│   │   └── post2.md
│   ├── 1-landscape.jpg
│   ├── 2-sunset.jpg
│   ├── _index.md
│   ├── content-1.md
│   └── content-2.md
├── 1-logo.png
└── _index.md
```

上例中共有三个页面包。首页包不能包含其他内容页面，但允许存放图片等其他文件。要理解全貌，还需要同时了解[页面资源](/content-management/page-resources/)与[图像处理](/content-management/image-processing/)。

## `_index.md` 与 `index.md` 的分工

`_index.md` 在 Hugo 中有特殊作用，它让你可以为 home、section、taxonomy 和 term 页面添加前置元数据与正文。站点首页以及每个内容 section、分类法和术语都可以各有一个 `_index.md`；其中的内容与元数据可以用 `Site` 或 `Page` 对象的 `GetPage` 方法访问。

以典型的 section 列表页为例，文件与 URL 的对应关系如下：

```text
content/posts/_index.md   → url: /posts/   section: posts
                          → https://example.org/posts/index.html
```

section 中的单个内容文件由单页模板渲染。例如 `content/posts/my-first-hugo-post.md` 的 URL 是 `/posts/my-first-hugo-post/`，其中 section 为 `posts`、slug 为 `my-first-hugo-post`，构建后输出到 `https://example.org/posts/my-first-hugo-post/index.html`。

两种文件的差别在于包的形态：`_index.md` 生成列表页，它所在的目录可以继续包含子 section 与其他内容页面；`index.md` 生成单个页面，同目录下的其他文件成为该页面的页面资源，不会被单独渲染为页面。

## 路径的组成

理解下列概念，有助于掌握内容组织方式与默认构建行为之间的关系：

section
: 默认内容类型由内容所处的 section 决定，section 则由内容在项目 `content` 目录中的位置决定，不能在前置元数据中指定或覆盖。

slug
: slug 是 URL 路径的最后一段，由页面逻辑路径的最后一段确定，也可以用前置元数据中的 `slug` 覆盖，详见 [URL 管理](/content-management/urls/)。

path
: 内容的 path 基于内容所在位置的路径，并且不包含 slug。

url
: url 是完整的 URL 路径，由文件路径决定，也可以用前置元数据中的 `url` 覆盖，详见 [URL 管理](/content-management/urls/)。

## 组织内容时的几点建议

- 让内容目录反映渲染后站点的结构，这是最省心的组织方式。
- section 可以嵌套任意深度；要让整棵 section 树都可导航，最下层的 section 至少要包含一个内容文件（即 `_index.md`）。
- 用 `_index.md` 表达「这里是一个 section 的列表页」，用 `index.md` 表达「这里是一个页面」，这一选择会直接改变目录中其他文件的处理方式。
- 与页面同目录的图片、数据等文件应作为页面资源管理，用相对路径引用，便于迁移与复用。

## 延伸阅读

- [内容区块](/content-management/sections/)
- [页面包](/content-management/page-bundles/)
- [页面资源](/content-management/page-resources/)
- [内容类型](/templates/types/)
