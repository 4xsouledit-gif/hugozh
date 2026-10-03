+++
title = "内容区块"
linkTitle = "内容区块"
description = "用 section 组织内容，控制 URL、列表模板与排序；含 section 与目录的判定、验证方法与常见坑。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/content-management/sections/"

[params.teach]
difficulty = "入门"
time = "15–25 分钟"
prereq = [
  "读过[页面包](/content-management/page-bundles/)，知道 `_index.md` 与 `index.md` 的区别。",
  "有一个至少两层的 `content/` 目录，能构建并查看产物。",
]
outcomes = [
  "判断某个目录是不是 section，并说清 `_index.md` 在这里起什么作用；",
  "区分 `.Section` 与 `.CurrentSection`，用对列表页里的 `.Pages` / `.RegularPages` / `.RegularPagesRecursive`；",
  "预测某段目录结构会生成哪些列表页、用什么模板；",
  "用 `hugo list all` 的 `kind` 与 `section` 两列验证自己的判断。",
]
next = ["/content-management/page-bundles/", "/content-management/organization/", "/templates/lookup-order/"]

+++

## 这一页解决什么问题

section（内容区块）是组织内容的一种方式。Hugo 假定用于组织源内容的结构同样用于组织渲染后的站点，`content/` 目录下的一级目录就是顶层 section，目录名既是 section 名，也直接成为 URL 的一段。Hugo 依据内容所在的位置推断它属于哪个 section，不能在前置元数据（front matter）中指定或覆盖。

它的规则只有一条但很容易记混：**顶层目录一律是 section；更深的目录只有带 `_index.md` 才算 section**。由此决定「有没有列表页、能不能被 `.Pages` 遍历、用哪个模板」。

**验证自己的判断**：`hugo list all` 的**最后两列**就是答案。

```bash
hugo list all
```

**你应当看到什么**（**实测：Hugo 0.167**）：`content/products/product-1/benefits/benefit-1.md` 在输出里是

```text
…/benefits/benefit-1/, , Benefit 1, …, page, products
```

即 `kind` 为 `page`、`section` 列为 **`products`**——注意这里是**顶层** section 名，不是最内层目录名。而 `content/products/product-1/benefits/_index.md` 的 `kind` 是 `section`、`section` 列同样是 `products`。产物里出现的路径也一样：每个 section 都有自己的 `index.html`，非 section 目录只是 URL 的一段。

## 概述

section（内容区块）是组织内容的一种方式。Hugo 假定用于组织源内容的结构同样用于组织渲染后的站点，`content/` 目录下的一级目录就是顶层 section，目录名既是 section 名，也直接成为 URL 的一段。Hugo 依据内容所在的位置推断它属于哪个 section，不能在前置元数据（front matter）中指定或覆盖。

```tree
content/
├── articles/             <-- section（顶层目录）
│   ├── 2022/
│   │   ├── article-1/
│   │   │   ├── cover.jpg
│   │   │   └── index.md
│   │   └── article-2.md
│   └── 2023/
│       ├── article-3.md
│       └── article-4.md
├── products/             <-- section（顶层目录）
│   ├── product-1/        <-- section（目录中有 _index.md）
│   │   ├── benefits/     <-- section（目录中有 _index.md）
│   │   │   ├── _index.md
│   │   │   └── benefit-1.md
│   │   ├── features/     <-- section（目录中有 _index.md）
│   │   │   ├── _index.md
│   │   │   └── feature-1.md
│   │   └── _index.md
│   └── product-2/        <-- section（目录中有 _index.md）
│       └── _index.md
├── _index.md
└── about.md
```

上例有两个顶层 section：`articles` 与 `products`。`articles` 下的目录都不是 section，而 `products` 下的目录都是 section。section 内部的 section 称为嵌套 section 或子 section。

## section 与非 section 的区别

| 行为 | section | 非 section |
| --- | --- | --- |
| 目录名成为 URL 的一段 | 是 | 是 |
| 有逻辑上的祖先与后代 | 是 | 否 |
| 有列表页 | 是 | 否 |

以上例的文件结构为例：

1. `articles` section 的列表页包含全部文章，不受目录结构影响，因为它的子目录都不是 section。
2. `articles/2022` 与 `articles/2023` 目录没有列表页，它们不是 section。
3. `products` section 的列表页默认包含 `product-1` 与 `product-2`，但不包含它们的后代页面。要包含后代页面，请在 section 模板中用 `RegularPagesRecursive` 方法代替 `Pages` 方法。
4. `products` section 中的所有目录都有列表页，每个目录都是 section。

