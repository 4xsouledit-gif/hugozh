+++
title = "Related"
linkTitle = "Related"
description = "返回与给定页面相关的一组页面。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/methods/pages/related/"

[params.functions_and_methods]
signatures = ["PAGES.Related PAGE", "PAGES.Related OPTIONS"]
returnType = "page.Pages"
+++

Hugo 依据前置元数据，用多个因素找出与给定页面相关的内容。可以使用默认的[相关内容配置][]，也可以按所需的索引与参数调整结果。详见[说明][]。

## 用法

传给 `Related` 方法的参数可以是 `Page`，也可以是选项映射。例如传入当前页面：

```go-html-template {file="layouts/page.html"}
{{ with .Site.RegularPages.Related . | first 5 }}
  <p>Related pages:</p>
  <ul>
    {{ range . }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

传入选项映射：

```go-html-template {file="layouts/page.html"}
{{ $opts := dict
  "document" .
  "indices" (slice "tags" "keywords")
}}
{{ with .Site.RegularPages.Related $opts | first 5 }}
  <p>Related pages:</p>
  <ul>
    {{ range . }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 选项

`indices`
: （`slice`）要在其中搜索的索引。

`document`
: （`page`）要为其查找相关内容的页面。指定选项映射时必填。

`namedSlices`
: （`slice`）要搜索的关键词，用 [`keyVals`][] 函数表示为 `KeyValues` 的切片。

`fragments`
: （`slice`）用于类型为 "fragments" 的索引的一组特殊关键词。它会匹配文档的 [fragment](g)（片段）标识符。

下面这个刻意构造的例子用到了上述所有选项：

```go-html-template
{{ $page := . }}
{{ $opts := dict
  "indices" (slice "tags" "keywords")
  "document" $page
  "namedSlices" (slice (keyVals "tags" "hugo" "rocks") (keyVals "date" $page.Date))
  "fragments" (slice "heading-1" "heading-2")
}}
```

[`keyVals`]: /functions/collections/keyvals/
[说明]: /content-management/related-content/
[相关内容配置]: /configuration/related-content/
