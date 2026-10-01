+++
title = "transform.Unmarshal"
linkTitle = "Unmarshal"
description = "返回从 CSV、JSON、TOML、YAML 或 XML 格式的序列化数据解析出的映射或数组。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/transform/unmarshal/"

[params.functions_and_methods]
signatures = ["transform.Unmarshal [OPTIONS] INPUT"]
returnType = "any"
aliases = ["unmarshal"]
+++

输入可以是字符串或资源。

## 选项

`transform.Unmarshal` 函数接受一个选项映射。

`delimiter`
: （`string`）适用于 CSV 文件。使用的分隔符。默认 `,`。

`comment`
: （`string`）适用于 CSV 文件。CSV 中使用的注释字符。设置之后，以该注释字符开头且前面没有空白的行会被忽略。

`format`
: （0.149.0 新增）
: （`string`）输入的序列化格式，取 `csv`、`json`、`org`、`toml`、`xml` 或 `yaml` 之一。留空或不指定时，Hugo 从输入推断格式。对于资源，只有文件缺少扩展名，或需要覆盖推断出的格式时，才需要该选项。对于字符串，只有当格式存在歧义时才需要。

`lazyQuotes`
: （`bool`）适用于 CSV 文件。是否允许在未加引号的字段中出现引号，或允许在加引号的字段中出现未成对的引号。默认 `false`。

`targetType`
: （0.146.7 新增）
: （`string`）适用于 CSV 文件。目标数据类型，取 `slice` 或 `map`。默认 `slice`。

## 解析字符串

```go-html-template
{{ $string := `
title: Les Misérables
author: Victor Hugo
`}}

{{ $book := transform.Unmarshal $string }}
{{ $book.title }} → Les Misérables
{{ $book.author }} → Victor Hugo
```

## 解析资源

`transform.Unmarshal` 函数可用于全局资源、页面资源与远程资源。Hugo 会缓存结果，因此用同一个资源多次调用该函数不会带来额外开销。

### 全局资源

全局资源是位于 `assets` 目录内，或位于任何挂载到 `assets` 目录的目录内的文件。

```tree
assets/
└── data/
    └── books.json
```

```go-html-template
{{ $data := dict }}
{{ $path := "data/books.json" }}
{{ with resources.Get $path }}
  {{ with . | transform.Unmarshal }}
    {{ $data = . }}
  {{ end }}
{{ else }}
  {{ errorf "Unable to get global resource %q" $path }}
{{ end }}

{{ range where $data "author" "Victor Hugo" }}
  {{ .title }} → Les Misérables
{{ end }}
```

### 页面资源

页面资源是位于[页面包][]内的文件。

```tree
content/
├── post/
│   └── book-reviews/
│       ├── books.json
│       └── index.md
└── _index.md
```

```go-html-template
{{ $data := dict }}
{{ $path := "books.json" }}
{{ with .Resources.Get $path }}
  {{ with . | transform.Unmarshal }}
    {{ $data = . }}
  {{ end }}
{{ else }}
  {{ errorf "Unable to get page resource %q" $path }}
{{ end }}

{{ range where $data "author" "Victor Hugo" }}
  {{ .title }} → Les Misérables
{{ end }}
```

### 远程资源

远程资源是位于远程服务器上、可通过 HTTP 或 HTTPS 访问的文件。

```go-html-template
{{ $data := dict }}
{{ $url := "https://example.org/books.json" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else with .Value }}
    {{ $data = . | transform.Unmarshal }}
  {{ else }}
    {{ errorf "Unable to get remote resource %q" $url }}
  {{ end }}
{{ end }}

{{ range where $data "author" "Victor Hugo" }}
  {{ .title }} → Les Misérables
{{ end }}
```

> [!NOTE]
> 获取远程数据时，配置有误的服务器可能返回带有错误 [Content-Type][] 的响应头。例如，服务器可能把 Content-Type 头设为 `application/octet-stream`，而不是 `application/json`。
>
> 遇到这种情况，请把资源的 `Content` 而不是资源本身传给 `transform.Unmarshal` 函数。例如上面的写法应改为：
>
> `{{ $data = .Content | transform.Unmarshal }}`

## 处理 CSV

CSV 文件是表格形式的，因此与 JSON、TOML、XML、YAML 不同，`transform.Unmarshal` 总是返回一个集合，每行一个条目，而不是单个对象。默认情况下它是行的切片；把 `targetType` 设为 `map` 时，它是行映射的切片。

下面的示例使用这个 CSV 文件：

```csv
"name","type","breed","age"
"Spot","dog","Collie",3
"Rover","dog","Boxer",5
"Felix","cat","Calico",7
```

要用 CSV 文件渲染 HTML 表格：

```go-html-template
{{ $data := slice }}
{{ $file := "pets.csv" }}
{{ with or (.Resources.Get $file) (resources.Get $file) }}
  {{ $opts := dict "targetType" "slice" }}
  {{ $data = transform.Unmarshal $opts . }}
{{ end }}

{{ with $data }}
  <table>
    <thead>
      <tr>
        {{ range index . 0 }}
          <th>{{ . }}</th>
        {{ end }}
      </tr>
    </thead>
    <tbody>
      {{ range . | after 1 }}
        <tr>
          {{ range . }}
            <td>{{ . }}</td>
          {{ end }}
        </tr>
      {{ end }}
    </tbody>
  </table>
{{ end }}
```

要提取数据的子集，或对数据排序，请解析为映射而不是切片：

