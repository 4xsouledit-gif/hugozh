+++
title = "内容组织"
linkTitle = "内容组织"
description = "内容目录如何映射为站点的逻辑树、URL 与 section；含目录→URL 对照、验证方法与常见坑。"
date = 2026-10-01
weight = 45
source = "https://gohugo.io/content-management/organization/"

[params.teach]
difficulty = "入门"
time = "10–15 分钟"
prereq = [
  "有一个能构建的站点，知道 `baseURL` 写在项目配置里。",
  "读过[内容区块](/content-management/sections/)，知道顶层目录即 section。",
]
outcomes = [
  "看着 `content/` 的目录树，逐个说出每个文件发布后的 URL；",
  "分清 `index.md`、`_index.md` 与普通 `.md` 文件三者的产物差异；",
  "用 `hugo list all` 的 `permalink` 列与 `public/` 目录树验证自己的判断；",
  "遇到「URL 比预期多一层/少一层」时知道该查哪里。",
]
next = ["/content-management/page-bundles/", "/content-management/sections/", "/content-management/urls/"]

+++

## 这一页解决什么问题

Hugo 假定用于组织源内容的结构，同样用于组织渲染后的站点。内容在 `content/` 目录中的位置构成一棵逻辑树：一级子目录即顶层 section，目录名既是 section 名，也是 URL 的一段。内容属于哪个 section 由它在目录树中的位置决定，不能在前置元数据中指定或覆盖。

换句话说：**在 Hugo 里你不能「配」URL，你只能「摆」目录**（少数例外见 [URL 管理](/content-management/urls/)）。所以这一页要解决的就是一件事——把目录和 URL 的对应关系背下来，然后学会自己验证。

```text
content/posts/second-post.md          →  /posts/second-post/
content/posts/second-post/index.md    →  /posts/second-post/
content/about/index.md                →  /about/
```

同一目录下 `second-post.md` 与 `second-post/index.md` **发布地址相同**，区别只在于后者能携带同目录的资源。

**验证映射关系的两条命令**：

```bash
hugo list all
```

**你应当看到什么**：输出的 `permalink` 列就是每个内容文件的最终地址、`section` 列是它所属的顶层 section。两者与你按目录推测的结果一致，就说明组织方式正确。再用产物目录复核一遍：

```bash
ls -R public
```

产物里出现的正是 `permalink` 对应的目录与 `index.html`。

**实测（Hugo 0.167）**：在 `baseURL = "https://example.org/"` 的项目里，`content/posts/firstpost.md` 的 `permalink` 就是 `https://example.org/posts/firstpost/`，`content/about/index.md` 是 `https://example.org/about/`；`hugo list all` 的 `section` 列还会告诉你每个页面归属的顶层 section（例如 `content/posts/happy/ness.md` 的 section 是 `posts`）。

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

文件路径的构成与产物地址的对应关系如下：

```txt
                   path ("posts/my-first-hugo-post.md")
.       ⊢-----------^------------⊣
.      section        slug
.       ⊢-^-⊣⊢--------^----------⊣
content/posts/my-first-hugo-post.md
```

```txt

                               url ("/posts/my-first-hugo-post/")
                   ⊢------------^----------⊣
       baseurl     section     slug
⊢--------^--------⊣⊢-^--⊣⊢-------^---------⊣
                 permalink
⊢--------------------^---------------------⊣
https://example.org/posts/my-first-hugo-post/index.html
```

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

## 什么时候这样组织、什么时候别这样

**该这样**：

- 目录层级 = 你希望读者看到的导航层级；
- 需要一类内容有统一模板或统一 `cascade` 时，给这个目录放 `_index.md`；
- 页面有自己的图片/数据时，把它做成叶子包（`目录/index.md`）。

**别这样**：

- **为了「整理文件」随意加中间目录**——每一个目录都会出现在 URL 里，除非用 `url`/`slug` 覆盖。中间目录不是 section 时不会产生列表页，但它仍然占一段 URL。
- **用深目录代替分类法**——「2024/05/文章」这类结构可以用，但横向的标签关系应该交给[分类法](/content-management/taxonomies/)。
- **在首页包里放内容页**——首页包（`content/_index.md` 所在目录）不能包含其他内容页面，图片等非页面文件可以。
- **用前置元数据的 `type` 来改 section**——section 由目录位置决定，不可覆盖；要换模板用 `type`/`layout`，要换 URL 用 `url`/`slug`。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | URL 比预期多了一层 | 中间目录也会成为 URL 的一段，即使它不是 section | 用 `url` 或 `slug` 覆盖，或调整目录结构；先用 `hugo list all` 的 `permalink` 列确认现状 |
| 没报错但结果不对 | 两个文件发布到了同一地址，互相覆盖 | `相对目录/x.md` 与 `相对目录/x/index.md` 会产生同一个 URL | 二选一；用 `hugo --printPathWarnings` 检查是否有重复目标路径 |
| 没报错但结果不对 | 页面里的图片 404 | 图片不在页面包目录里，却按相对路径引用 | 把图片移到叶子包并作为页面资源引用，见[页面资源](/content-management/page-resources/) |
| 没报错但结果不对 | 某个目录明明有内容，却没有列表页 | 该目录不是 section（不是顶层目录，也没有 `_index.md`） | 放一个 `_index.md`；见[内容区块](/content-management/sections/) |
| 没报错但结果不对 | 首页包里的内容页没有发布 | 首页包（home bundle）不允许包含其他内容页面 | 把内容页移出首页目录；图片等非页面文件不受限制 |
| 没报错但结果不对 | 本地地址与站点地址不一致，站内链接全错 | `baseURL` 不是真实的站点地址，或构建时用了不同的 `baseURL` | 在项目配置里设对 `baseURL`；本站相关说明见[配置](/configuration/) |

更多排查入口见[故障排查](/troubleshooting/)。

## 延伸阅读

- [内容区块](/content-management/sections/)
- [页面包](/content-management/page-bundles/)
- [页面资源](/content-management/page-resources/)
- [内容类型](/templates/types/)
