+++
title = "页面资源"
linkTitle = "页面资源"
description = "页面资源的概念、模板访问方法、发布控制，以及图像处理的入口。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/content-management/page-resources/"
+++

页面资源（page resource）是只允许从[页面包](/content-management/page-bundles/)访问的文件，也就是根目录下带有 `index.md` 或 `_index.md` 的那些目录中的文件。页面资源只对与它打包在一起的那个页面可用，叶子包与分支包都是如此。

下例中，`first-post` 是一个页面包，可以访问包括音频、数据、文档、图片和视频在内的 10 个页面资源；`second-post` 虽然也是页面包，却没有页面资源，也无法直接访问与 `first-post` 关联的资源。

```tree
content
└── post
    ├── first-post
    │   ├── images
    │   │   ├── a.jpg
    │   │   ├── b.jpg
    │   │   └── c.jpg
    │   ├── index.md (页面包的根)
    │   ├── latest.html
    │   ├── manual.json
    │   ├── notice.md
    │   ├── office.mp3
    │   ├── pocket.mp4
    │   ├── rating.pdf
    │   └── safety.txt
    └── second-post
        └── index.md (页面包的根)
```

## 在模板中访问资源

用下列任一方法在 `Page` 对象上获取页面资源：

| 方法 | 用途 |
| --- | --- |
| `.Resources.Get` | 按资源路径精确取一个，取不到返回空值 |
| `.Resources.GetMatch` | 按通配模式取第一个匹配项 |
| `.Resources.Match` | 按通配模式取全部匹配项，返回集合 |
| `.Resources.ByType` | 按资源类型（如 `image`）筛选 |

取得资源后，再用适用的 `Resource` 方法返回值或执行操作。下面的例子假定这样的内容结构：

```tree
content/
└── example/
    ├── data/
    │  └── books.json   <-- 页面资源
    ├── images/
    │  ├── a.jpg        <-- 页面资源
    │  └── b.jpg        <-- 页面资源
    ├── snippets/
    │  └── text.md      <-- 页面资源
    └── index.md
```

渲染单张图片，并在文件不存在时报错：

```go-html-template
{{ $path := "images/a.jpg" }}
{{ with .Resources.Get $path }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ else }}
  {{ errorf "Unable to get page resource %q" $path }}
{{ end }}
```

渲染全部图片，并缩放到宽 300 像素：

```go-html-template
{{ range .Resources.ByType "image" }}
  {{ with .Resize "300x" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

渲染 Markdown 片段：

```go-html-template
{{ with .Resources.Get "snippets/text.md" }}
  {{ .Content }}
{{ end }}
```

列出数据文件中的书名，并在文件不存在时报错：

```go-html-template
{{ $path := "data/books.json" }}
{{ with .Resources.Get $path }}
  {{ with . | transform.Unmarshal }}
    <p>Books:</p>
    <ul>
      {{ range . }}
        <li>{{ .title }}</li>
      {{ end }}
    </ul>
  {{ end }}
{{ else }}
  {{ errorf "Unable to get page resource %q" $path }}
{{ end }}
```

资源类型与文件扩展名的对应关系见[内容格式](/content-management/content-formats/)；图片资源还可以继续调用图像处理方法，见[图像处理](/content-management/image-processing/)。页面资源是否复制到输出目录，由 `build` 构建选项控制，见[构建选项](/content-management/build-options/)。

## 资源元数据

页面资源的元数据在对应页面的前置元数据（front matter）中用名为 `resources` 的数组参数管理。

> **注意**：资源类型为 `page` 的资源，其 `Title` 等值来自它自己的前置元数据，而不是这里配置的元数据。

`src`
: （`string`，必填）一个 glob 模式，按文件路径匹配一个或多个页面资源，路径相对于页面包。匹配不区分大小写。当模式匹配到多个资源时，同一份元数据会应用到每一个资源。

`name`
: （`string`）设置 `Name` 方法返回的值，支持 `:counter` 占位符。赋值之后，用 `name` 而不是原文件路径去调用 `.Resources.Get`、`.Resources.Match` 和 `.Resources.GetMatch`。

`title`
: （`string`）设置 `Title` 方法返回的值，支持 `:counter` 占位符。

`params`
: （`map`）自定义键值对映射。当多个数组条目匹配同一个资源时，它们的 `params` 映射会合并，重复的键以后面的条目为准。

元数据示例如下：

```yaml
---
title: Application
date: 2018-01-25
resources:
  - src: images/sunset.jpg
    name: header
  - src: documents/photo_specs.pdf
    title: Photo Specifications
  - src: documents/guide.pdf
    title: Instruction Guide
  - src: documents/checklist.pdf
    title: Document Checklist
  - src: documents/payment.docx
    title: Proof of Payment
  - src: "**.pdf"
    name: pdf-file-:counter
    params:
      icon: pdf
  - src: "**.docx"
    params:
      icon: word
