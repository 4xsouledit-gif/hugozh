+++
title = "hugo.Data"
linkTitle = "hugo.Data"
description = "返回由 data 目录中的文件构成的数据结构。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/hugo/data/"

[params.functions_and_methods]
signatures = ["hugo.Data"]
returnType = "map"
+++

**（0.156.0 新增）**

## 用法

用 `hugo.Data` 函数访问 `data` 目录中的数据，也可以访问[挂载][]到 `data` 目录的任何目录中的数据。支持的数据格式包括 JSON、TOML、YAML 与 XML。

> [!NOTE]
> 虽然 Hugo 可以用 [`transform.Unmarshal`][] 函数反序列化 CSV 文件，但不要把 CSV 文件放进 `data` 目录：用这种方式无法访问 CSV 文件中的数据。

假设有这样一个 `data` 目录：

```tree
data/
├── books/
│   ├── fiction.yaml
│   └── nonfiction.yaml
├── films.json
├── paintings.xml
└── sculptures.toml
```

以及这些数据文件：

```yaml {file="data/books/fiction.yaml"}
- title: The Hunchback of Notre Dame
  author: Victor Hugo
  isbn: 978-0140443530
- title: Les Misérables
  author: Victor Hugo
  isbn: 978-0451419439
```

```yaml {file="data/books/nonfiction.yaml"}
- title: The Ancien Régime and the Revolution
  author: Alexis de Tocqueville
  isbn: 978-0141441641
- title: Interpreting the French Revolution
  author: François Furet
  isbn: 978-0521280495
```

通过**链式**书写**标识符**即可访问数据：

```go-html-template
{{ range $category, $books := hugo.Data.books }}
  <p>{{ $category | title }}</p>
  <ul>
    {{ range $books }}
      <li>{{ .title }} ({{ .isbn }})</li>
    {{ end }}
  </ul>
{{ end }}
```

Hugo 把它渲染为：

```html
<p>Fiction</p>
<ul>
  <li>The Hunchback of Notre Dame (978-0140443530)</li>
  <li>Les Misérables (978-0451419439)</li>
</ul>
<p>Nonfiction</p>
<ul>
  <li>The Ancien Régime and the Revolution (978-0141441641)</li>
  <li>Interpreting the French Revolution (978-0521280495)</li>
</ul>
```

只列出虚构类，并按标题排序：

```go-html-template
<ul>
  {{ range sort hugo.Data.books.fiction "title" }}
    <li>{{ .title }} ({{ .author }})</li>
  {{ end }}
</ul>
```

按 ISBN 查找一本虚构类图书：

```go-html-template
{{ range where hugo.Data.books.fiction "isbn" "978-0140443530" }}
  <li>{{ .title }} ({{ .author }})</li>
{{ end }}
```

在上面的模板示例中，每个键都是合法的标识符，例如没有任何键包含连字符。要访问不是合法标识符的键，请使用 [`index`][] 函数。例如：

```go-html-template
{{ index hugo.Data.books "historical-fiction" }}
```

[`index`]: /functions/collections/indexfunction/
[`transform.Unmarshal`]: /functions/transform/unmarshal/
[mounted]: /configuration/module/#mounts