## 模板选择

Hugo 有一套明确的模板查找顺序来决定用哪个模板渲染页面，查找规则只考虑顶层 section 名，选择模板时不考虑子 section 名。以上例的文件结构为例，section 模板对应关系如下：

| 内容目录 | section 模板 |
| --- | --- |
| `content/products` | `layouts/products/section.html` |
| `content/products/product-1` | `layouts/products/section.html` |
| `content/products/product-1/benefits` | `layouts/products/section.html` |

单页模板同理：

| 内容目录 | 单页模板 |
| --- | --- |
| `content/products` | `layouts/products/page.html` |
| `content/products/product-1` | `layouts/products/page.html` |
| `content/products/product-1/benefits` | `layouts/products/page.html` |

需要为某个子 section 使用不同模板时，在前置元数据中指定 `type` 或 `layout`。`type` 可以覆盖由页面所在顶层 section 推导出的内容类型，`layout` 则直接指定模板名，见[内容类型](/templates/types/)。

## 祖先与后代

一个 section 有一个或多个祖先（包括首页），以及零个或多个后代。对于：

```text
content/products/product-1/benefits/benefit-1.md
```

内容文件 `benefit-1.md` 有四个祖先：`benefits`、`product-1`、`products` 和首页。这种逻辑关系让我们可以用 `Parent` 与 `Ancestors` 方法遍历站点结构，例如用 `Ancestors` 渲染面包屑导航：

```go-html-template
<nav aria-label="breadcrumb" class="breadcrumb">
  <ol>
    {{ range .Ancestors.Reverse }}
      <li>
        <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
      </li>
    {{ end }}
    <li class="active">
      <a aria-current="page" href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
    </li>
  </ol>
</nav>
```

配合下面的 CSS：

```css
.breadcrumb ol {
  padding-left: 0;
}

.breadcrumb li {
  display: inline;
}

.breadcrumb li:not(:last-child)::after {
  content: "»";
}
```

渲染结果中每个面包屑都指向对应页面：

```text
Home » Products » Product 1 » Benefits » Benefit 1
```

## 列表页里到底能遍历出什么

这是 section 模板最常写错的一处。**实测（Hugo 0.167）**：内容结构为 `products/product-1/{benefits/benefit-1.md, feature-1.md}` 时，`products` 这个 section 页面上：

| 写法 | 结果 | 含义 |
| --- | --- | --- |
| `.Pages` | `Product 1` | 只包含**直接子级**（子 section 与直属页面），不含更深的后代 |
| `.RegularPages` | 空 | 只包含直属的**普通页面**；这里没有，所以为空 |
| `.RegularPagesRecursive` | `Benefit 1`、`Feature 1` | 递归包含全部后代普通页面，不含 section 页 |

所以「列表页只列出了第一层」不是 bug，而是 `.Pages` 的定义。想一次列出所有后代文章，就用 `.RegularPagesRecursive`。

另外两个容易混的方法：

- **`.Section`**：返回页面所属的**顶层** section 名——`benefit-1.md` 的 `.Section` 是 `products`（实测：Hugo 0.167）；
- **`.CurrentSection`**：返回**最近的**祖先 section 页对象——同一个页面的 `.CurrentSection` 是 `Benefits`。

判断「当前是哪个栏目」用 `.CurrentSection`；判断「属于哪个大类」用 `.Section`。

## 索引页与 URL 结构

`_index.md` 在 Hugo 中有特殊作用，它让你可以为 `home`、`section`、`taxonomy`、`term` 页面添加前置元数据与正文。站点首页以及每个内容 section、分类法和术语都可以各有一个 `_index.md`；用 `Site` 或 `Page` 对象的 `GetPage` 方法可以访问其中的内容与元数据。

以典型的 section 列表页为例，文件与 URL 各部分的对应关系如下：

```text
content/posts/_index.md
```

构建后输出到下面的位置：

```text
https://example.org/posts/index.html
```

其中 URL 是 `/posts/`，section 是 `posts`。section 可以嵌套任意深度，关键是要让整棵 section 树都可导航，最下层的 section 至少要包含一个内容文件（即 `_index.md`）。带 `_index.md` 的目录就是[分支包](/content-management/page-bundles/)，首页包内不能包含其他内容页面，但允许放图片等其他文件。

