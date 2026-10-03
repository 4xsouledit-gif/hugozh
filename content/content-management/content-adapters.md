+++
title = "内容适配器"
linkTitle = "内容适配器"
description = "用内容适配器在构建时根据外部数据动态生成页面；含文件位置、路径规则、验证方法与常见坑。"
date = 2026-10-01
weight = 235
source = "https://gohugo.io/content-management/content-adapters/"

[params.teach]
difficulty = "进阶"
time = "30–40 分钟"
prereq = [
  "会写 `go-html-template`，看得懂 `dict`、`range`、`with`。",
  "读过[页面资源](/content-management/page-resources/)与[数据源](/content-management/data-sources/)。",
]
outcomes = [
  "把 `_content.gotmpl` 放在正确的位置，并让生成的页面出现在预期的 URL 下；",
  "用 `path`、`title`、`params`、`dates` 等键把数据映射成页面，用 `AddResource` 附带资源；",
  "用 `hugo list all` 认出「哪一行是适配器生成的」，并核对它的 URL；",
  "用 `--printPathWarnings` 提前发现页面冲突。",
]
next = ["/content-management/data-sources/", "/content-management/page-resources/", "/troubleshooting/"]

+++

## 这一页解决什么问题

内容适配器（content adapter）是一种在构建站点时动态创建页面的模板。例如，可以用它根据远程数据源生成页面，数据格式可以是 JSON、TOML、YAML 或 XML。

与放在 `layouts` 目录中的模板不同，内容适配器放在 `content` 目录中，每个目录、每种语言最多一个。内容适配器创建页面时，页面的逻辑路径相对于该适配器所在的位置。

最后这句话是本页最关键的规则，也是「页面跑到奇怪的 URL 下」的唯一原因：**适配器所在目录就是所有生成页面的父路径**。

**实测（Hugo 0.167）**：`content/posts/_content.gotmpl` 里写 `path = "/generated"`，生成的页面地址是 `/posts/generated/`；如果写成 `path = "/posts/generated"`，地址会变成 `/posts/posts/generated/`——因为适配器自己已经在 `posts` 目录下了。所以按官方建议**不要写开头的斜杠**，直接写相对路径。

**验证适配器是否生效**：

```bash
hugo list all
```

**你应当看到什么**：`hugo list all` 里会出现一行，它的 `path` 列**是适配器文件本身**（例如 `content/posts/_content.gotmpl`），而 `permalink` 列是生成页面的地址——这是生成页面与手写内容页最明显的区别（手写页面的 `path` 列是它自己的 `.md` 文件）。产物里同时会出现该 URL 对应的 `index.html`。

## 概述

内容适配器（content adapter）是一种在构建站点时动态创建页面的模板。例如，可以用它根据远程数据源生成页面，数据格式可以是 JSON、TOML、YAML 或 XML。

与放在 `layouts` 目录中的模板不同，内容适配器放在 `content` 目录中，每个目录、每种语言最多一个。内容适配器创建页面时，页面的逻辑路径相对于该适配器所在的位置。

```tree
content/
├── articles/
│   ├── _index.md
│   ├── article-1.md
│   └── article-2.md
├── books/
│   ├── _content.gotmpl  <-- 内容适配器
│   └── _index.md
└── films/
    ├── _content.gotmpl  <-- 内容适配器
    └── _index.md
```

内容适配器的约定文件名是 `_content.gotmpl`，其语法与 `layouts` 目录中的模板相同。适配器中可以使用任意模板函数，也可以使用下面这些方法。

## 方法

`AddPage`：向站点添加一个页面。

```go-html-template
{{ $content := dict
  "mediaType" "text/markdown"
  "value" "The _Hunchback of Notre Dame_ was written by Victor Hugo."
}}
{{ $page := dict
  "content" $content
  "kind" "page"
  "path" "the-hunchback-of-notre-dame"
  "title" "The Hunchback of Notre Dame"
}}
{{ .AddPage $page }}
```

