+++
title = "内容适配器"
linkTitle = "内容适配器"
description = "用内容适配器在构建站点时根据外部数据动态生成页面。"
date = 2026-10-01
weight = 235
source = "https://gohugo.io/content-management/content-adapters/"
+++

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

## 适用场景与限制

- 适合从外部数据源（JSON、TOML、YAML、XML）批量生成页面与页面资源，并让这些页面与手写内容一起参与模板渲染。
- 每个目录、每种语言最多一个内容适配器，文件名固定为 `_content.gotmpl`。
- 执行期间 `Site` 对象尚未完全初始化，依赖已构建页面的方法不可用，会返回错误。
- 冲突页面的内容不确定，且无法控制处理顺序，可用 `--printPathWarnings` 检测。
