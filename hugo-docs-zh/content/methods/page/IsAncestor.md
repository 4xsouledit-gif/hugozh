+++
title = "IsAncestor"
linkTitle = "IsAncestor"
description = "报告 PAGE1 是否为 PAGE2 的祖先。"
date = 2026-10-02
weight = 280
source = "https://gohugo.io/methods/page/isanancestor/"

[params.functions_and_methods]
signatures = ["PAGE1.IsAncestor PAGE2"]
returnType = "bool"
+++

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

渲染 `auctions` 页面时：

```go-html-template
{{ with .Site.GetPage "/" }}
  {{ $.IsAncestor . }} → false
{{ end }}

{{ with .Site.GetPage "/auctions" }}
  {{ $.IsAncestor . }} → false
{{ end }}

{{ with .Site.GetPage "/auctions/2023-11" }}
  {{ $.IsAncestor . }} → true
{{ end }}

{{ with .Site.GetPage "/auctions/2023-11/auction-2" }}
  {{ $.IsAncestor . }} → true
{{ end }}
```

上面的示例中，我们用 [`with`][] 语句做防御式编码：页面不存在时不输出任何内容。再加上一个 [`else`][] 分支，就可以报告错误：

```go-html-template
{{ $path := "/auctions/2023-11" }}
{{ with .Site.GetPage $path }}
  {{ $.IsAncestor . }} → true
{{ else }}
  {{ errorf "Unable to find the section with path %s" $path }}
{{ end }}
  ```

## 理解上下文

在 `with` 块内部，[上下文](g)（即点号）是该 section 的 `Page` 对象，而不是传入模板的那个 `Page` 对象。如果写成下面这样：

```go-html-template
{{ with .Site.GetPage "/auctions" }}
  {{ .IsAncestor . }} → true
{{ end }}
```

渲染 `auction-1` 页面时结果就是错的，因为这是把 section 页面与它自身作比较。

> [!NOTE]
> 用 `$` 取得传入模板的上下文。

```go-html-template
{{ with .Site.GetPage "/auctions" }}
  {{ $.IsAncestor . }} → true
{{ end }}
```

> [!NOTE]
> 对任何编写模板代码的人来说，透彻理解上下文都至关重要。

[`else`]: /functions/go-template/else/
[`with`]: /functions/go-template/with/
