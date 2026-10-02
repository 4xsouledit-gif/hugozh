+++
title = "分类法"
linkTitle = "分类法"
description = "配置分类法与术语、为页面归类并生成分类页面；含配置位置、构建验证方法与最常配错的地方。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/content-management/taxonomies/"

[params.teach]
difficulty = "入门"
time = "20–30 分钟"
prereq = [
  "知道前置元数据（front matter）怎么写，了解 [前置元数据](/content-management/front-matter/)的字段表。",
  "站点能正常构建，能看到 `public/` 或 `hugo list all` 的结果。",
]
outcomes = [
  "在项目配置里声明一个分类法，并在内容里用复数名称为页面打上术语；",
  "用 `hugo list all` 与产物目录确认分类页与术语页真的生成到了哪里；",
  "说清「声明 `[taxonomies]` 会停用默认分类法」与「`disableKinds` 关掉页面」这两件事的区别；",
  "为术语创建分支包，写出分类法模板与术语模板来展示术语自己的元数据与资源。",
]
next = ["/configuration/taxonomies/", "/content-management/sections/", "/content-management/menus/"]

+++

## 这一页解决什么问题

Hugo 支持自定义的内容分组机制，称为分类法（taxonomy）。分类法描述内容之间的逻辑关系，由三个层次构成：

分类法（taxonomy）
: 一种可用于归类内容的分类维度。

术语（term）
: 分类法中的一个键（取值）。

值（value）
: 被指派给某个术语的一篇内容。

它最容易配错的地方不在概念，而在**三处名字**：配置里写什么、前置元数据里写什么、页面生成到哪个路径。三者由同一条规则绑在一起——**配置用「单数键 = 复数值」，前置元数据用「复数值」当字段名**。本页把这条规则、它的例外（术语不会同名时可以用单数）、以及关掉整套机制的方法讲全，并给出逐步验证手段。

**验证分类法是否生效，只做两步**：

```bash
hugo list all        # 看有没有出现 kind = taxonomy / term 的行
```

```bash
ls -R public         # 看有没有 /tags/ 与 /tags/<术语>/ 目录
```

**你应当看到什么**（**实测：Hugo 0.167**）：配置里声明 `[taxonomies]` + `tag = 'tags'`，并让某篇内容的 front matter 写 `tags = ['red']`，构建后产物中会出现

```text
public/tags/index.html        ← 分类法页面：列出该分类法下的全部术语
public/tags/red/index.html    ← 术语页面：列出打上 red 的全部内容
```

`hugo list all` 里也会多出这两行，`kind` 分别是 `taxonomy` 与 `term`。**一个字都没打术语的分类法不会生成这两类页面**——所以「配了却没生成」时，先确认内容里真的写了术语。

以影视站点为例，可以定义演员、导演、制片公司、类型、年份、奖项等多个分类法。在每部影片的 front matter 中为这些分类法写下术语之后，Hugo 会自动为每个演员、导演、制片公司、类型、年份与奖项生成页面，并在页面上列出所有符合该条件的影片。

### 分类法的结构

从分类法的视角看，内容之间的关系如下：

```text
演员                      <- 分类法
    布鲁斯·威利斯          <- 术语
        第六感            <- 值
        不死劫            <- 值
    塞缪尔·杰克逊          <- 术语
        不死劫            <- 值
        复仇者联盟         <- 值
```

从内容的视角看，数据与标签不变，但呈现方式正好相反：

```text
不死劫                    <- 值
    演员                  <- 分类法
        布鲁斯·威利斯       <- 术语
        塞缪尔·杰克逊       <- 术语
    导演                  <- 分类法
        M·奈特·沙马兰       <- 术语
```

## 配置分类法

分类法在项目配置的 `[taxonomies]` 区段里声明，完整的可用键与默认值见[配置分类法](/configuration/taxonomies/)。

Hugo 的默认配置定义了两个分类法：`categories` 与 `tags`。

新建分类法时遵循两条规则：

- 键使用单数形式，例如 `category`；
- 值使用复数形式，例如 `categories`。

随后在 front matter 中使用**值**作为字段名：

```yaml
---
title: 示例
categories:
  - vegetarian
  - gluten-free
tags:
  - appetizer
  - main course
---
```

如果某个分类法在同一页面上不会指派多个术语，键与值都可以使用单数形式：

```toml
[taxonomies]
  author = "author"
```

此时 front matter 中即使只有一个术语，取值仍然是数组：

