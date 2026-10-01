+++
title = "分类法"
linkTitle = "分类法"
description = "配置分类法与术语，为页面归类并生成分类页面。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/content-management/taxonomies/"
+++

## 什么是分类法

Hugo 支持自定义的内容分组机制，称为分类法（taxonomy）。分类法描述内容之间的逻辑关系，由三个层次构成：

分类法（taxonomy）
: 一种可用于归类内容的分类维度。

术语（term）
: 分类法中的一个键（取值）。

值（value）
: 被指派给某个术语的一篇内容。

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

要彻底停用分类法系统，可在项目配置的根层级用 `disableKinds` 停用 `taxonomy` 与 `term` 两种页面类型：

```toml
disableKinds = ["taxonomy", "term"]
```

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

```go-html-template
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

上面的模板会列出每位作者，并附上其所属机构与头像。

也可以为 `authors` 分类法单独创建术语模板：

```go-html-template
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