section 中的单个内容文件由单页模板渲染：

```text
content/posts/my-first-hugo-post.md
```

构建后输出到：

```text
https://example.org/posts/my-first-hugo-post/index.html
```

其中 URL 是 `/posts/my-first-hugo-post/`，section 是 `posts`，slug 是 `my-first-hugo-post`。这里的地址假定使用了 Hugo 默认的漂亮 URL 形式，并且项目配置中 `baseURL = "https://example.org/"`。

## 路径的组成

理解下列概念有助于掌握内容组织方式与默认构建行为之间的关系：

section
: 默认内容类型由内容所处的 section 决定，section 则由内容在项目 `content` 目录中的位置决定，不能在前置元数据中指定或覆盖。

slug
: slug 是 URL 路径的最后一段，由页面逻辑路径的最后一段确定，也可以用前置元数据中的 `slug` 覆盖，详见 [URL 管理](/content-management/urls/)。

path
: 内容的 path 由文件所在的 section 路径决定，它基于内容所在位置的路径，并且不包含 slug。

url
: url 是完整的 URL 路径，由文件路径决定，也可以用前置元数据中的 `url` 覆盖，详见 [URL 管理](/content-management/urls/)。

## 什么时候需要 section、什么时候别用

**该用**：

- 需要**栏目级列表页**（`/posts/`、`/docs/`）来汇总下属内容；
- 需要按栏目套用不同模板或不同 `type`；
- 需要给一组页面共享前置元数据（用 `_index.md` 里的 `cascade`）。

**别用**：

- **只想在 URL 里多加一层、不需要列表页**——那样不必放 `_index.md`；顶层目录以外的普通目录只是 URL 的一段，不会产生列表页，也不会进入 `.Pages`。
- **用 section 表达横向关系（标签、作者）**——那是[分类法](/content-management/taxonomies/)的职责；section 是纵向的层级关系。
- **指望通过前置元数据改 section**——section 由目录位置决定，不能在前置元数据里指定或覆盖；要换模板请用 `type` 或 `layout`。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 某个目录没有列表页 | 它不是 section：只有顶层目录，或带 `_index.md` 的目录才是 section | 需要列表页就在该目录放 `_index.md`；用 `hugo list all` 的 `kind` 列确认 |
| 没报错但结果不对 | 列表页只显示第一层内容 | 用的是 `.Pages`（只含直接子级） | 改用 `.RegularPagesRecursive`，见[列表页里到底能遍历出什么](#列表页里到底能遍历出什么) |
| 没报错但结果不对 | 模板里判断「当前栏目」判断错了 | 用的是 `.Section`（永远是顶层名），而不是 `.CurrentSection`（最近祖先） | 需要当前栏目用 `.CurrentSection`；要判断大类才用 `.Section` |
| 没报错但结果不对 | 子 section 用了跟父 section 一样的模板，改不动 | 模板查找只考虑顶层 section 名，不考虑子 section 名 | 在子 section 的 `_index.md` 里写 `type` 或 `layout` 显式指定 |
| 没报错但结果不对 | 面包屑顺序反了或少了首页 | `.Ancestors` 从最近祖先向外返回，需要反向输出；首页是否出现在模板里有站点配置差异 | 用 `.Ancestors.Reverse`，并用 `hugo list all` 对照层级（实测：`benefit-1` 的反向祖先为 首页 → products → product-1 → benefits） |
| 没报错但结果不对 | 分类法页面出现在列表里，把 section 列表搅乱 | `_index.md` 的默认列表包含 `taxonomy`/`term` 之类的页面种类 | 在模板里按 `.Kind` 过滤，或按站点需要处理分类法页面 |
| 报错看不懂 | 报错说找不到模板 / 页面用了意料之外的布局 | 模板查找顺序与实际 `type` 不匹配 | 用[模板查找顺序](/templates/lookup-order/)核对，必要时用 `layout` 显式指定 |

更多排查入口见[故障排查](/troubleshooting/)。

## 延伸阅读

- [目录结构](/getting-started/directory-structure/)
- [前置元数据](/content-management/front-matter/)
- [页面包](/content-management/page-bundles/)
- [内容类型](/templates/types/)
