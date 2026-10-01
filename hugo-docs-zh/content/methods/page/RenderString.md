+++
title = "RenderString"
linkTitle = "RenderString"
description = "把给定的标记语言渲染为 HTML 并返回。"
date = 2026-10-02
weight = 700
source = "https://gohugo.io/methods/page/renderstring/"

[params.functions_and_methods]
signatures = ["PAGE.RenderString [OPTIONS] MARKUP"]
returnType = "template.HTML"
+++

`Page` 对象上的 `RenderString` 方法会把标记语言渲染为 HTML。

```go-html-template
{{ $s := "An *emphasized* word" }}
{{ $s | .RenderString }} → An <em>emphasized</em> word
```

## 选项

`Page` 对象上的 `RenderString` 方法接受一个选项映射。

`display`
: （`string`）指定 `inline` 或 `block`。若为 `inline`，会移除短片段外围的 `p` 标签。默认为 `inline`。

`markup`
: （`string`）为所提供的标记语言指定一个[标记语言标识符][]。默认取前置元数据中的 `markup` 值，若没有则回退到根据页面文件扩展名推导出的值。

## 示例

以块级显示模式把 Markdown 内容渲染为 HTML：

```go-html-template
{{ $opts := dict "display" "block" }}
{{ $s | .RenderString $opts }} → <p>An <em>emphasized</em> word</p>
```

以块级显示模式把 [Pandoc][] 内容渲染为 HTML：

```go-html-template
{{ $s := "H~2~O" }}

{{ $opts := dict "markup" "pandoc" "display" "block" }}
{{ $s | .RenderString $opts }} → H<sub>2</sub>O
```

[Pandoc]: /content-management/formats/#pandoc
[markup identifier]: /content-management/formats/#classification
