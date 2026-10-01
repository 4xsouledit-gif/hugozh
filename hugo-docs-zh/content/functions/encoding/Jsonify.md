+++
title = "encoding.Jsonify"
linkTitle = "Jsonify"
description = "返回给定对象编码为 JSON 后的结果。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/encoding/jsonify/"

[params.functions_and_methods]
signatures = ["encoding.Jsonify [OPTIONS] INPUT"]
returnType = "template.HTML"
aliases = ["jsonify"]
+++

## 用法

要自定义 JSON 的输出格式，把选项映射作为第一个参数传入。支持的选项有 "prefix" 与 "indent"。输出中的每个 JSON 元素都会另起一行，行首是 _prefix_，其后按缩进层级重复一或多份 _indent_。

```go-html-template
{{ dict "title" .Title "content" .Plain | jsonify }}
{{ dict "title" .Title "content" .Plain | jsonify (dict "indent" "  ") }}
{{ dict "title" .Title "content" .Plain | jsonify (dict "prefix" " " "indent" "  ") }}
```

## 选项

`encoding.Jsonify` 函数接受一个选项映射。

`indent`
: (`string`) 使用的缩进。默认是 ""。

`prefix`
: (`string`) 缩进前缀。默认是 ""。

`noHTMLEscape`
: (`bool`) 是否禁用对 JSON 引号字符串中问题 HTML 字符的转义。默认行为是把 `&`、`<`、`>` 转义为 `\u0026`、`\u003c`、`\u003e`，以避免把 JSON 嵌入 HTML 时可能出现的某些安全问题。默认是 `false`。
