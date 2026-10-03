+++
title = "页面包"
linkTitle = "页面包"
description = "分支包与叶子包的目录结构与区别、headless bundle 与多语言命名；含配置位置、构建验证方法与最常配错的地方。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/content-management/page-bundles/"

[params.teach]
difficulty = "入门"
time = "20–30 分钟"
prereq = [
  "知道 `content/` 下的目录会在产物里变成同样的路径。",
  "读过[前置元数据](/content-management/front-matter/)，会写 `+++` 块。",
]
outcomes = [
  "看一个目录就能判断它是叶子包、分支包还是普通目录；",
  "说清 `index.md` 与 `_index.md` 的差别，以及两者同时存在时会发生什么；",
  "用 `.Resources` 拿到包内资源，并知道哪些文件不会被渲染成独立页面；",
  "用 `hugo list all` 与 `public/` 目录验证包的结构对不对；",
  "用 `headless`（或 `build` 选项）做出「有资源但不发布页面」的包。",
]
next = ["/content-management/page-resources/", "/content-management/sections/", "/content-management/build-options/"]

+++

## 这一页解决什么问题

页面包（page bundle）是一个目录，把内容与相关资源封装在一起。例如下面这个站点有一个 `about` 页面和一个 `privacy` 页面：

```tree
content/
├── about/
│   ├── index.md
│   └── welcome.jpg
└── privacy.md
```

`about` 页面就是一个页面包：它把资源与内容打包在一起，从而在逻辑上建立关联。页面包内的资源称为[页面资源](/content-management/page-resources/)，可以用 `Page` 对象的 `.Resources` 方法访问。

「页面包」这个词最容易让人困惑的地方在于：它不是一个额外的配置项，**它就是目录结构本身**。你不需要打开任何开关，只需要决定目录里的索引文件叫 `index.md` 还是 `_index.md`，这一个字母就决定了两件完全不同的事：

1. 这个目录是**一个页面**（叶子包），还是**一个可以容纳多个页面的层级**（分支包）；
2. 目录里的图片、PDF、数据文件是能被 `.Resources` 拿到（叶子包），还是会被当作独立内容页渲染（分支包）。