```yaml
---
title: 示例
author:
  - Robert Smith
---
```

需要注意：显式声明 `[taxonomies]` 之后，未列出的分类法会被停用。要保留默认的两个分类法，必须把它们一并写出：

```toml
[taxonomies]
  author = "author"
  category = "categories"
  tag = "tags"
```

> [!WARNING]
> 这一条是最容易「没报错但结果不对」的地方：在配置里只写 `author = "author"`，原来在用的 `tags`、`categories` 会**静默失效**——`/tags/` 页面不再生成，`.GetTerms "tags"` 也取不到东西，而构建退出码依旧是 0。改配置后一定要重新看产物里还有没有 `/tags/`。

要彻底停用分类法系统，可在项目配置的根层级用 `disableKinds` 停用 `taxonomy` 与 `term` 两种页面类型：

```toml
disableKinds = ["taxonomy", "term"]
```

**你应当看到什么**（**实测：Hugo 0.167**）：同一份内容，加上 `disableKinds = ["taxonomy", "term"]` 后重新构建，产物里**完全没有** `/tags/` 与 `/tags/red/` 目录，`hugo list all` 里也不再有 `kind = taxonomy` / `term` 的行。**本站（Hugo 中文文档）就是这么配置的**，所以如果你照本页示例在本站加 `tags`，是看不到分类页的——那是预期行为，不是配置写错。`disableKinds` 只是不生成这两类页面，**页面里的 `.GetTerms` 仍然可用**。

> [!NOTE]
> `disableKinds` 写在项目配置的**根层级**（`hugo.toml` 顶部的裸键），不能写进某个 `[table]` 之后——否则它会变成那个表的成员而被忽略。同理，声明分类法的 `[taxonomies]` 表头之后不要再写裸键。

## 为内容指派术语

为页面指派一个或多个术语，只需创建以分类法复数名称为名的 front matter 字段，再把术语加入对应的数组：

```toml
+++
title = "示例"
tags = ["标签甲", "标签乙"]
categories = ["分类甲", "分类乙"]
+++
```

每个术语都是一个字符串，分类法是术语的扁平列表，而不是嵌套结构。若需要为术语附加额外数据，请按后文「术语元数据」一节为术语创建页面。

## 生成的默认地址

启用分类法后，Hugo 会同时生成「列出全部术语」的页面与「列出单个术语下全部内容」的页面。例如配置中声明并在 front matter 中使用的 `categories` 分类法，会生成：

- `example.org/categories/`：一个页面，列出该分类法下的全部术语；
- 每个术语各有一个分类法列表页，例如 `/categories/development/`，列出在任何内容文件的 front matter 中被标记为该术语的所有页面。

