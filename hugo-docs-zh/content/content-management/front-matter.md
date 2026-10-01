+++
title = "前置元数据"
linkTitle = "前置元数据"
description = "前置元数据的三种写法、常用字段、自定义参数、级联与日期回退规则。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/content-management/front-matter/"
+++

前置元数据（front matter）是每个内容文件顶部的一段元数据，用来描述内容、补充内容、建立与其他内容的关系、控制站点的发布结构，并决定 Hugo 选用哪个模板。它用 JSON、TOML 或 YAML 之一序列化，Hugo 通过分隔前置元数据与正文的定界符来判断用的是哪一种。

## 三种写法

TOML 使用一对 `+++`：

```toml
+++
title = '示例'
date = 2024-02-02T04:14:54-08:00
draft = false
weight = 10
[params]
author = 'John Smith'
+++
```

YAML 使用一对 `---`：

```yaml
---
title: 示例
date: 2024-02-02T04:14:54-08:00
draft: false
weight: 10
params:
  author: John Smith
---
```

JSON 使用一对花括号：

```json
{
  "title": "示例",
  "date": "2024-02-02T04:14:54-08:00",
  "draft": false,
  "weight": 10,
  "params": {
    "author": "John Smith"
  }
}
```

前置元数据字段可以是布尔值、整数、浮点数、字符串、数组或映射。注意 TOML 还支持不加引号的日期时间值。同一个文件里不要混用两种定界符，整个站点也建议统一。

## 字段

最常用的字段是 `date`、`draft`、`title` 和 `weight`，其余可用字段见下表。

| 字段 | 类型 | 模板取值方法 | 说明 |
| --- | --- | --- | --- |
| `aliases` | `[]string` | `Aliases` | 应重定向到当前页面的页面相对或站点相对路径，构建时解析为服务器相对 URL，见 [URL 管理](/content-management/urls/) |
| `build` | `map` | — | [构建选项](/content-management/build-options/)映射 |
| `cascade` | `map` | — | 向下传递给后代页面的字段映射，也可写成映射数组 |
| `date` | `string` | `Date` | 页面日期，通常是创建日期 |
| `description` | `string` | `Description` | 页面描述，通常渲染到已发布 HTML 的 `head`/`meta` 中；与 `summary` 概念不同 |
| `draft` | `bool` | `Draft` | 为 `true` 时，若不向 `hugo` 命令传 `--buildDrafts`，该页不渲染 |
| `expiryDate` | `string` | `ExpiryDate` | 过期日期；到达或超过该日期后，若不传 `--buildExpired`，该页不渲染 |
| `headless` | `bool` | — | 仅适用于[叶子包](/content-management/page-bundles/)，把 `render` 与 `list` 构建选项都设为 `never`，得到只提供页面资源的 headless bundle |
| `isCJKLanguage` | `bool` | — | 内容是否为 CJK 语言，决定 Hugo 如何统计字数，影响 `FuzzyWordCount`、`ReadingTime`、`Summary`、`WordCount` 的取值；设置后优先于配置中 `hasCJKLanguage` 的自动检测 |
| `keywords` | `[]string` | `Keywords` | 关键词数组，通常渲染到 `meta` 中，也可用作分类法（taxonomy）术语 |
| `lastmod` | `string` | `Lastmod` | 页面最后修改日期 |
| `layout` | `string` | `Layout` | 模板名，用于覆盖默认的模板查找顺序，取值是不含扩展名的模板基名 |
| `linkTitle` | `string` | `LinkTitle` | 通常是 `title` 的简短版本 |
| `markup` | `string` | — | 对应某种受支持[内容格式](/content-management/content-formats/)的标识符；不提供时 Hugo 按文件扩展名判断 |
| `menus` | `string`、`[]string` 或 `map` | — | 设置后把页面加入指定菜单，见[菜单](/content-management/menus/) |
| `modified` | — | — | `lastmod` 的别名 |
| `outputs` | `[]string` | — | 要渲染的输出格式 |
| `params` | `map` | `Params`、`Param` | 自定义页面参数 |
| `pubdate`、`published` | — | — | `publishDate` 的别名 |
| `publishDate` | `string` | `PublishDate` | 发布日期；在该日期之前，若不传 `--buildFuture`，该页不渲染 |
| `resources` | 映射数组 | — | 为[页面资源](/content-management/page-resources/)提供元数据，每个元素支持 `src`、`name`、`title`、`params` 键 |
| `sitemap` | `map` | `Sitemap` | 站点地图选项 |
| `sites` | `map` | — | 为页面定义 sites matrix 与 sites complements（自 Hugo 0.153.0 起） |
| `slug` | `string` | `Slug` | 覆盖 URL 路径的最后一段；对 `home` 页面不适用 |
| `summary` | `string` | `Summary` | 内容摘要或导语；与 `description` 概念不同 |
| `title` | `string` | `Title` | 页面标题 |
| `translationKey` | `string` | `TranslationKey` | 任意值，用于关联同一页面的多个翻译，适合译文路径不相同的场合 |
| `type` | `string` | `Type` | 内容类型，覆盖由页面所在顶层 section（内容区块）推导出的值，见[内容类型](/templates/types/) |
| `unpublishdate` | — | — | `expiryDate` 的别名 |
| `url` | `string` | — | 覆盖整条 URL 路径；对 `home` 页面不适用 |
| `weight` | `int` | `Weight` | 页面权重，用于在页面集合中排序 |