本页先给两类包的对照表，再逐条给出「你应当看到什么」的验证方法，最后把三个高频坑集中列在[常见坑](#常见坑)。

**验证页面包结构的两条命令**（下面每一节都会用到）：

```bash
hugo list all     # 看 Hugo 认出了哪些页面、它们的 kind 与 permalink
```

再看产物的目录结构（Windows 用 `dir` / `Get-ChildItem`，macOS/Linux 用 `find`）：

```bash
ls -R public         # 页面是否生成、资源是否被复制，这里一眼可见
```

**你应当看到什么**：`hugo list all` 的表里有 `kind` 与 `section` 两列——叶子包的 `kind` 是 `page`，分支包的 `kind` 是 `section`（首页是 `home`）。产物里每个页面包对应一个同名目录，目录下是 `index.html` 与复制过来的资源文件。

## 叶子包与分支包

页面包分为叶子包（leaf bundle）与分支包（branch bundle）两类。

叶子包
: 一个包含 `index.md` 文件以及零个或多个资源的目录。类似大树的一片叶子，叶子包位于分支的末端，没有后代。

分支包
: 一个包含 `_index.md` 文件以及零个或多个资源的目录。类似大树的枝干，分支包可以有后代，包括叶子包与其他分支包。顶层目录无论是否含 `_index.md` 文件都是分支包，首页也属于分支包。

> [!NOTE]
> 索引文件的扩展名取决于内容格式。Markdown 内容用 `index.md`，HTML 内容用 `index.html`，AsciiDoc 内容用 `index.adoc`，其余格式依此类推。**换格式时索引文件名要跟着换**，写 `index.md` 却用 AsciiDoc 渲染不会生效。

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

这句话是两类包最本质的区别，值得单独记住：**同一个 `content-1.md`，放在叶子包里就「不是页面」（只能用 `.Resources` 取），放在分支包里就「是页面」（会渲染成 `/…/content-1/`）。**

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

> [!NOTE]
> 叶子包可以创建在 `content` 目录下的任意深度，但一个叶子包内不能再包含另一个包。叶子包没有后代。注意上例里的 `not-a-leaf-bundle`、`another-section` 是普通目录（没有索引文件），目录里的 `.md` 文件各自成为独立页面——**只有带索引文件的目录才是「包」**。

**你应当看到什么**：为 `my-post` 建好后执行 `hugo list all`，只会有 `content/posts/my-post/index.md` 一行（`content-1.md`、`content-2.md` **不出现**，因为它们只是资源）。在模板里 `{{ range .Resources }}{{ .Name }}{{ end }}` 则能把它们四个都列出来。

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

> [!NOTE]
> 分支包可以创建在 `content` 目录下的任意深度，并且可以有后代。

**你应当看到什么**：`hugo list all` 里 `branch-bundle-1/_index.md` 的 `kind` 是 `section`，而 `content-1.md`、`content-2.md` 各占一行、`kind` 是 `page`；产物里会生成 `/branch-bundle-1/`、`/branch-bundle-1/content-1/` 等目录。分支包里的非页面资源（`image-1.jpg`）也会被复制到产物目录下（**实测：Hugo 0.167**）。分支包自己的资源同样可以用 `.Resources` 访问，但**不包括后代包里的文件**——后代包的资源归后代包所有。

## headless bundle

在前置元数据（front matter）中使用[构建选项](/content-management/build-options/)，可以创建不发布的叶子包或分支包，其内容与资源可以供其他页面引用。把 `headless` 设为 `true` 时，Hugo 会同时把 `render` 与 `list` 构建选项设为 `never`。

```toml
+++
title = "共享资源"
headless = true
+++
```

`headless` 适合“整个包都不发布”的简单情形；需要更细地控制页面是否输出、是否进入列表、资源是否复制时，直接使用 `build` 构建选项（`list`、`render`、`publishResources`），也可以配合 `cascade` 统一下发。

**你应当看到什么**（**实测：Hugo 0.167**）：在 `content/headless/` 里放 `index.md`（`headless = true`）和 `x.txt`，构建后

- `public/headless/index.html` **不存在**——页面没有发布；
- `public/headless/x.txt` **存在**——包内资源仍然被复制。

也就是说 `headless` 关掉的是「页面」，不是「资源」。这一点在用它做「图片/数据仓库、由别的页面引用」时正是想要的效果；如果你连资源也不想发布，就要用 `publishResources = false`，见[构建选项](/content-management/build-options/)。

## 与 section 的关系

叶子包与被它替代的单文件页面发布的地址相同，区别在于能否携带同目录下的资源：

```text
content/posts/second-post.md          →  /posts/second-post/
content/posts/second-post/index.md    →  /posts/second-post/
```

同一个目录里不能同时存在 `_index.md` 与 `index.md`。叶子包就是一个普通页面，不会创建新的 section；分支包则可以嵌套分支包，从而形成多级 section，详见[内容区块](/content-management/sections/)。更多目录层面的约定见[目录结构](/getting-started/directory-structure/)。

**实测（Hugo 0.167）**：上面「不能同时存在」这句话的后果需要具体说明——把 `index.md` 与 `_index.md` 放进同一个目录，Hugo **不报错也不警告**（即使加 `--printPathWarnings` 也是退出码 0），结果是 `index.md` 胜出：`hugo list all` 只列出 `index.md`（`kind = page`，permalink 为 `/both/`），`_index.md` 被静默忽略，这个目录**不再是 section**。所以「我加了 `_index.md` 但 section 页没变」的根因，往往是同目录里还留着一个 `index.md`。

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

**你应当看到什么**：多语言构建后，产物里会出现每种语言各自的目录（例如 `/zh/…` 与 `/en/…`），`index.zh.md` 与 `index.en.md` 分别对应这两个页面，而 `cover.zh.jpg` 只会被中文页面的 `.Resources` 拿到。

## 什么时候用叶子包、什么时候别用

| 情形 | 该用什么 |
| --- | --- |
| 一个页面要带自己的图片、PDF、数据文件，且这些文件**不该**变成独立页面 | 叶子包：`目录/index.md` |
| 在某个栏目下放多篇文章，且希望这个栏目自己能有一个介绍页（`/posts/`） | 分支包：`posts/_index.md` + 各自 `.md` |
| 想让某个目录里的 `.md` 各自成为页面，但**不需要**栏目介绍页 | 普通目录，不放索引文件，Hugo 照样把顶层目录当作分支包 |
| 一批资源只给别的页面引用，自己不出现在站点里 | `headless = true` 的包 |
| **别用**：在叶子包里再放一个包 | 叶子包不能有后代；里面嵌套的目录不会成为页面包，索引文件会被忽略 |
| **别用**：把 `image.jpg` 放在 `content/` 根目录下当全局资源 | 根目录的资源不属于任何包，`.Resources` 取不到；全站共享的图片应放到 `assets/` 或 `static/`，见[页面资源](/content-management/page-resources/) |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 模板里 `{{ range .Resources }}` 什么也不输出 | 页面不是叶子包（目录里是 `_index.md`，或没有索引文件）；或资源放在了 `static/` 而不是包目录里 | 确认目录里有 `index.md`，资源与索引文件相邻；用 `hugo list all` 核对 `kind` 是否为 `page` |
| 没报错但结果不对 | 同一个目录里既有 `index.md` 又有 `_index.md`，`_index.md` 像没生效 | `index.md` 胜出、`_index.md` 被静默忽略，构建**不会报错**（实测：Hugo 0.167） | 二选一：要页面就用 `index.md`，要 section 就用 `_index.md`，删掉另一个 |
| 没报错但结果不对 | `content/posts/my-post/` 里的 `notes.md` 没有生成页面 | 它位于叶子包里，属于资源类型 `page`，只能通过 `.Resources` 取 | 想让它成为页面，就把目录改成分支包（索引文件换成 `_index.md`），或把它移出叶子包 |
| 没报错但结果不对 | 设了 `headless = true`，但资源的 URL 还能访问到 | `headless` 只关掉页面渲染与列表，包内资源仍会复制到产物（实测：Hugo 0.167） | 若连资源也不发布，改用 `[build] publishResources = false` |
| 没报错但结果不对 | 多语言站点里某种语言的内容不出现 | 文件名后缀与配置里的语言代码不一致（如配置 `zh-cn` 却写了 `index.zh.md`） | 对照项目配置的 `languages`，把后缀改成完全一致的代码 |
| 报错看不懂 | 页面 URL 与预期差一级目录 | 把 `index.md` 放进了分支包内层，或在分支包里放了 `index.md` 又期待它是 section | 用 `hugo list all` 的 `permalink` 列反查实际路径，再调整目录结构 |

更多排查入口见[故障排查](/troubleshooting/)。