`AddResource`：向站点添加一个页面资源。

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  {{ $content := dict
    "mediaType" .MediaType.Type
    "value" .
  }}
  {{ $resource := dict
    "content" $content
    "path" "the-hunchback-of-notre-dame/cover.jpg"
  }}
  {{ $.AddResource $resource }}
{{ end }}
```

之后可以在页面模板中这样取回新添加的资源：

```go-html-template
{{ with .Resources.Get "cover.jpg" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

`Site`：返回页面将被添加到的站点。

```go-html-template
{{ .Site.Title }}
```

> [!NOTE]
> Hugo 执行内容适配器时，`Site` 对象尚未完全初始化。依赖已构建页面的方法，例如 `Site.Pages`，在此阶段不可用，会返回错误。

`Store`：返回一个用于存储与操作键值对的持久数据结构（`maps.Scratch`）。它的主要用途是在启用 `EnableAllLanguages` 时，在多次执行之间传递值。

```go-html-template
{{ .Store.Set "key" "value" }}
{{ .Store.Get "key" }}
```

`EnableAllLanguages`：默认情况下，Hugo 只对站点矩阵中第一个匹配的站点执行一次内容适配器。用这个方法可以把执行扩展到所有语言，同时保持当前的语言角色与版本。

```go-html-template
{{ .EnableAllLanguages }}
```

`EnableAllDimensions`：默认同样只执行一次；用这个方法可以把执行扩展到语言、版本与角色的所有可能组合。

需要更细粒度的控制时，可以在前置元数据或内容挂载（mount）中定义 `sites.matrix`。

## 页面映射

传给 `AddPage` 的映射可以设置任意前置元数据字段，但有两个例外：不要设置 `markup`，而要用 `content.mediaType` 指定内容格式；分类法键（例如 `tags`、`categories`）不要放在顶层，应放进 `params` 映射。

下表是最常传入 `AddPage` 的字段：

| 键 | 说明 | 必填 |
| --- | --- | --- |
| `content.mediaType` | 内容的媒体类型，默认是 `text/markdown` | |
| `content.value` | 内容值，字符串 | |
| `dates.date` | 页面创建日期，`time.Time` 值 | |
| `dates.expiryDate` | 页面失效日期 | |
| `dates.lastmod` | 页面最后修改日期 | |
| `dates.publishDate` | 页面发布日期 | |
| `params` | 页面参数映射 | |
| `path` | 相对于内容适配器的页面逻辑路径，不要包含开头的斜杠与文件扩展名 | 是 |
| `title` | 页面标题 | |

> [!NOTE]
> `path` 是唯一必填字段，但建议同时设置 `title`。
>
> 设置 `path` 时，Hugo 会把给定字符串转换为逻辑路径。例如把 `path` 设为 `A B C`，得到的逻辑路径是 `/section/a-b-c`。

## 资源映射

传给 `AddResource` 的映射字段如下：

| 键 | 说明 | 必填 |
| --- | --- | --- |
| `content.mediaType` | 内容的媒体类型 | 是 |
| `content.value` | 内容值，字符串或资源 | 是 |
| `name` | 资源名称 | |
| `params` | 资源参数映射 | |
| `path` | 相对于内容适配器的资源逻辑路径，不要包含开头的斜杠 | 是 |
| `title` | 资源标题 | |

> [!NOTE]
> 当 `content.value` 是字符串时，Hugo 会新建一个资源，其发布路径相对于页面；如果 `content.value` 本身已经是一个资源，Hugo 直接使用它的值，并相对于站点根目录发布，后者效率更高。
>
> 设置 `path` 时同样会转换为逻辑路径。例如把 `path` 设为 `A B C/cover.jpg`，得到的逻辑路径是 `/section/a-b-c/cover.jpg`。

## 示例：根据远程数据生成书评页面

第 1 步：建立内容结构。

```tree
content/
└── books/
    ├── _content.gotmpl  <-- 内容适配器
    └── _index.md
```

第 2 步：查看远程数据，确定如何把键值对映射到前置元数据字段。

第 3 步：编写内容适配器。

```go-html-template
{{/* 获取远程数据。 */}}
{{ $data := dict }}
{{ $url := "https://gohugo.io/shared/examples/data/books.json" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ errorf "Unable to get remote resource %s: %s" $url . }}
  {{ else with .Value }}
    {{ $data = . | transform.Unmarshal }}
  {{ else }}
    {{ errorf "Unable to get remote resource %s" $url }}
  {{ end }}
{{ end }}

{{/* 添加页面与页面资源。 */}}
{{ range $data }}

  {{/* 添加页面。 */}}
  {{ $content := dict "mediaType" "text/markdown" "value" .summary }}
  {{ $dates := dict "date" (time.AsTime .date) }}
  {{ $params := dict "author" .author "isbn" .isbn "rating" .rating "tags" .tags }}
  {{ $page := dict
    "content" $content
    "dates" $dates
    "kind" "page"
    "params" $params
    "path" .title
    "title" .title
  }}
  {{ $.AddPage $page }}

  {{/* 添加页面资源。 */}}
  {{ $item := . }}
  {{ with $url := $item.cover }}
    {{ with try (resources.GetRemote $url) }}
      {{ with .Err }}
        {{ errorf "Unable to get remote resource %s: %s" $url . }}
      {{ else with .Value }}
        {{ $content := dict "mediaType" .MediaType.Type "value" .Content }}
        {{ $params := dict "alt" $item.title }}
        {{ $resource := dict
          "content" $content
          "params" $params
          "path" (printf "%s/cover.%s" $item.title .MediaType.SubType)
        }}
        {{ $.AddResource $resource }}
      {{ else }}
        {{ errorf "Unable to get remote resource %s" $url }}
      {{ end }}
    {{ end }}
  {{ end }}

{{ end }}
```

第 4 步：创建单页模板渲染每一条书评。模板中可以用 `.Params.author`、`.Params.isbn` 等读取上一步写入的参数，用 `.Resources.GetMatch "cover.*"` 取回封面图，用 `.GetTerms "tags"` 取用标签。

```go-html-template {file="layouts/books/page.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>

  {{ with .Resources.GetMatch "cover.*" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="{{ .Params.alt }}">
  {{ end }}

  <p>Author: {{ .Params.author }}</p>

  <p>
    ISBN: {{ .Params.isbn }}<br>
    Rating: {{ .Params.rating }}<br>
    Review date: {{ .Date | time.Format ":date_long" }}
  </p>

  {{ with .GetTerms "tags" }}
    <p>Tags:</p>
    <ul>
      {{ range . }}
        <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
      {{ end }}
    </ul>
  {{ end }}

  {{ .Content }}
{{ end }}
```

## 多语言项目

在多语言项目中，你可以用 `EnableAllLanguages` 方法为所有语言创建一个内容适配器，也可以为每种语言分别创建内容适配器。

按文件名区分语言时，在适配器文件名中加入语言标识。例如项目配置为：

```toml
[languages.en]
weight = 1

[languages.de]
weight = 2
```

对应的内容结构为：

```tree
content/
└── books/
    ├── _content.de.gotmpl
    ├── _content.en.gotmpl
    ├── _index.de.md
    └── _index.en.md
```

按目录区分语言时，项目配置为：

```toml
[languages.en]
contentDir = 'content/en'
weight = 1

[languages.de]
contentDir = 'content/de'
weight = 2
```

则应在每个目录中各放一个内容适配器：

```tree
content/
├── de/
│   └── books/
│       ├── _content.gotmpl
│       └── _index.md
└── en/
    └── books/
        ├── _content.gotmpl
        └── _index.md
```

## 页面冲突

两个或多个页面发布路径相同时即发生冲突。由于并发处理，最终发布页面的内容是未定义的，也无法指定处理顺序。例如目录中已有 `books/the-hunchback-of-notre-dame.md`，而同一目录下的内容适配器又创建 `books/the-hunchback-of-notre-dame`，就会导致这种结果。构建项目时可以用 `--printPathWarnings` 标志检测页面冲突。

## 什么时候用内容适配器、什么时候别用

**该用**：

- 页面内容来自**外部数据源**（API、导出的 JSON/CSV、产品目录、书评），且数量大、手写不现实；
- 需要在构建时把数据与手写内容混在同一个栏目里，并让它们共用模板、分类法与页面资源。

**别用**：

- **只想在模板里显示外部数据**（不做成独立页面）——那是[数据源](/content-management/data-sources/)加模板输出的事，不需要生成页面；
- **想批量改已有页面的前置元数据**——内容适配器只负责「创建」，不会修改手写文件；统一改元数据请用 `cascade`；
- **内容页很少、且要人工润色**——直接写 Markdown 更省事，适配器的调试成本高于收益；
- **每次构建都要联网抓数据**——注意 `resources.GetRemote` 的失败会直接影响构建，示例里用 `try` + `errorf` 把失败显式暴露出来，别把错误吞掉。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 生成的页面 URL 多了一层 / 少了一层 | `path` 是相对于**适配器所在目录**的；写了绝对式路径就会叠加 | 去掉开头的 `/`，只写相对路径；用 `hugo list all` 的 `permalink` 列核对（实测：Hugo 0.167） |
| 没报错但结果不对 | 适配器完全没有执行 | 文件名不对（必须是 `_content.gotmpl`）；放错了目录（必须在 `content/` 下）；同一目录里已有同路径的页面把它覆盖了 | 核对文件名与位置；用 `--printPathWarnings` 检查冲突 |
| 没报错但结果不对 | 生成页面的 `tags` 等分类法取不到 | 分类法键没有放进 `params`，而是写在了页面映射顶层 | 把 `tags`/`categories` 放进 `params`，模板里用 `.GetTerms "tags"` 取 |
| 没报错但结果不对 | `content.value` 的内容格式不对，页面渲染异常 | 没有设置 `content.mediaType`（默认 `text/markdown`） | 显式写 `content.mediaType`，取值参见[内容格式](/content-management/formats/) |
| 没报错但结果不对 | 页面内容在两次构建之间「随机」变化 | 适配器与其他页面（或另一个适配器）产生了相同发布路径，并发下内容不确定 | 消除冲突路径；用 `hugo --printPathWarnings` 定位 |
| 报错看不懂 | `errorf` 报 `Unable to get remote resource …` | 远程资源抓取失败（网络、地址变更、被限流） | 确认 URL 可访问；国内网络环境注意代理设置；临时失败可在 CI 里重试 |
| 报错看不懂 | 报错说 `Site.Pages` 之类不可用 | 执行内容适配器时 `Site` 对象尚未完全初始化 | 只用本页列出的方法与不依赖已构建页面的函数；需要跨次执行传值用 `.Store` |
| 报错看不懂 | 多语言站点里只有一种语言生成了页面 | 默认只对站点矩阵中第一个匹配站点执行一次 | 需要所有语言都生成时调用 `.EnableAllLanguages`，或用 `sites.matrix` 精确控制 |

更多排查入口见[故障排查](/troubleshooting/)。

## 适用场景与限制

- 适合从外部数据源（JSON、TOML、YAML、XML）批量生成页面与页面资源，并让这些页面与手写内容一起参与模板渲染。
- 每个目录、每种语言最多一个内容适配器，文件名固定为 `_content.gotmpl`。
- 执行期间 `Site` 对象尚未完全初始化，依赖已构建页面的方法不可用，会返回错误。
- 冲突页面的内容不确定，且无法控制处理顺序，可用 `--printPathWarnings` 检测。
