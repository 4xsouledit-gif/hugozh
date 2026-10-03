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

## 这一页解决什么问题

`Taxonomies` 返回**整站分类法数据**：分类法（taxonomy）→ 术语（term）→ 归属该术语的页面，三层一次到位。它不需要页面上下文，因此在首页、页脚、任意 partial 里都能用。

典型用途：标签云（按术语与计数）、侧栏「精选内容」、某个术语下的文章列表。

**读懂本页的诀窍**：`.Site.Taxonomies.tags` 得到的**不是切片而是映射**（术语名 → 该术语的加权页面），所以 `range` 它要接两个变量：`{{ range $term, $weightedPages := .Site.Taxonomies.tags }}`。想按字母序或计数排序，请转用术语页模板里的 [`TAXONOMY.Alphabetical`](/methods/taxonomy/alphabetical/) / [`TAXONOMY.ByCount`](/methods/taxonomy/bycount/)。

## 什么时候用，什么时候别用

**该用**：

- 首页/侧栏的标签云、术语计数、跨分类法遍历；
- 需要「某个术语下有哪些页面」时（`.Site.Taxonomies.genres.suspense` 即该术语的加权页面）。

**别用**：

- 正在渲染**分类法页面**（`/genres/`）→ 那里已有 `.Data.Terms`，还多了排序方法，见 [methods/taxonomy](/methods/taxonomy/)；
- 想按条件筛页面 → 用 [`where`](/functions/collections/where/) 配合 [`Site.RegularPages`](/methods/site/regularpages/)；
- 想取某个页面所属的术语 → 用页面自己的 `.Params` 或 `.GetTerms`（见 [methods/page](/methods/page/)）；
- 直接把 `.Site.Taxonomies.xxx` 交给 `len` 而不判断是否存在 → 未配置的分类法会报错（见下文「返回值边界」）。

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

## 完整示例（实测）

配置 `genre = 'genres'`、`author = 'authors'`、`tag = 'tags'`（其中 `tags` 没有任何内容使用，用来演示空分类法）。4 本书的术语分配与上游示例相同：suspense 3 本、romance 2 本。home 模板：

```go-html-template {file="layouts/index.html"}
<p>分类法：{{ range $name, $terms := .Site.Taxonomies }}{{ $name }}|{{ end }}</p>
<p>genres 术语：{{ range $term, $wp := .Site.Taxonomies.genres }}{{ $term }}={{ len $wp }}|{{ end }}</p>
<ul>
  {{ range .Site.Taxonomies.genres.suspense }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
<p>genres 分类法页面：{{ with .Site.Taxonomies.genres.Page }}{{ .RelPermalink }}{{ end }}</p>
```

Hugo 渲染为（`range` 的空白已省略）：

```html
<p>分类法：authors|genres|tags|</p>
<p>genres 术语：romance=2|suspense=3|</p>
<ul>
  <li><a href="/books/jamaica-inn/">Jamaica Inn</a></li>
  <li><a href="/books/death-on-the-nile/">Death on the Nile</a></li>
  <li><a href="/books/and-then-there-were-none/">And Then There Were None</a></li>
</ul>
<p>genres 分类法页面：/genres/</p>
```

**你应当看到什么**：第一行的键名即 `[taxonomies]` 里的**复数名**（`genres`、`authors`、`tags`）；`range` 术语时拿到的是「术语名 → 加权页面」，所以要用 `$term, $wp` 两个变量，`len $wp` 就是计数；`.Page` 是该分类法自己的页面（`/genres/`）。术语顺序是字母序（romance 在 suspense 前），而术语内页面按**分类法权重**排序——本实测里恰好是文件日期的倒序。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，配置如上（`tags` 下无术语），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `.Site.Taxonomies` | `page.TaxonomyList`：分类法名 → 术语映射 | 否 |
| 已配置且有术语的分类法（`genres`） | 映射可 `range`；`len` → 2 | 否 |
| 已配置但**没有术语**的分类法（`tags`） | 空映射：`with` 判为假，`len` → 0 | 否 |
| **未配置**的分类法（如 `categories`） | `nil`（零值接口）：`with` 判为假；对它调用 `len` 会**构建失败** | 是：`error calling len: reflect: call of reflect.Value.Type on zero Value` |
| 取不存在的术语（`.genres.nope`） | `nil`（`with` 判为假），`range` 不输出 | 否 |
| 术语页模板中的对应写法 | 用 `.Data.Terms`（类型 `page.Taxonomy`），方法见 [methods/taxonomy](/methods/taxonomy/) | 否 |

最后两行合起来就是最常见的坑：**「分类法存在但没有术语」与「分类法根本没配置」在 `with` 里表现一致，但对 `len` 的反应不同**。稳妥写法是先 `with` 包一层，再在内部使用 `len`。

[分类法]: /content-management/taxonomies/
