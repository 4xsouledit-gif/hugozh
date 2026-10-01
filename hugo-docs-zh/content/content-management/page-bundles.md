+++
title = "页面包"
linkTitle = "页面包"
description = "分支包与叶子包的目录结构与区别，以及 headless bundle 和多语言命名。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/content-management/page-bundles/"
+++

页面包（page bundle）是一个目录，把内容与相关资源封装在一起。例如下面这个站点有一个 `about` 页面和一个 `privacy` 页面：

```tree
content/
├── about/
│   ├── index.md
│   └── welcome.jpg
└── privacy.md
```

`about` 页面就是一个页面包：它把资源与内容打包在一起，从而在逻辑上建立关联。页面包内的资源称为[页面资源](/content-management/page-resources/)，可以用 `Page` 对象的 `.Resources` 方法访问。

## 叶子包与分支包

页面包分为叶子包（leaf bundle）与分支包（branch bundle）两类。

叶子包
: 一个包含 `index.md` 文件以及零个或多个资源的目录。类似大树的一片叶子，叶子包位于分支的末端，没有后代。

分支包
: 一个包含 `_index.md` 文件以及零个或多个资源的目录。类似大树的枝干，分支包可以有后代，包括叶子包与其他分支包。顶层目录无论是否含 `_index.md` 文件都是分支包，首页也属于分支包。

> **注意**：索引文件的扩展名取决于内容格式。Markdown 内容用 `index.md`，HTML 内容用 `index.html`，AsciiDoc 内容用 `index.adoc`，其余格式依此类推。

## 两类页面包对比

| 对比项 | 叶子包 | 分支包 |
| --- | --- | --- |
| 索引文件 | `index.md` | `_index.md` |
| 示例 | `content/about/index.md` | `content/posts/_index.md` |
| 页面种类 | `page` | `home`、`section`、`taxonomy` 或 `term` |
| 模板类型 | 单页模板 | 首页、section（内容区块）、分类法或术语模板 |
| 后代页面 | 无 | 零个或多个 |
| 资源位置 | 与索引文件相邻，或位于嵌套子目录中 | 与叶子包相同，但不包括后代包中的文件 |
| 资源类型 | `page`、`image`、`video` 等 | 除 `page` 之外的所有类型 |

资源类型为 `page` 的文件包括用 Markdown、HTML、AsciiDoc、Pandoc、reStructuredText 和 Emacs Org Mode 书写的内容。在叶子包中，除索引文件以外，这些文件只能作为页面资源访问；在分支包中，这些文件只能作为内容页面访问。

## 叶子包

叶子包是一个包含 `index.md` 文件以及零个或多个资源的目录，位于分支的末端，没有后代。

```tree
content/
├── about
│   └── index.md
├── posts
│   ├── my-post
│   │   ├── content-1.md
│   │   ├── content-2.md
│   │   ├── image-1.jpg
│   │   ├── image-2.png
│   │   └── index.md
│   └── my-other-post
│       └── index.md
└── another-section
    ├── foo.md
    └── not-a-leaf-bundle
        ├── bar.md
        └── another-leaf-bundle
            └── index.md
```

上例中有四个叶子包：

- `about`：不含任何页面资源。
- `my-post`：含一个索引文件、两个资源类型为 `page` 的资源，以及两个资源类型为 `image` 的资源。`content-1`、`content-2` 是资源类型为 `page` 的资源，通过 `.Resources` 访问，Hugo 不会把它们渲染成独立页面；`image-1`、`image-2` 是资源类型为 `image` 的资源，同样通过 `.Resources` 访问。
- `my-other-post`：不含任何页面资源。
- `another-leaf-bundle`：不含任何页面资源。

> **注意**：叶子包可以创建在 `content` 目录下的任意深度，但一个叶子包内不能再包含另一个包。叶子包没有后代。

## 分支包

分支包是一个包含 `_index.md` 文件以及零个或多个资源的目录，可以有包括叶子包和其他分支包在内的后代。顶层目录无论是否含 `_index.md` 文件都是分支包，首页也包括在内。

```tree
content/
├── branch-bundle-1/
│   ├── _index.md
│   ├── content-1.md
│   ├── content-2.md
│   ├── image-1.jpg
│   └── image-2.png
├── branch-bundle-2/
│   ├── a-leaf-bundle/
│   │   └── index.md
│   └── _index.md
└── _index.md
```

上例中有三个分支包：

- 首页：含一个索引文件、两个后代分支包，没有资源。
- `branch-bundle-1`：含一个索引文件、两个资源类型为 `page` 的资源，以及两个资源类型为 `image` 的资源。
- `branch-bundle-2`：含一个索引文件和一个叶子包。

> **注意**：分支包可以创建在 `content` 目录下的任意深度，并且可以有后代。

## headless bundle

在前置元数据（front matter）中使用[构建选项](/content-management/build-options/)，可以创建不发布的叶子包或分支包，其内容与资源可以供其他页面引用。把 `headless` 设为 `true` 时，Hugo 会同时把 `render` 与 `list` 构建选项设为 `never`。

```toml
+++
title = "共享资源"
headless = true
+++
```

`headless` 适合“整个包都不发布”的简单情形；需要更细地控制页面是否输出、是否进入列表、资源是否复制时，直接使用 `build` 构建选项（`list`、`render`、`publishResources`），也可以配合 `cascade` 统一下发。

## 与 section 的关系

叶子包与被它替代的单文件页面发布的地址相同，区别在于能否携带同目录下的资源：

```text
content/posts/second-post.md          →  /posts/second-post/
content/posts/second-post/index.md    →  /posts/second-post/
```

同一个目录里不能同时存在 `_index.md` 与 `index.md`。叶子包就是一个普通页面，不会创建新的 section；分支包则可以嵌套分支包，从而形成多级 section，详见[内容区块](/content-management/sections/)。更多目录层面的约定见[目录结构](/getting-started/directory-structure/)。

## 多语言下的文件命名

多语言站点中，语言可以通过文件名后缀或目录区分。使用文件名后缀时，把语言代码插在扩展名之前：

```text
content/posts/first-post/
├── index.zh.md        # 简体中文版本
├── index.en.md        # 英文版本
├── cover.zh.jpg       # 中文版页面的资源
└── cover.en.jpg       # 英文版页面的资源
```

索引文件同理，写作 `_index.zh.md`、`_index.en.md`。语言代码要与配置中声明的语言一致，例如 `zh`、`zh-cn`、`en`；同一包内不同语言的资源属于对应语言的页面，命名时注意区分。共享资源在多语言构建中的处理方式见[页面资源](/content-management/page-resources/)。
