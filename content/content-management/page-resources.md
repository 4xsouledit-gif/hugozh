+++
title = "页面资源"
linkTitle = "页面资源"
description = "页面资源的概念、模板访问方法、资源元数据与发布控制；含返回值边界、构建验证方法与最常配错的地方。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/content-management/page-resources/"

[params.teach]
difficulty = "进阶"
time = "25–35 分钟"
prereq = [
  "读过[页面包](/content-management/page-bundles/)，知道 `index.md` 与 `_index.md` 的区别。",
  "会写最基本的 `go-html-template` 模板，能看懂 `with` 与 `range`。",
]
outcomes = [
  "用 `.Resources.Get` / `.GetMatch` / `.Match` / `.ByType` 四种方式取到包内资源，并说清取不到时各自返回什么；",
  "在前置元数据里用 `[[resources]]` 给资源改 `name`、`title`、加自定义 `params`，并知道多条规则谁生效；",
  "用 `hugo` 产物目录确认资源到底有没有被复制、复制到了哪里；",
  "预判「资源明明在目录里，模板却取不到」的三类原因。",
]
next = ["/content-management/image-processing/", "/content-management/build-options/", "/methods/page/resources/"]

+++

## 这一页解决什么问题

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

「资源」这个词容易让人以为是一个额外的注册步骤。不是：**你把文件放进页面包目录，它就已经是页面资源了**，不需要在任何地方声明。这一页要解决的是三个后续问题：

1. **怎么取**——`.Resources` 上的四个方法各管什么；
2. **怎么改名、加元数据**——前置元数据里的 `[[resources]]` 数组；
3. **会不会发布**——资源复制到 `public/` 的规则，以及取不到时是「安静为空」还是「报错」。

**验证页面资源的标准动作**：在包目录放一个文件，在模板里把它打印出来，然后构建并看产物。

```go-html-template {file="layouts/page.html"}
{{ range .Resources }}{{ .Name }} | {{ .ResourceType }} | {{ .Title }}{{ end }}
```

**你应当看到什么**（**实测：Hugo 0.167**）：在 `content/posts/c/index.md` 旁放一个 `data.json`，上面的模板输出 `data.json | application | data.json`——即 `.Name` 默认是文件名，`.ResourceType` 由**媒体类型**推导（JSON 文件是 `application`，不是 `data`），`.Title` 默认也是文件名。产物里同时出现 `public/posts/c/index.html` 与 `public/posts/c/data.json`。

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

资源类型与文件扩展名的对应关系见[内容格式](/content-management/formats/)；图片资源还可以继续调用图像处理方法，见[图像处理](/content-management/image-processing/)。页面资源是否复制到输出目录，由 `build` 构建选项控制，见[构建选项](/content-management/build-options/)。

### 四个方法的返回值边界

这是判断「资源没了」还是「写法不对」的关键：

| 写法 | 目标不存在时 | 会不会报错 |
| --- | --- | --- |
| `{{ with .Resources.Get "images/a.jpg" }}…{{ end }}` | 整块跳过，**安静为空** | 否 |
| `{{ .Resources.Get "images/a.jpg" }}` 直接取值 | 得到 `nil`，继续点它的方法会崩 | 否（但链式取值时报 `nil pointer evaluating`） |
| `{{ range .Resources.GetMatch "images/*" }}` | 空集合，`range` 不输出 | 否 |
| `{{ range .Resources.Match "images/*" }}` | 空集合，`range` 不输出 | 否 |
| `{{ range .Resources.ByType "image" }}` | 空集合，`range` 不输出 | 否 |
| 上面示例里的 `{{ else }}{{ errorf … }}{{ end }}` | **主动报错并中止构建** | 是 |

**什么时候该用 `errorf`**：只有「这个资源必须有，缺了就是内容出错」时才用——它能让构建失败、把问题顶到台面上。只想「有就显示、没有就跳过」时，用 `with` 就够了，**不要**用 `errorf`，否则以后删一张图片就会让整站构建不过。

## 资源元数据

页面资源的元数据在对应页面的前置元数据（front matter）中用名为 `resources` 的数组参数管理。

> [!NOTE]
> 资源类型为 `page` 的资源（页面包里那些 `.md`、`.html` 文件），其 `Title` 等值来自它自己的前置元数据，而不是这里配置的元数据。

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

> [!NOTE]
> 对 `name` 和 `title` 而言，第一个匹配的数组条目生效，后面的匹配会被忽略；对 `params` 而言，所有匹配的条目都会参与，重复的键以后面的条目为准。把更具体的 `src` 模式放在更宽泛的通配模式之前，才能控制最终生效的 `name` 与 `title`。

**你应当看到什么**（**实测：Hugo 0.167**）：把上面的规则换成 TOML 形式，只给一个 `data.json` 配规则：

```toml
+++
title = 'C'
[[resources]]
  src = 'data.json'
  name = 'mydata'
  title = 'My Data'
  [resources.params]
  kind = 'config'
+++
```

