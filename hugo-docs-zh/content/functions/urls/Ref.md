+++
title = "urls.Ref"
linkTitle = "Ref"
description = "返回具有给定路径、语言与输出格式的页面的绝对 URL。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/urls/ref/"

[params.functions_and_methods]
returnType = "string"
aliases = ["ref"]
+++

## 用法

`ref` 函数接受两个参数：

1. 用于解析相对路径的上下文（通常是当前页面）。
1. 目标页面的路径，或一个选项映射（见下文）。

## 选项

`path`
: （`string`）目标页面的路径。不以斜杠（`/`）开头的路径会先相对于当前页面解析，再相对于站点其余部分解析。

`lang`
: （`string`）目标页面的语言。默认为当前语言。可选项。

`outputFormat`
: （`string`）目标页面的输出格式。默认为当前输出格式。可选项。

## 示例

下面的示例展示英语版站点上某个页面的渲染输出：

```go-html-template
{{ ref . "/books/book-1" }} → https://example.org/en/books/book-1/

{{ $opts := dict "path" "/books/book-1" }}
{{ ref . $opts }} → https://example.org/en/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" }}
{{ ref . $opts }} → https://example.org/de/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" "outputFormat" "json" }}
{{ ref . $opts }} → https://example.org/de/books/book-1/index.json
```

## 错误处理

默认情况下，如果 Hugo 无法解析该路径，就会抛出错误并导致构建失败。你可以在项目配置中把它改成警告，并指定一个路径无法解析时返回的 URL。

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```
