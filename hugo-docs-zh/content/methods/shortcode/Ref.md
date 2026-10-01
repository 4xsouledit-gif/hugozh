+++
title = "Ref"
linkTitle = "Ref"
description = "返回具有给定路径、语言和输出格式的页面的绝对 URL。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/shortcode/ref/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Ref OPTIONS"]
returnType = "string"
+++

## 用法

`Ref` 方法需要单个参数：一个选项映射。

## 选项

`path`
: （`string`）目标页面的路径。不以斜杠（`/`）开头的路径先相对于当前页面解析，再相对于站点的其余部分解析。

`lang`
: （`string`）目标页面的语言。默认是当前语言。可选。

`outputFormat`
: （`string`）目标页面的输出格式。默认是当前输出格式。可选。

## 示例

下面的示例展示了站点英文版本中某个页面的渲染输出：

```go-html-template
{{ $opts := dict "path" "/books/book-1" }}
{{ .Ref $opts }} → https://example.org/en/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" }}
{{ .Ref $opts }} → https://example.org/de/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" "outputFormat" "json" }}
{{ .Ref $opts }} → https://example.org/de/books/book-1/index.json
```

## 错误处理

默认情况下，如果 Hugo 无法解析路径，它会抛出错误并让构建失败。你可以在项目配置中把它改成警告，并指定无法解析路径时要返回的 URL。

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```
