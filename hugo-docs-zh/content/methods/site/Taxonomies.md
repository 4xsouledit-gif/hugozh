+++
title = "Taxonomies"
linkTitle = "Taxonomies"
description = "返回一个数据结构，其中包含站点的 Taxonomy 对象、每个 Taxonomy 对象中的术语，以及术语所归属的页面。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/methods/site/taxonomies/"

[params.functions_and_methods]
signatures = ["SITE.Taxonomies"]
returnType = "page.TaxonomyList"
+++

## 用法

从概念上说，`Site` 对象上的 `Taxonomies` 方法返回的数据结构形如：

<!-- markdownlint-disable MD007 MD032 -->
```yaml
taxonomy a:
  - term 1:
    - page 1
    - page 2
  - term 2:
    - page 1
taxonomy b:
  - term 1:
    - page 2
  - term 2:
    - page 1
    - page 2
```
<!-- markdownlint-enable MD007 MD032 -->

例如，在一个书评站点上，你可能会创建两个分类法：一个用于体裁，另一个用于作者。

项目配置如下：

```toml
[taxonomies]
genre = 'genres'
author = 'authors'
```

内容结构如下：

```tree
content/
├── books/
│   ├── and-then-there-were-none.md --> genres: suspense
│   ├── death-on-the-nile.md        --> genres: suspense
│   └── jamaica-inn.md              --> genres: suspense, romance
│   └── pride-and-prejudice.md      --> genres: romance
└── _index.md
```

从概念上说，分类法数据结构形如：

<!-- markdownlint-disable MD007 MD032 -->
```yaml
genres:
  - suspense:
    - And Then There Were None
    - Death on the Nile
    - Jamaica Inn
  - romance:
    - Jamaica Inn
    - Pride and Prejudice
authors:
  - achristie:
    - And Then There Were None
    - Death on the Nile
  - ddmaurier:
    - Jamaica Inn
  - jausten:
    - Pride and Prejudice
```
<!-- markdownlint-enable MD007 MD032 -->

要列出「suspense」类图书：

```go-html-template
<ul>
  {{ range .Site.Taxonomies.genres.suspense }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染结果为：

```html
<ul>
  <li><a href="/books/and-then-there-were-none/">And Then There Were None</a></li>
  <li><a href="/books/death-on-the-nile/">Death on the Nile</a></li>
  <li><a href="/books/jamaica-inn/">Jamaica Inn</a></li>
</ul>
```

> [!NOTE]
> Hugo 的分类法系统很强大，可以对内容进行分类，并在页面之间建立关系。
>
> 完整说明和示例请参见[分类法][]一节。

## 示例

下面的示例演示了站点分类法的一些常见用法。

### 按分类法术语获取内容

如果你把分类法用于诸如系列文章之类的场景，可以列出与同一术语关联的各个页面。例如：

```go-html-template
<ul>
  {{ range .Site.Taxonomies.series.golang }}
    <li><a href="{{ .Page.RelPermalink }}">{{ .Page.Title }}</a></li>
  {{ end }}
</ul>
```

### 分类法中的全部内容

这在侧栏中作为「精选内容」很有用。你甚至可以给内容指定不同的术语，从而做出不同板块的「精选内容」。

```go-html-template
<section id="menu">
  <ul>
    {{ range $term, $taxonomy := .Site.Taxonomies.featured }}
      <li>{{ $term }}</li>
      <ul>
        {{ range $taxonomy.Pages }}
          <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
        {{ end }}
      </ul>
    {{ end }}
  </ul>
</section>
```

### 渲染站点的分类法

下面的示例显示站点 tags 分类法中的所有术语：

```go-html-template
<ul>
  {{ range .Site.Taxonomies.tags }}
    <li><a href="{{ .Page.Permalink }}">{{ .Page.Title }}</a> {{ .Count }}</li>
  {{ end }}
</ul>
```

这个示例会列出所有分类法及其术语，以及归属于每个术语的所有内容。

```go-html-template {file="layouts/_partials/all-taxonomies.html"}
{{ with .Site.Taxonomies }}
  {{ $numberOfTerms := 0 }}
  {{ range $taxonomy, $terms := . }}
    {{ $numberOfTerms = len . | add $numberOfTerms }}
  {{ end }}

  {{ if gt $numberOfTerms 0 }}
    <ul>
      {{ range $taxonomy, $terms := . }}
        {{ with $terms }}
          <li>
            <a href="{{ .Page.RelPermalink }}">{{ .Page.LinkTitle }}</a>
            <ul>
              {{ range $term, $weightedPages := . }}
                <li>
                  <a href="{{ .Page.RelPermalink }}">{{ .Page.LinkTitle }}</a>
                  <ul>
                    {{ range $weightedPages }}
                      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
                    {{ end }}
                  </ul>
                </li>
              {{ end }}
            </ul>
          </li>
        {{ end }}
      {{ end }}
    </ul>
  {{ end }}
{{ end }}
```

[分类法]: /content-management/taxonomies/
