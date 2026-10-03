+++
title = "File"
linkTitle = "File"
description = "返回给定页面的文件信息；若该页面没有对应文件，则返回 nil。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/methods/page/file/"

[params.functions_and_methods]
signatures = ["PAGE.File"]
returnType = "hugolib.fileInfo"
+++

## 这一页解决什么问题

`File` 返回页面背后的**文件信息对象**（路径、文件名、扩展名、所在 section 等）。给页面找同目录资源、按文件组织内容、在文件名里编码信息，都从这里入手；同时它也是最容易踩 nil 的方法之一——不是每个页面都有文件。

## 什么时候用，什么时候别用

**该用**：

- 需要文件路径或文件名（例如把 `content/news/2024/a.md` 的目录结构映射成 URL 或分类）；
- 判断包的类型：`.File.ContentBaseName`（包目录名）、`.File.IsContentAdapter`；
- 配合 `.Resources` 处理叶子包里的资源。

**别用**：

- 想拿**页面 URL** → 用 `.RelPermalink` / `.Permalink`。`.File.Path` 是内容目录内的相对路径，且 Windows 上是**反斜杠**；
- 想判断页面种类 → 用 [`Kind`](/methods/page/kind/) / [`IsPage`](/methods/page/ispage/)；
- 不加判断地访问 `.File.xxx`：顶层 section 页（无 `_index.md` 时）、分类法页、术语页都没有文件。

## 用法

默认情况下，并非所有页面都有对应的文件，包括顶层 [section 页](g)、[分类法页](g)与[术语页](g)。顾名思义，文件不存在时你无法取得文件信息。

要让上述某类页面拥有对应文件，请在相应目录中创建 `_index.md` 文件。例如：

```tree
content/
└── books/
    ├── _index.md  <-- the top-slevel section page
    ├── book-1.md
    └── book-2.md
```

> [!NOTE]
> 请按下文示例所示校验文件是否存在，以做防御式编码。

## 方法

在 `File` 对象上使用这些方法。

> [!NOTE]
> `Path`、`Dir` 与 `Filename` 中的路径分隔符（斜杠或反斜杠）取决于操作系统。

`BaseFileName`
: （`string`）文件名，不含扩展名。

  ```go-html-template
  {{ with .File }}
    {{ .BaseFileName }}
  {{ end }}
  ```

`ContentBaseName`
: （`string`）如果该页面是分支包或叶子包，则返回所在目录的名称，否则返回 `TranslationBaseName`。

  ```go-html-template
  {{ with .File }}
    {{ .ContentBaseName }}
  {{ end }}
  ```

`Dir`
: （`string`）文件路径中去掉文件名后的部分，相对于 `content` 目录。

  ```go-html-template
  {{ with .File }}
    {{ .Dir }}
  {{ end }}
  ```

`Ext`
: （`string`）文件扩展名。

  ```go-html-template
  {{ with .File }}
    {{ .Ext }}
  {{ end }}
  ```

`Filename`
: （`string`）文件的绝对路径。

  ```go-html-template
  {{ with .File }}
    {{ .Filename }}
  {{ end }}
  ```

`IsContentAdapter`
: （`bool`）报告该文件是否为[内容适配器][]。

  ```go-html-template
  {{ with .File }}
    {{ .IsContentAdapter }}
  {{ end }}
  ```

`LogicalName`
: （`string`）文件名。

  ```go-html-template
  {{ with .File }}
    {{ .LogicalName }}
  {{ end }}
  ```

`Path`
: （`string`）文件路径，相对于 `content` 目录。

  ```go-html-template
  {{ with .File }}
    {{ .Path }}
  {{ end }}
  ```

`Section`
: （`string`）该文件所在顶层 section 的名称。

  ```go-html-template
  {{ with .File }}
    {{ .Section }}
  {{ end }}
  ```

`TranslationBaseName`
: （`string`）文件名，不含扩展名与语言标识符。

  ```go-html-template
  {{ with .File }}
    {{ .TranslationBaseName }}
  {{ end }}
  ```

`UniqueID`
: （`string`）`.File.Path` 的 MD5 哈希值。

  ```go-html-template
  {{ with .File }}
    {{ .UniqueID }}
  {{ end }}
  ```

## 示例

假设多语言项目的内容结构如下：