**术语名会决定 URL，也会被标题化**：术语写作 `red`，URL 是 `/tags/red/`，而在术语页上 `.Title` 读出来是 `Red`（**实测：Hugo 0.167**）。术语里如果有空格或大写，会被转成小写连字符形式的 URL。要覆盖 URL，只能按[术语元数据](#术语元数据)那一节为术语建包、在 `_index.md` 里用 `url`、`slug` 等字段处理。

## 分类法权重

使用名为 `[taxonomy_name]_weight` 的 front matter 键可以指派分类法权重（taxonomic weight）。

```toml
+++
title = "有机化学"
weight = 10
tags_weight = 1000
tags = ["chemistry", "science"]
+++
```

以上 front matter 会让 `organic-chemistry` 页面在 section 页与首页的列表中上浮，同时在 `chemistry` 与 `science` 术语页的列表中下沉。

## 术语元数据

要展示每个术语的元数据，请在 `content` 目录下为术语创建对应的分支包（branch bundle）。

例如先创建 `authors` 分类法：

```toml
[taxonomies]
  author = "authors"
```

再为每个术语建立一个分支包：

```text
content/
└── authors/
    ├── jsmith/
    │   ├── _index.md
    │   └── portrait.jpg
    └── rjones/
        ├── _index.md
        └── portrait.jpg
```

然后为每个术语页面添加 front matter：

```toml
+++
title = "John Smith"
affiliation = "University of Chicago"
+++
```

最后创建一个专门针对 `authors` 分类法的分类法模板：

```go-html-template {file="layouts/authors/taxonomy.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  {{ range .Data.Terms.Alphabetical }}
    <h2><a href="{{ .Page.RelPermalink }}">{{ .Page.LinkTitle }}</a></h2>
    <p>Affiliation: {{ .Page.Params.Affiliation }}</p>
    {{ with .Page.Resources.Get "portrait.jpg" }}
      {{ with .Fill "100x100" }}
        <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="portrait">
      {{ end }}
    {{ end }}
  {{ end }}
{{ end }}
```

上面的模板会列出每位作者，并附上其所属机构与头像。注意 **`.Data.Terms` 只在分类法页面（`/authors/`）上存在**；到了某个术语页面（`/authors/jsmith/`）要去遍历该术语下的内容，要用 `.Pages`，不是 `.Data.Terms`。在术语页上访问 `.Data.Terms` 会得到空值——「模板在分类页好用、在术语页空白」通常就是这个原因。

也可以为 `authors` 分类法单独创建术语模板：

```go-html-template {file="layouts/authors/term.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  <p>Affiliation: {{ .Params.affiliation }}</p>
  {{ with .Resources.Get "portrait.jpg" }}
    {{ with .Fill "100x100" }}
      <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="portrait">
    {{ end }}
  {{ end }}
  {{ .Content }}
  {{ range .Pages }}
    <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ end }}
{{ end }}
```

该模板会先展示作者及其机构与头像，再列出与其关联的内容。术语页面属于分支包，因此可以在包的 `_index.md` 中编写正文内容，并把头像等资源与页面放在一起；两者的组织方式见 [页面包](/content-management/page-bundles/) 与 [页面资源](/content-management/page-resources/)。

**你应当看到什么**：`content/authors/jsmith/_index.md` 建好后，`/authors/jsmith/` 页面上的 `.Params.affiliation` 是你写的机构名，`.Resources.Get "portrait.jpg"` 能取到同目录的头像；这两个值与「分类法页面上 `range .Data.Terms` 里的 `.Page.Params.affiliation`」是同一份数据。

## 什么时候用分类法、什么时候别用

**该用**：

- 内容天然带**多值维度**（标签、分类、作者、系列），且你希望有「按维度汇总」的页面；
- 想让读者能顺着 `/tags/hugo/` 这样的页面把相关内容串起来。

**别用**：

- **只有一两个固定栏目**——那是 section（内容区块）的职责，用目录结构表达，见[内容区块](/content-management/sections/)。分类法是**跨目录**的横向关系，section 是纵向的层级关系。
- **维度只有一个取值、且每个页面都不一样**（例如「作者」在单作者站点里）——建分类法只是多出一堆空转的页面，直接在 `params` 里写一个字符串更简单。
- **站点根本不需要分类页**——那就用 `disableKinds` 关掉，别让空 `/tags/`、`/categories/` 被搜索引擎收录（本站就是这么做的）。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 内容里写了 `tags`，但产物里没有 `/tags/` | 分类法没在项目配置里声明；或声明 `[taxonomies]` 时漏掉了 `tag = 'tags'`（未列出的会被停用）；或站点用 `disableKinds` 关掉了分类页 | 对照[配置分类法](#配置分类法)补齐键值；确认 `disableKinds` 里没有 `taxonomy`/`term`；重新构建看产物 |
| 没报错但结果不对 | front matter 里写了 `tag = 'x'`，却没有归类效果 | 字段名要用分类法的**值**（复数）`tags`，不是配置里的键 `tag` | 把字段名改成复数形式；单个术语也要写成数组 `tags = ['x']` |
| 没报错但结果不对 | 分类页上的术语顺序莫名其妙 | 术语默认按权重与标题排序，不是你输入的顺序 | 用 `.Data.Terms.Alphabetical` / `.ByCount` 明确排序，或用 `[taxonomy_name]_weight` 调权重 |
| 没报错但结果不对 | 术语页模板里 `.Data.Terms` 是空的 | `.Data.Terms` 只存在于分类法页面（`/tags/`），术语页面（`/tags/red/`）要用 `.Pages` | 分类法模板与术语模板分开写，分别放在 `layouts/<分类法>/taxonomy.html` 与 `term.html` |
| 没报错但结果不对 | 术语页 URL 与预期不符 | 术语名决定 URL 且会被小写、连字符化（`Red Blue` → `/tags/red-blue/`） | 需要固定 URL 时，用术语分支包的 `_index.md` 设置 `url` 或 `slug` |
| 报错看不懂 | 加了 `[taxonomies]` 后原来能用的 `tags` 失效 | 显式声明分类法会**替换**默认配置，而不是追加 | 把 `category = 'categories'`、`tag = 'tags'` 一并写回 |

更多排查入口见[故障排查](/troubleshooting/)。
