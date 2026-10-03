+++
title = "前置元数据"
linkTitle = "前置元数据"
description = "前置元数据的三种写法、常用字段、自定义参数、级联与日期回退规则；含配置位置、构建验证方法与最常配错的几处。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/content-management/front-matter/"

[params.teach]
difficulty = "入门"
time = "25–35 分钟"
prereq = [
  "站点能正常构建（`hugo --renderToMemory` 退出码为 0）。",
  "写过至少一篇内容文件，知道 `content/` 目录在哪、文件长什么样。",
]
outcomes = [
  "写出 TOML / YAML / JSON 三种合法前置元数据，并决定整站统一用哪一种；",
  "从字段表里挑对字段，把自定义数据放进 `params` 而不是写在顶层；",
  "用 `.Title`、`.Params`、`.Param`、`.Date` 等方法把元数据读进模板，并预判取不到值时的结果；",
  "用 `cascade` 把值下发给部分后代页面，并用 `hugo list all` 验证；",
  "遇到「字段没生效」「页面日期是 0001-01-01」「构建直接报 front matter 错」时，能定位到具体原因。",
]
next = ["/content-management/page-bundles/", "/content-management/build-options/", "/configuration/front-matter/"]

+++

## 这一页解决什么问题

前置元数据（front matter）是每个内容文件顶部的一段元数据，用来描述内容、补充内容、建立与其他内容的关系、控制站点的发布结构，并决定 Hugo 选用哪个模板。它用 JSON、TOML 或 YAML 之一序列化，Hugo 通过分隔前置元数据与正文的定界符来判断用的是哪一种。

它是全站最容易「没报错但结果不对」的地方：写错一个定界符会让整个构建失败，而写错一个字段名只会让某个值悄悄变成空。这一页把三件事讲清：

