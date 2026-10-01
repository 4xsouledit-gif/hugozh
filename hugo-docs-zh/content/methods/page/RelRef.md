+++
title = "RelRef"
linkTitle = "RelRef"
description = "返回具有给定路径、语言和输出格式的页面的相对 URL。"
date = 2026-10-02
weight = 670
source = "https://gohugo.io/methods/page/relref/"

[params.functions_and_methods]
signatures = ["PAGE.RelRef OPTIONS"]
returnType = "string"
+++

## 用法

`RelRef` 方法只接受一个参数：一个选项映射。

## 选项

`path`
: （`string`）目标页面的路径。不带前导斜杠（`/`）的路径会先相对于当前页面解析，再相对于站点的其余部分解析。

`lang`
: （`string`）目标页面的语言。默认为当前语言。可选。

`outputFormat`
: （`string`）目标页面的输出格式。默认为当前输出格式。可选。

## 示例

以下示例展示的是英文版站点上某个页面的渲染输出：

```go-html-template
{{ $opts := dict "path" "/books/book-1" }}
{{ .RelRef $opts }} → /en/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" }}
{{ .RelRef $opts }} → /de/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" "outputFormat" "json" }}
{{ .RelRef $opts }} → /de/books/book-1/index.json
```

## 错误处理

默认情况下，如果 Hugo 无法解析该路径，它会抛出错误并导致构建失败。你可以在项目配置中把它改为警告，并指定无法解析路径时要返回的 URL。

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```
