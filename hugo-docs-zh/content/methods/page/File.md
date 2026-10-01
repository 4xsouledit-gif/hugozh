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

[内容适配器]: /content-management/content-adapters/