1. **写在哪**——定界符、字段、`params`、`cascade`、日期，全部都在**内容文件顶部的这一个块里**；站点级的默认值则在 `hugo.toml` 的 `[frontmatter]`、`[cascade]`、`[taxonomies]` 等区段。
2. **写什么**——保留字段表（写错即无效）、自定义参数（放 `params`）、分类法术语、级联。
3. **怎么写才对**——每种写法后都给出「你应当看到什么」，文末[常见坑](#常见坑)按症状→真因→怎么修集中对照。

验证这一页任何改动的通用断言只有一个：

```bash
hugo list all          # 表格里出现该页，且 title、date、permalink、kind、section 是你预期的值
```

**你应当看到什么**：`hugo list all` 输出的表头固定为
`path,slug,title,date,expiryDate,publishDate,draft,permalink,kind,section`。
你写的 `title` 出现在 `title` 列，`weight`、`draft` 等字段虽然不直接列出来，但会体现在 `permalink` 与页面是否出现上。**没写 `date` 的页面，`date` 列会显示 `0001-01-01T00:00:00Z`**——这不是 bug，是「没有日期」的表示（实测：Hugo 0.167）。

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

**三种写法怎么选**：TOML 是 Hugo 官方文档与本站全站使用的写法，支持不加引号的日期，写 `date = 2024-02-02` 很自然，**新项目直接用 TOML**。YAML 适合你已经有一批 YAML 素材、或与 Jekyll 等工具共用内容的情况。JSON 最啰嗦（每处都要引号、逗号），只在内容由程序生成时才有优势。

### 你应当看到什么

在 `content/` 下新建一个文件，只写 `+++`、`title`、`+++` 三行加一句正文，然后构建：

- 构建**退出码为 0**，`hugo list all` 里出现这一页，`title` 列就是你写的中文标题；
- 如果模板里有 `.Title`，页面上显示的标题是 `title` 的值，**不是文件名**；
- `description` 的值只会出现在模板明确输出它的地方（通常是 `<head>` 里的 `<meta name="description">`），**Hugo 不会自动输出它**——页面上看不到 `description` 属于正常现象，不是配置错了。

### 定界符写错会怎样

**实测（Hugo 0.167）**：把一个 TOML 文件的开头写成 `---`、结尾写成 `+++`，构建直接失败，退出码为 1，报错形如：

```text
ERROR error building site: assemble: failed to create page from pageMetaSource /mismatch: "content/mismatch.md:2:1": EOF looking for end YAML front matter delimiter
```

注意报错指向的是 `mismatch.md:2:1`——**行号指向第一个字段，而不是写错的定界符**，所以先看文件开头的两行定界符。这是全站级失败：一个文件写错，整站构建不出来。

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
| `markup` | `string` | — | 对应某种受支持[内容格式](/content-management/formats/)的标识符；不提供时 Hugo 按文件扩展名判断 |
| `menus` | `string`、`[]string` 或 `map` | — | 设置后把页面加入指定菜单，见[菜单](/content-management/menus/) |
| `modified` | — | — | `lastmod` 的别名 |
| `outputs` | `[]string` | — | 要渲染的输出格式 |
| `params` | `map` | `Params`、`Param` | 自定义页面参数 |
| `pubdate`、`published` | — | — | `publishDate` 的别名 |
| `publishDate` | `string` | `PublishDate` | 发布日期；在该日期之前，若不传 `--buildFuture`，该页不渲染 |
| `resources` | 映射数组 | — | 为[页面资源](/content-management/page-resources/)提供元数据，每个元素支持 `src`、`name`、`title`、`params` 键 |
| `sitemap` | `map` | `Sitemap` | 站点地图选项 |
| `sites` | `map` | — | 为页面定义 sites matrix 与 sites complements（0.153.0 新增） |
| `slug` | `string` | `Slug` | 覆盖 URL 路径的最后一段；对 `home` 页面不适用 |
| `summary` | `string` | `Summary` | 内容摘要或导语；与 `description` 概念不同 |
| `title` | `string` | `Title` | 页面标题 |
| `translationKey` | `string` | `TranslationKey` | 任意值，用于关联同一页面的多个翻译，适合译文路径不相同的场合 |
| `type` | `string` | `Type` | 内容类型，覆盖由页面所在顶层 section（内容区块）推导出的值，见[内容类型](/templates/types/) |
| `unpublishdate` | — | — | `expiryDate` 的别名 |
| `url` | `string` | — | 覆盖整条 URL 路径；对 `home` 页面不适用 |
| `weight` | `int` | `Weight` | 页面权重，用于在页面集合中排序 |

> [!NOTE]
> 上表中的字段名是保留的，例如不能创建名为 `type` 的自定义字段，自定义字段要写在 `params` 键下。把自定义字段写在顶层不会报错，但它既不会被模板通过 `.Params` 读到，也可能与保留字段冲突——所以「自定义数据一律进 `params`」这条没有例外。

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

从模板读取这些值时，使用 `Page` 对象上「模板取值方法」一列给出的方法，例如 `.Title`、`.Date`、`.Params`。**「什么时候别用」**：这一列标 `—` 的字段没有对应的取值方法，不要在模板里试图直接取它们（例如 `.Build`、`.Headless` 不存在）；它们只影响 Hugo 的构建行为，需要判断时用 `.Params` 读到的原始映射，或改用其他方法推断。

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

**两者的分工与边界**（实测：Hugo 0.167）：

- `.Param "author"`：找不到时返回 `nil`，**不会报错**，所以「页面上少了一行」往往就是这里判空了；它适合写「页面参数优先、站点参数兜底」的默认值逻辑。
- `.Params.author`：链式取值，键不存在时同样安静地得到空值；但如果继续往下点（`.Params.author.name`），中途遇到 `nil` 会**直接报错**（形如 `nil pointer evaluating`）。
- 键名含连字符（如 `key-with-hyphens`）时不能用点号连接，必须写 `index .Params "key-with-hyphens"`。

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

**你应当看到什么**：只在前置元数据里写 `tags = ['red']`，构建后产物中会自动多出 `/tags/`（术语总览）与 `/tags/red/`（该术语的页面）；模板里 `.GetTerms "tags"` 能列出 `red` 对应的术语页。

> [!NOTE]
> 术语名在术语页上会做标题化处理：写 `red`，`.Title` 读出来是 `Red`（实测：Hugo 0.167）。如果站点不需要分类法页面，「去掉自动生成的空 `/tags/`、`/categories/`」的做法见[站点配置](/configuration/)：在项目配置里加 `disableKinds = ['taxonomy', 'term']`——本站就是这么配置的，所以本站**不会**生成这些目录。

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

**你应当看到什么**：在模板里打印 `{{ .Params.color }}`，首页的后代页面读到 `red`，**而首页自己读不到**（级联只向下传，不含自己）。

### 目标

`cascade.target` 接受一个页面匹配器（page matcher），把级联值限制在部分页面上[^1]；不指定 target 时，值级联给全部后代页面。匹配器支持的关键字有：`environment`（构建环境的 glob 模式）、`kind`（页面种类的 glob 模式）、`path`（页面逻辑路径的 glob 模式）、`sites`（0.153.0 新增，匹配语言、版本、角色等内容维度的 sites matrix）；`lang` 自 0.153.0 起废弃，请改用 `sites`。

```toml
[cascade.params]
color = 'red'
[cascade.target]
path = '{/articles,/articles/**}'
```

**实测（Hugo 0.167）**：`content/posts/_index.md` 中写 `[cascade.target] path = '/posts/a'`，则 `posts/a` 的参数里有 `color=red`，而兄弟页面 `posts/b` 的参数里**没有** `color`。也就是说 target 确实按页面逻辑路径筛选；不写 target 时兄弟页面也会拿到值。验证方法就是在模板里同时打印两个页面的 `.Params.color`。

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

**你应当看到什么**：模板里要显示日期，正确写法是：

```go-html-template
{{ with .Date }}{{ .Format "2006-01-02" }}{{ end }}
```

**不要**写 `{{ if .Date }}`——`.Date` 的类型是 `time.Time`（结构体），永远为真，没写 `date` 的页面会稳稳地打印出 `0001-01-01`。判断有没有日期要用 `.Date.IsZero`（实测：Hugo 0.167 下 `hugo list all` 对无日期页面显示 `0001-01-01T00:00:00Z`）。

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
- `:filename`：从文件名开头提取日期，支持 `YYYY-MM-DD` 以及 `YYYY-MM-DD-HH-MM-SS`（0.148.0 新增）两种形式，日期与时间之间可以用任意字符分隔（例如 `2025-02-01T14-30-00`）。仅当 `:filename` 是最终生效的日期来源时，Hugo 才会从剩余文件名推导页面的 `slug`；若页面前置元数据中已经定义了 `slug`，则不再推导。例如文件名为 `2025-02-01-article.md` 时，日期为 `2025-02-01`，slug 为 `article`。
- `:git`：文件最后一次修订的 Git 作者日期，需要把 `enableGitInfo` 设为 `true`。

默认的日期字段别名是：`expiryDate` ← `unpublishdate`，`lastmod` ← `modified`，`publishDate` ← `pubdate`、`published`。

**什么时候该改它**：只有当站点确实需要「日期来自 Git 提交时间」或「日期藏在文件名里」时才动 `[frontmatter]`——这是站点级全局设置，改错会让全站页面的「最后更新」集体变形。本站的配置是 `lastmod = [':git', 'lastmod', 'date']`、`date = ['date', ':git']`：优先用写在内容里的日期，缺了才回退到 Git 提交时间。

## 什么时候用哪种定界符（与别用）

| 情形 | 建议 |
| --- | --- |
| 新写内容、站点全站统一 | 用 TOML `+++`，日期可以不写引号，与 Hugo 文档一致 |
| 已有大批 YAML 素材、要与别的工具共用 | 用 YAML `---`，注意 YAML 对缩进敏感，`params` 下要缩进两格 |
| 内容由程序生成、需要严格的数据格式 | 用 JSON `{}`，机器生成不易缩进出错，但人写很痛苦 |
| **别用**：同一文件混用两种定界符 | 构建直接失败，报错行号指向第一个字段，见[上面的实测](#定界符写错会怎样) |
| **别用**：把自定义字段写在顶层 | 字段既读不到也可能撞保留字段，一律放进 `params` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建失败 | `failed to create page from pageMetaSource …: EOF looking for end YAML front matter delimiter` | 定界符不配对（开头 `---` 结尾 `+++`，或漏了结尾那一行） | 看报错里「第一个字段」的行号上方两行，把定界符配成同一对；整站统一用一种格式 |
| 构建失败 | 报错信息里有 `toml: invalid character at start of key: U+00FF` | 文件被写成了 UTF-16LE+BOM（常见于用 Windows PowerShell 的 `Out-File`/`>>` 生成文件） | 用编辑器把文件另存为「UTF-8 无 BOM」；不要用 PowerShell 重定向写内容文件 |
| 没报错但结果不对 | 页面上显示的日期是 `0001-01-01` | 没写 `date`，而模板用了 `{{ if .Date }}`——`time.Time` 永远为真 | 改用 `.Date.IsZero` 判断，或补上 `date` 字段 |
| 没报错但结果不对 | 某字段在页面上永远是空的 | 字段名写错（不在保留字段表里），或自定义字段写在了顶层而不是 `params` 下 | 对照[字段表](#字段)，自定义数据一律放进 `params`，用 `hugo list all` 确认页面字段 |
| 没报错但结果不对 | 新增页面不出现在列表/侧栏里 | `draft = true` 且没传 `--buildDrafts`；或 `publishDate` 在未来、`expiryDate` 已过 | 用 `hugo list drafts`、`hugo list future`、`hugo list expired` 定位，再决定是改字段还是加对应构建参数 |
| 没报错但结果不对 | 加了 `tags` 但分类页没出现（或反而多出空 `/tags/`） | 分类法没在项目配置里声明；或站点用 `disableKinds` 关掉了分类法页面 | 检查项目配置的 `[taxonomies]` 与 `disableKinds`，本站在[站点配置](/configuration/)里关掉了分类法页面 |
| 没报错但结果不对 | 级联的值传到了不该传的页面 | 没写 `cascade.target`，值默认下发给**全部**后代 | 加上 `[cascade.target] path = …` 限定范围并重新构建比对 |
| 报错看不懂 | `nil pointer evaluating` | 链式取值（如 `.Params.author.name`）中途遇到 `nil` | 用 `with` 逐层判空，或改用 `.Param "author"` 这类会安静返回空的方法 |

更多排查入口见[故障排查](/troubleshooting/)。

## 书写建议

- 只写需要的字段；自定义参数尽量放进 `params` 表，避免与保留字段重名。
- 若希望排序与显示稳定可预期，最好显式写出 `date`，需要时再写 `lastmod`。
- `draft`、`publishDate`、`expiryDate`、`cascade`、`build` 等字段会直接改变输出结果，改动后请重新构建确认。
- 页面包中的 `index.md` 与 `_index.md` 同样使用前置元数据，`headless` 等字段见[页面包](/content-management/page-bundles/)。

[^1]: `target` 的别名 `_target` 已弃用，并将在未来的版本中移除。