> **注意**：上表中的字段名是保留的，例如不能创建名为 `type` 的自定义字段，自定义字段要写在 `params` 键下。

`sites` 字段的配置示例如下（示例文件为 `content/_index.md`）：

```toml
+++
title = 'Home'
[sites.matrix]
languages = ["en","fr"]
versions = ["v1.2.*","v2.*.*"]
roles = ["**"]
[sites.complements]
versions = ["v3.*.*"]
+++
```

从模板读取这些值时，使用 `Page` 对象上「模板取值方法」一列给出的方法，例如 `.Title`、`.Date`、`.Params`。

## 自定义参数

在 `params` 键下指定自定义页面参数：

```toml
+++
title = '示例'
date = 2024-02-02T04:14:54-08:00
[params]
author = 'John Smith'
+++
```

模板中通过 `Page` 对象的 `.Params` 或 `.Param` 方法读取。`.Param` 先在页面参数中查找，找不到时回退到站点参数。

## 分类法

在配置中声明分类法，例如：

```toml
[taxonomies]
tag = 'tags'
genre = 'genres'
```

然后在前置元数据里按复数形式写入术语：

```toml
+++
title = '示例'
tags = ['red','blue']
genres = ['mystery','romance']
+++
```

可以给这些页面种类（page kind）添加分类法术语：`home`、`page`、`section`、`taxonomy`、`term`。模板中用 `.Params` 或 `.GetTerms` 读取，例如：

