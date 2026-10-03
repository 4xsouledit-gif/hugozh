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

## 这一页解决什么问题

站点里总有一些**与具体页面无关**的结构化数据：导航项、团队成员、价格表、赞助商列表。把它们写成 Markdown 会让模板难以复用，写死在模板里又不好维护。`data` 目录就是为这类数据准备的：把 YAML/JSON/TOML/XML 放进去，`hugo.Data` 返回一棵「目录结构即键名」的数据树，任何模板都能读。

它替代的是旧写法 `site.Data`，在 0.156.0 起引入了 `hugo.Data`（两者读的是同一份数据；新名字与 `hugo` 命名空间的其它函数放在一起）。

## 什么时候用，什么时候别用

**该用**：

- 数据是**站点级、跨页面公用**的（导航、成员、价格）；
- 数据文件需要按目录分组、按文件名取用。

**别用**：

- 数据只属于某一篇内容 → 写进该页面的前置元数据（front matter），用页面上下文的 `.Params` 读取；
- 数据是 CSV → **不要**放进 `data/`：上游说明 `hugo.Data` 不读 CSV，用 [`transform.Unmarshal`](/functions/transform/unmarshal/) 处理；实测把 CSV 放进 `data/` 会让**整个构建失败**（见文末边界表）；
- 数据在 `assets/` 里、或需要从远程抓取 → 用 `resources.Get`、`resources.GetRemote`。

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

## 完整示例：用两个 YAML 文件渲染图书清单

`data` 目录与数据文件（同上游示例，另加一个 `films.json` 用来演示其它格式）：

```tree
data/
├── books/
│   ├── fiction.yaml
│   └── nonfiction.yaml
├── films.json
├── paintings.xml
└── sculptures.toml
```

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

模板（`layouts/index.html`）：

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

在本机（Hugo 0.167.0 extended，Windows，`hugo --source <临时目录> --ignoreCache`）实测产物（`range` 循环留下的空行已省略）：

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

**你应当看到什么**：`hugo.Data.books` 的键就是去掉扩展名的文件名（`fiction`、`nonfiction`），遍历映射时按键名**字典序**输出（`fiction` 在 `nonfiction` 前）——不要依赖文件在磁盘上的顺序。

排序与筛选同样可用，实测：

```go-html-template
{{ range sort hugo.Data.books.fiction "title" }}
  <li>{{ .title }} ({{ .author }})</li>
{{ end }}
```

```html
  <li>Les Misérables (Victor Hugo)</li>
  <li>The Hunchback of Notre Dame (Victor Hugo)</li>
```

```go-html-template
{{ range where hugo.Data.books.fiction "isbn" "978-0140443530" }}
  <li>{{ .title }} ({{ .author }})</li>
{{ end }}
```

```html
  <li>The Hunchback of Notre Dame (Victor Hugo)</li>
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点，`hugo --source <临时目录> --ignoreCache`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ hugo.Data }}` | `map[string]interface {}`（实测 `printf "%T"`） | 否 |
| 取子目录切片 `hugo.Data.books.fiction` | `[]interface {}` | 否 |
| 访问不存在的键 | 空输出，在 `if` 中为假；`printf "%T"` 得到 `<nil>` | 否 |
| 对不存在的键 `range` / `index` | 空结果 | 否 |
| 键含连字符 | 需 `index hugo.Data.books "historical-fiction"`（实测返回该文件的切片） | 否 |
| 把切片当映射取字段（`hugo.Data.books.fiction.title`） | —— | 是：`can't evaluate field title in type interface {}` |
| `data/` 里放了 CSV（`numbers.csv`） | 整个构建失败 | 是：`unexpected data type [][]string in file numbers.csv` |
| 传入参数 `{{ hugo.Data "x" }}` | —— | 是：`wrong number of args for Data: want 0 got 1` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `unexpected data type [][]string in file numbers.csv`，且报错不指向具体页面 | `data/` 里放了 CSV；上游明确说不要这么做 | 把 CSV 移出 `data/`，用 [`transform.Unmarshal`](/functions/transform/unmarshal/) 读取 |
| 报错看不懂 | `can't evaluate field title in type interface {}` | 把切片当成了映射：`hugo.Data.books.fiction` 是数组，不能直接取 `.title` | 先 `range`（或 `index`）取到单个元素，再访问 `.title` |
| 没报错但结果不对 | `hugo.Data.my-key` 输出为空 | 键名含连字符，不是合法标识符 | 用 `index hugo.Data "my-key"` 或 `index hugo.Data.books "historical-fiction"` |
| 没报错但结果不对 | 改了数据文件但页面没变 | 只改了文件没重新构建，或 `hugo server` 尚未重新加载 | 重新运行构建；server 下等一次重建 |
| 没报错但结果不对 | 遍历顺序与预期不符 | 映射遍历按键名字典序，不是文件顺序 | 需要固定顺序时用 `sort` 并指定键 |

[`index`]: /functions/collections/indexfunction/
[`transform.Unmarshal`]: /functions/transform/unmarshal/
[mounted]: /configuration/module/#mounts
