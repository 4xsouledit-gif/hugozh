+++
title = "collections.After"
linkTitle = "after"
description = "返回给定切片中位于前 N 个元素之后的元素所组成的切片。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/collections/after/"

[params.functions_and_methods]
signatures = ["collections.After N SLICE"]
returnType = "[]any"
aliases = ["after"]
+++

## 基本用法

下面演示 `after` 与 [`slice`][] 函数配合使用：

```go-html-template
{{ $data := slice "one" "two" "three" "four" }}
<ul>
  {{ range after 2 $data }}
    <li>{{ . }}</li>
  {{ end }}
</ul>
```

上面的模板渲染为：

```html
<ul>
  <li>three</li>
  <li>four</li>
</ul>
```

## 与 first 配合使用

你可以把 `after` 与 [`first`][] 函数以及 Hugo [强大的排序方法][powerful sorting methods]组合使用。假设你在 `example.org/articles` 有一个 `section` 页面，共有 10 篇文章，但希望模板只显示两行：

1. 第一行标题为 “Featured”，只显示最近发布的那篇文章（即按内容文件前置元数据中的 `publishdate` 排序后的第一篇）。
1. 第二行标题为 “Recent Articles”，只显示第 2 至第 4 篇最近发布的文章。

```go-html-template {file="layouts/section/articles.html"}
{{ define "main" }}
  <section class="row featured-article">
    <h2>Featured Article</h2>
    {{ range first 1 .Pages.ByPublishDate.Reverse }}
    <header>
      <h3><a href="{{ .RelPermalink }}">{{ .Title }}</a></h3>
    </header>
    <p>{{ .Description }}</p>
  {{ end }}
  </section>
  <div class="row recent-articles">
    <h2>Recent Articles</h2>
    {{ range first 3 (after 1 .Pages.ByPublishDate.Reverse) }}
      <section class="recent-article">
        <header>
          <h3><a href="{{ .RelPermalink }}">{{ .Title }}</a></h3>
        </header>
        <p>{{ .Description }}</p>
      </section>
    {{ end }}
  </div>
{{ end }}
```

[`first`]: /functions/collections/first/
[`slice`]: /functions/collections/slice/
[powerful sorting methods]: /quick-reference/page-collections/#sort