```go-html-template
{{ with .GetTerms "tags" }}
  <p>Tags</p>
  <ul>
    {{ range . }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 级联

级联（cascade）把前置元数据中的值向下传递给后代页面，除非被后代自身或更近的祖先覆盖。多语言项目更适合在项目配置中定义级联值，可以避免为每种语言重复书写。

例如，把 `color` 页面参数从首页级联给全部后代：

```toml
+++
title = 'Home'
[cascade.params]
color = 'red'
+++
```

### 目标

`cascade.target` 接受一个页面匹配器（page matcher），把级联值限制在部分页面上[^1]；不指定 target 时，值级联给全部后代页面。匹配器支持的关键字有：`environment`（构建环境的 glob 模式）、`kind`（页面种类的 glob 模式）、`path`（页面逻辑路径的 glob 模式）、`sites`（自 0.153.0 起，匹配语言、版本、角色等内容维度的 sites matrix）；`lang` 自 0.153.0 起废弃，请改用 `sites`。

```toml
[cascade.params]
color = 'red'
[cascade.target]
path = '{/articles,/articles/**}'
```

### 切片

用级联映射数组可以给不同目标设置不同值：

```toml
+++
title = 'Home'
[[cascade]]
[cascade.params]
color = 'red'
[cascade.target]
path = '{/articles,/articles/**}'
[[cascade]]
[cascade.params]
color = 'blue'
[cascade.target]
path = '{/tutorials,/tutorials/**}'
+++
```

## Emacs Org Mode 写法

内容格式为 Emacs Org Mode 时，可以用 Org Mode 关键字提供前置元数据：

```text
#+TITLE: Example
#+DATE: 2024-02-02T04:14:54-08:00
#+DRAFT: false
#+AUTHOR: John Smith
#+GENRES: mystery
#+GENRES: romance
#+TAGS: red
#+TAGS: blue
#+WEIGHT: 10
```

数组元素也可以写在一行里：

```text
#+TAGS[]: red blue
```

## 日期

无论是自定义页面参数，还是四个预定义的日期字段（`date`、`expiryDate`、`lastmod`、`publishDate`），都应使用下列可解析格式之一：

| 格式 | 时区 |
| --- | --- |
| `2023-10-15T13:18:50-07:00` | `America/Los_Angeles` |
| `2023-10-15T13:18:50-0700` | `America/Los_Angeles` |
| `2023-10-15T13:18:50Z` | `Etc/UTC` |
| `2023-10-15T13:18:50` | 默认 `Etc/UTC` |
| `2023-10-15` | 默认 `Etc/UTC` |
| `15 Oct 2023` | 默认 `Etc/UTC` |

后三种不是完整限定格式，时区默认为 `Etc/UTC`。要覆盖默认时区，在项目配置中设置 `timeZone`；时区的判定优先级依次为：日期时间字符串里的时区偏移、项目配置中指定的时区、`Etc/UTC`。

## 日期的回退顺序

`Page` 对象上有四个返回日期的方法：`Date`、`ExpiryDate`、`Lastmod`、`PublishDate`。Hugo 依据项目配置中 `[frontmatter]` 区段的设置决定它们的取值顺序。例如 `ExpiryDate` 方法在 `expirydate` 存在时返回该值，否则返回 `unpublishdate`。

```toml
[frontmatter]
date = ["myDate", "date"]
```

上例中，`Date` 方法在 `myDate` 存在时返回它，否则返回 `date`。要让列表回退到默认的日期序列，使用 `:default` 记号：

```toml
[frontmatter]
date = ["myDate", ":default"]
```

此时若 `myDate` 不存在，则取 `date`、`publishdate`、`pubdate`、`published`、`lastmod`、`modified` 中第一个有效日期。可用的记号还有：

- `:fileModTime`：文件的最后修改时间戳。
- `:filename`：从文件名开头提取日期，支持 `YYYY-MM-DD` 以及 `YYYY-MM-DD-HH-MM-SS`（自 0.148.0 起）两种形式，日期与时间之间可以用任意字符分隔（例如 `2025-02-01T14-30-00`）。仅当 `:filename` 是最终生效的日期来源时，Hugo 才会从剩余文件名推导页面的 `slug`；若页面前置元数据中已经定义了 `slug`，则不再推导。例如文件名为 `2025-02-01-article.md` 时，日期为 `2025-02-01`，slug 为 `article`。
- `:git`：文件最后一次修订的 Git 作者日期，需要把 `enableGitInfo` 设为 `true`。

默认的日期字段别名是：`expiryDate` ← `unpublishdate`，`lastmod` ← `modified`，`publishDate` ← `pubdate`、`published`。

## 书写建议

- 只写需要的字段；自定义参数尽量放进 `params` 表，避免与保留字段重名。
- 若希望排序与显示稳定可预期，最好显式写出 `date`，需要时再写 `lastmod`。
- `draft`、`publishDate`、`expiryDate`、`cascade`、`build` 等字段会直接改变输出结果，改动后请重新构建确认。
- 页面包中的 `index.md` 与 `_index.md` 同样使用前置元数据，`headless` 等字段见[页面包](/content-management/page-bundles/)。

[^1]: `target` 的别名 `_target` 已弃用，并将在未来的版本中移除。