```tree
content/
├── news/
│   ├── b/
│   │   ├── index.de.md   <-- leaf bundle
│   │   └── index.en.md   <-- leaf bundle
│   ├── a.de.md           <-- regular content
│   ├── a.en.md           <-- regular content
│   ├── _index.de.md      <-- branch bundle
│   └── _index.en.md      <-- branch bundle
├── _index.de.md
└── _index.en.md
```

在英文站点中：

&nbsp;|普通内容|叶子包|分支包
:--|:--|:--|:--
BaseFileName|a.en|index.en|_index.en
ContentBaseName|a|b|news
Dir|news/|news/b/|news/
Ext|md|md|md
Filename|/home/user/...|/home/user/...|/home/user/...
IsContentAdapter|false|false|false
LogicalName|a.en.md|index.en.md|_index.en.md
Path|news/a.en.md|news/b/index.en.md|news/_index.en.md
Section|news|news|news
TranslationBaseName|a|index|_index
UniqueID|15be14b...|186868f...|7d9159d...

## 防御式编码

站点上有些页面可能没有对应文件，例如：

- 顶层 section 页
- 分类法页
- 术语页

没有对应文件时，一旦访问 `.File` 属性，Hugo 就会抛出错误。为此要编写防御式代码，先检查文件是否存在：

```go-html-template
{{ with .File }}
  {{ .ContentBaseName }}
{{ end }}
```

## 完整示例：同一个模板打印三种页面的文件信息

最小站点：`content/docs/guide/alpha.md`（普通页面）、`content/docs/guide/bundle/index.md`（叶子包）、`/tags/hugo/`（术语页，没有对应文件）。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with .File }}
  <p>{{ .Path }}|{{ .BaseFileName }}|{{ .ContentBaseName }}|{{ .Dir }}|{{ .Ext }}|{{ .LogicalName }}|{{ .Section }}</p>
{{ else }}
  <p>该页面没有对应文件</p>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后（Windows）：

```html
<p>docs\guide\alpha.md|alpha|alpha|docs\guide\|md|alpha.md|docs</p>
<p>docs\guide\bundle\index.md|index|bundle|docs\guide\bundle\|md|index.md|docs</p>
```

术语页 `/tags/hugo/` 用同一个模板渲染，输出：

```html
<p>该页面没有对应文件</p>
```

**你应当看到什么**：普通页面的 `BaseFileName` 与 `ContentBaseName` 同为 `alpha`；叶子包不同——`BaseFileName` 是 `index`，`ContentBaseName` 是目录名 `bundle`。路径分隔符在 Windows 上是 `\`（上游已说明），**不要把它当 URL 用**。术语页的 `.File` 为 `nil`，`with` 直接走兜底分支。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；结构见上，另有 en/zh 双语页面。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 普通页面、有 `_index.md` 的 section 页 | 返回文件信息对象 | 否 |
| 分类法页、术语页（实测）、无 `_index.md` 的顶层 section 页（上游说明） | **`nil`**；不加判断就访问字段会报错 | 否（访问字段时才报错） |
| 叶子包的 `.ContentBaseName` | 包目录名（`bundle`） | 否 |
| 译文页面（`alpha.zh.md`） | `.BaseFileName` = `alpha.zh`、`.LogicalName` = `alpha.zh.md`、`.TranslationBaseName` = `alpha` | 否 |
| `.Path` / `.Dir` / `.Filename` 的分隔符 | Windows 为 `\`，其他系统为 `/` | 否 |
| `.UniqueID` | `.File.Path` 的 MD5 哈希 | 否 |
| 返回类型 | `hugolib.fileInfo`（可能为 `nil`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建报错 | 分类法页 / 术语页上访问 `.File.Path` 报错 | 这些页面没有对应文件，`.File` 为 `nil` | 一律用 `{{ with .File }}` 包起来（见上游「防御式编码」） |
| 没报错但结果不对 | 用 `.File.Path` 拼 URL，结果带反斜杠 | 它是操作系统路径，不是 URL | URL 用 `.RelPermalink` |
| 没报错但结果不对 | 叶子包与普通页面的 `BaseFileName` 混用 | 叶子包文件名固定是 `index`，页面名在 `ContentBaseName` | 需要「页面名」时用 `.ContentBaseName` |
| 没报错但结果不对 | 多语言项目的文件名与预期不符 | 语言后缀参与 `BaseFileName` / `LogicalName` | 需要不含语言后缀的名字时用 `TranslationBaseName` |

更多排查入口见[故障排查](/troubleshooting/)。

[内容适配器]: /content-management/content-adapters/