构建后在模板里打印 `{{ range .Resources }}{{ .Name }}|{{ .ResourceType }}|{{ .Title }}|{{ printf "%v" .Params }}{{ end }}`，输出是：

```text
mydata|application|My Data|map[kind:config]
```

三件事同时被验证了：`name` 改了 `.Name`，`title` 改了 `.Title`，`params` 变成了 `.Params` 映射。改名之后**原来的文件名不再能取到它**——`.Resources.Get "data.json"` 会落空，要改用 `.Resources.Get "mydata"` 或 `.Resources.ByType "application"`。

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

注意 `Name` 的编号顺序是**文件名排序**（`checklist` → `guide` → `other_specs` → `photo_specs`），不是你在数组里写规则的顺序；两张表格里 `Specification #1/#2` 只落在两个 `*specs.pdf` 上，因为另一条规则只改了 `name`。

## 多语言下的共享资源

在多语言单主机项目中，Hugo 默认不会在构建时重复复制共享的页面资源。

> [!NOTE]
> 这一行为只适用于 Markdown 内容。其他[内容格式](/content-management/formats/)的共享页面资源会被复制到每种语言的包中。

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

这种做法可以减少构建时间、存储占用、带宽消耗与部署时间，从而降低成本。

> [!IMPORTANT]
> 此时要让 Markdown 中的链接与图片目标解析到正确位置，必须使用链接渲染钩子与图片渲染钩子：用 `.Resources.Get` 取得页面资源，再调用它的 `.RelPermalink`。
>
> 默认配置下，只要共享页面资源的复制功能处于关闭状态，Hugo 就会为多语言单主机项目自动使用内置的[链接渲染钩子](/render-hooks/links/)与[图片渲染钩子](/render-hooks/images/)；如果项目、模块或主题定义了自定义的链接或图片渲染钩子，则改用自定义的。
>
> 也可以把该选项配置为 `always`（始终使用内置钩子）、`fallback`（仅作为回退）或 `never`（从不使用）。四个取值的完整语义见[配置 Markup](/configuration/markup/)。

尽管重复复制共享页面资源效率不高，仍可以在项目配置中启用它：

```toml
[markup.goldmark]
duplicateResourceFiles = true
```

## 什么时候用页面资源、什么时候别用

**该用**：内容专属的图片、文档、数据文件——它们只服务于这一页，放进页面包最省事，`.Resources` 立刻可用，删除页面时资源跟着走，不会在 `static/` 里留下孤儿文件。

**别用**：

- **全站共用的资源**（站点 logo、通用样式图、多处引用的图标）——它们不属于任何页面。放进 `assets/`（需要 Hugo 处理/指纹化）或 `static/`（原样拷贝），用全局资源函数取，不要在每个页面包里重复一份。
- **想被别的页面引用的文件**——页面资源只对与它打包在一起的那个页面可用（叶子包里连 `.md` 文件都只能当资源用）。要跨页面共享，用 `assets/`，或用 `headless` 包配合 `.Resources` 显式引用。
- **需要处理后再输出的图片**——页面资源本身只负责「找到文件」；缩放、裁剪、转格式是[图像处理](/content-management/image-processing/)的事。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `{{ range .Resources }}` 什么都不输出 | 当前页面不是页面包；资源放在了 `static/` 或 `assets/`；或资源在**另一个**页面包里 | 确认页面对应 `index.md`（叶子包）或与 `_index.md` 同级（分支包）；跨页面取资源要改用它自己的 `.Resources` |
| 没报错但结果不对 | 改了 `name` 之后 `.Resources.Get "原文件名"` 取不到了 | `name` 一旦设置，`Get`/`Match`/`GetMatch` 就要用新名字 | 改用新 `name`，或改用 `.Resources.ByType "image"` 这类不依赖名字的筛选 |
| 没报错但结果不对 | 多条 `[[resources]]` 规则的 `title` 不生效 | 对 `name`/`title` **只有第一条匹配的规则生效**；宽泛通配写在了具体模式前面 | 把更具体的 `src` 移到前面；`params` 则相反，所有匹配条目都会合并 |
| 没报错但结果不对 | 资源在本地看得到，部署后 404 | 资源没有被复制到产物（`publishResources = false`，或页面本身是 headless 之外的不发布页面） | 用 `hugo` 后检查 `public/<包路径>/` 下有没有该文件；规则见[构建选项](/content-management/build-options/) |
| 报错看不懂 | 构建直接失败，报 `Unable to get page resource …` | 模板里用了 `errorf` 显式报错——这正是它设计的目的 | 要么补上缺失的资源，要么把 `errorf` 换成 `with` 的「没有就跳过」写法 |
| 报错看不懂 | `nil pointer evaluating` 且位置在 `.Resources.Get …` 之后 | 直接对取不到的资源继续链式取值（`.Width`、`.RelPermalink`） | 用 `with` 包一层，取不到就整块跳过 |

更多排查入口见[故障排查](/troubleshooting/)。