---
```

从上例可见：

- `sunset.jpg` 获得了新的 `Name`，因此可以用 `.GetMatch "header"` 找到。
- `documents/photo_specs.pdf`、`documents/guide.pdf`、`documents/checklist.pdf` 和 `documents/payment.docx` 会取得 `title` 设定的 `Title`。
- 所有 PDF 文件都会获得 `pdf` 图标和新的 `Name`，由于 `name` 中含有 `:counter` 占位符，`Name` 依次为 `pdf-file-1`、`pdf-file-2`、`pdf-file-3`。
- 所有 `.docx` 文件都会获得 `word` 图标。

> **注意**：对 `name` 和 `title` 而言，第一个匹配的数组条目生效，后面的匹配会被忽略；对 `params` 而言，所有匹配的条目都会参与，重复的键以后面的条目为准。把更具体的 `src` 模式放在更宽泛的通配模式之前，才能控制最终生效的 `name` 与 `title`。

### `:counter` 占位符

`:counter` 是 `resources` 的 `name` 与 `title` 参数中可识别的特殊占位符。每个不同的 `src` 模式分别为 `name` 和 `title` 维护独立的计数器，都从 1 开始，并在匹配到第一个资源时起算。

例如某个包中有 `photo_specs.pdf`、`other_specs.pdf`、`guide.pdf` 和 `checklist.pdf` 四个资源，前置元数据写成：

```toml
+++
title = 'Engine inspections'
[[resources]]
  src = '*specs.pdf'
  title = 'Specification #:counter'
[[resources]]
  src = '**.pdf'
  name = 'pdf-file-:counter.pdf'
+++
```

各资源文件的 `Name` 与 `Title` 就会被赋予如下值：

| 资源文件 | `Name` | `Title` |
| --- | --- | --- |
| `checklist.pdf` | `"pdf-file-1.pdf"` | `"checklist.pdf"` |
| `guide.pdf` | `"pdf-file-2.pdf"` | `"guide.pdf"` |
| `other_specs.pdf` | `"pdf-file-3.pdf"` | `"Specification #1"` |
| `photo_specs.pdf` | `"pdf-file-4.pdf"` | `"Specification #2"` |

## 多语言下的共享资源

在多语言单主机项目中，Hugo 默认不会在构建时重复复制共享的页面资源。

> **注意**：这一行为只适用于 Markdown 内容。其他[内容格式](/content-management/content-formats/)的共享页面资源会被复制到每种语言的包中。

例如项目配置为：

```toml
defaultContentLanguage = 'de'
defaultContentLanguageInSubdir = true

[languages.de]
label = 'Deutsch'
locale = 'de-DE'
weight = 1

[languages.en]
label = 'English'
locale = 'en-US'
weight = 2
```

内容结构为：

```tree
content/
└── my-bundle/
    ├── a.jpg     <-- 共享页面资源
    ├── b.jpg     <-- 共享页面资源
    ├── c.de.jpg
    ├── c.en.jpg
    ├── index.de.md
    └── index.en.md
```

Hugo 会把共享资源放在默认内容语言的页面包中：

```tree
public/
├── de/
│   ├── my-bundle/
│   │   ├── a.jpg     <-- 共享页面资源
│   │   ├── b.jpg     <-- 共享页面资源
│   │   ├── c.de.jpg
│   │   └── index.html
│   └── index.html
├── en/
│   ├── my-bundle/
│   │   ├── c.en.jpg
│   │   └── index.html
│   └── index.html
└── index.html
```

这种做法可以减少构建时间、存储占用、带宽消耗与部署时间，从而降低成本。此时要让 Markdown 中的链接与图片目标解析到正确位置，必须使用链接渲染钩子与图片渲染钩子：用 `.Resources.Get` 取得页面资源，再调用它的 `.RelPermalink`。默认配置下，只要共享页面资源的复制功能处于关闭状态，Hugo 就会为多语言单主机项目自动使用内置的链接与图片渲染钩子；如果项目、模块或主题定义了自定义的链接或图片渲染钩子，则改用自定义的。

尽管重复复制共享页面资源效率不高，仍可以在项目配置中启用它：

```toml
[markup.goldmark]
duplicateResourceFiles = true
```
