+++
title = "InSection"
linkTitle = "InSection"
description = "报告给定页面是否位于给定 section 中。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/methods/page/insection/"

[params.functions_and_methods]
signatures = ["PAGE.InSection SECTION"]
returnType = "bool"
+++

[section（内容区块）](/quick-reference/glossary/section/)

`Page` 对象上的 `InSection` 方法报告给定页面是否位于给定 section 中。注意，把页面与其同级页面作比较时，该方法返回 `true`。

## 基本用法

内容结构如下：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md
│   │   ├── auction-1.md
│   │   └── auction-2.md
│   ├── 2023-12/
│   │   ├── _index.md
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md
│   ├── bidding.md
│   └── payment.md
└── _index.md
```

渲染 `auction-1` 页面时：

```go-html-template
{{ with .Site.GetPage "/" }}
  {{ $.InSection . }} → false
{{ end }}

{{ with .Site.GetPage "/auctions" }}
  {{ $.InSection . }} → false
{{ end }}

{{ with .Site.GetPage "/auctions/2023-11" }}
  {{ $.InSection . }} → true
{{ end }}

{{ with .Site.GetPage "/auctions/2023-11/auction-2" }}
  {{ $.InSection . }} → true
{{ end }}
```

上面的示例中，我们用 [`with`][] 语句做防御式编码：页面不存在时不输出任何内容。再加上一个 [`else`][] 分支，就可以报告错误：

```go-html-template
{{ $path := "/auctions/2023-11" }}
{{ with .Site.GetPage $path }}
  {{ $.InSection . }} → true
{{ else }}
  {{ errorf "Unable to find the section with path %s" $path }}
{{ end }}
  ```

## 理解上下文

在 `with` 块内部，[上下文](g)（即点号）是该 section 的 `Page` 对象，而不是传入模板的那个 `Page` 对象。如果写成下面这样：

```go-html-template
{{ with .Site.GetPage "/auctions" }}
  {{ .InSection . }} → true
{{ end }}
```

渲染 `auction-1` 页面时结果就是错的，因为这是把 section 页面与它自身作比较。

> [!NOTE]
> 用 `$` 取得传入模板的上下文。

```go-html-template
{{ with .Site.GetPage "/auctions" }}
  {{ $.InSection . }} → true
{{ end }}
```

> [!NOTE]
> 对任何编写模板代码的人来说，透彻理解上下文都至关重要。

[`else`]: /functions/go-template/else/
[`with`]: /functions/go-template/with/