```go-html-template
{{ $data := dict }}
{{ $file := "pets.csv" }}
{{ with or (.Resources.Get $file) (resources.Get $file) }}
  {{ $opts := dict "targetType" "map" }}
  {{ $data = transform.Unmarshal $opts . }}
{{ end }}

{{ with sort (where $data "type" "dog") "name" "asc" }}
  <table>
    <thead>
      <tr>
        <th>name</th>
        <th>type</th>
        <th>breed</th>
        <th>age</th>
      </tr>
    </thead>
    <tbody>
      {{ range . }}
        <tr>
          <td>{{ .name }}</td>
          <td>{{ .type }}</td>
          <td>{{ .breed }}</td>
          <td>{{ .age }}</td>
        </tr>
      {{ end }}
    </tbody>
  </table>
{{ end }}
```

## 处理 XML

解析 XML 文件时，访问数据不要包含根节点。例如，解析下面的 RSS 源之后，用 `$data.channel.title` 访问源的标题。

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Books on Example Site</title>
    <link>https://example.org/books/</link>
    <description>Recent content in Books on Example Site</description>
    <language>en-US</language>
    <atom:link href="https://example.org/books/index.xml" rel="self" type="application/rss+xml" />
    <item>
      <title>The Hunchback of Notre Dame</title>
      <description>Written by Victor Hugo</description>
      <link>https://example.org/books/the-hunchback-of-notre-dame/</link>
      <pubDate>Mon, 09 Oct 2023 09:27:12 -0700</pubDate>
      <guid>https://example.org/books/the-hunchback-of-notre-dame/</guid>
    </item>
    <item>
      <title>Les Misérables</title>
      <description>Written by Victor Hugo</description>
      <link>https://example.org/books/les-miserables/</link>
      <pubDate>Mon, 09 Oct 2023 09:27:11 -0700</pubDate>
      <guid>https://example.org/books/les-miserables/</guid>
    </item>
  </channel>
</rss>
```

获取远程数据：

```go-html-template
{{ $data := dict }}
{{ $url := "https://example.org/books/index.xml" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else with .Value }}
    {{ $data = . | transform.Unmarshal }}
  {{ else }}
    {{ errorf "Unable to get remote resource %q" $url }}
  {{ end }}
{{ end }}
```

查看数据结构：

```go-html-template
<pre>{{ debug.Dump $data }}</pre>
```

列出书名：

```go-html-template
{{ with $data.channel.item }}
  <ul>
    {{ range . }}
      <li>{{ .title }}</li>
    {{ end }}
  </ul>
{{ end }}
```

Hugo 渲染出的结果是：

```html
<ul>
  <li>The Hunchback of Notre Dame</li>
  <li>Les Misérables</li>
</ul>
```

下面给 RSS 源的 `title` 节点加上 `lang` 属性，并添加一个带命名空间的 ISBN 节点：

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:isbn="http://schemas.isbn.org/ns/1999/basic.dtd"
>
  <channel>
    <title>Books on Example Site</title>
    <link>https://example.org/books/</link>
    <description>Recent content in Books on Example Site</description>
    <language>en-US</language>
    <atom:link href="https://example.org/books/index.xml" rel="self" type="application/rss+xml" />
    <item>
      <title lang="en">The Hunchback of Notre Dame</title>
      <description>Written by Victor Hugo</description>
      <isbn:number>9780140443530</isbn:number>
      <link>https://example.org/books/the-hunchback-of-notre-dame/</link>
      <pubDate>Mon, 09 Oct 2023 09:27:12 -0700</pubDate>
      <guid>https://example.org/books/the-hunchback-of-notre-dame/</guid>
    </item>
    <item>
      <title lang="fr">Les Misérables</title>
      <description>Written by Victor Hugo</description>
      <isbn:number>9780451419439</isbn:number>
      <link>https://example.org/books/les-miserables/</link>
      <pubDate>Mon, 09 Oct 2023 09:27:11 -0700</pubDate>
      <guid>https://example.org/books/les-miserables/</guid>
    </item>
  </channel>
</rss>
```

获取远程数据之后，查看数据结构：

```go-html-template
<pre>{{ debug.Dump $data }}</pre>
```

每个 item 节点看起来是这样的：

```json
{
  "description": "Written by Victor Hugo",
  "guid": "https://example.org/books/the-hunchback-of-notre-dame/",
  "link": "https://example.org/books/the-hunchback-of-notre-dame/",
  "number": "9780140443530",
  "pubDate": "Mon, 09 Oct 2023 09:27:12 -0700",
  "title": {
    "#text": "The Hunchback of Notre Dame",
    "-lang": "en"
  }
}
```

title 的键既不以字母也不以下划线开头——它们不是合法的标识符。请用 [`index`][] 函数访问这些值：

```go-html-template
{{ with $data.channel.item }}
  <ul>
    {{ range . }}
      {{ $title := index .title "#text" }}
      {{ $lang := index .title "-lang" }}
      {{ $ISBN := .number }}
      <li>{{ $title }} ({{ $lang }}) {{ $ISBN }}</li>
    {{ end }}
  </ul>
{{ end }}
```

Hugo 渲染出的结果是：

```html
<ul>
  <li>The Hunchback of Notre Dame (en) 9780140443530</li>
  <li>Les Misérables (fr) 9780451419439</li>
</ul>
```

[Content-Type]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
[`index`]: /functions/collections/indexfunction/
[页面包]: /content-management/page-bundles/
