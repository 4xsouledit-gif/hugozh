+++
title = "OutputFormats"
linkTitle = "OutputFormats"
description = "返回一组 OutputFormat 对象，每个对象对应该页面已启用的一种输出格式。"
date = 2026-10-02
weight = 460
source = "https://gohugo.io/methods/page/outputformats/"

[params.functions_and_methods]
signatures = ["PAGE.OutputFormats"]
returnType = "[]OutputFormat"
+++

[输出格式（output format）](/quick-reference/glossary/output-format/)

`Page` 对象上的 `OutputFormats` 方法返回一组 `OutputFormat` 对象，每个对象对应该页面已启用的一种输出格式。详见[说明][]。

## 方法

在 `OutputFormats` 对象上使用这些方法。

`Canonical`
: **（0.154.4 新增）**
: （`page.OutputFormat`）返回当前页面的[规范输出格式](g)（如果已定义）。获取该对象后，可以使用它的任意[关联方法][]。

  ```go-html-template
  {{ with .Site.Home.OutputFormats.Canonical }}
    {{ .MediaType.Type }} → text/html
    {{ .MediaType.MainType }} → text
    {{ .MediaType.SubType }} → html
    {{ .Name }} → html
    {{ .Permalink }} → https://example.org/
    {{ .Rel }} → canonical
    {{ .RelPermalink }} → /
  {{ end }}
  ```

`Get`
: （`page.OutputFormat`）返回具有给定标识符的 `OutputFormat` 对象。获取该对象后，可以使用它的任意[关联方法][]。

  ```go-html-template
  {{ with .Site.Home.OutputFormats.Get "rss" }}
    {{ .MediaType.Type }} → application/rss+xml
    {{ .MediaType.MainType }} → application
    {{ .MediaType.SubType }} → rss
    {{ .Name }} → rss
    {{ .Permalink }} → https://example.org/index.xml
    {{ .Rel }} → alternate
    {{ .RelPermalink }} → /index.xml
  {{ end }}
  ```

## 示例

要渲染指向当前页面[规范输出格式](g)的 `link` 元素：

```go-html-template
{{ with .OutputFormats.Canonical }}
  {{ printf "<link rel=%q type=%q href=%q>" .Rel .MediaType.Type .Permalink | safeHTML }}
{{ end }}
```

要渲染指向当前页面 `rss` 输出格式的锚点元素：

```go-html-template
{{ with .OutputFormats.Get "rss" }}
  <a href="{{ .RelPermalink }}">RSS Feed</a>
{{ end }}
```

请参阅[链接到输出格式][]一节，以理解上述写法的意义。

[associated methods]: /methods/output-format/
[details]: /configuration/output-formats/
[link to output formats]: /configuration/output-formats/#link-to-output-formats
