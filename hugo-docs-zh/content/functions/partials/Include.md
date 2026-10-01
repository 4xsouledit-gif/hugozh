+++
title = "partials.Include"
linkTitle = "Include"
description = "执行给定模板，可选择性地传入上下文。若局部模板包含 return 语句，则返回该语句的值，否则返回渲染输出。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/partials/include/"

[params.functions_and_methods]
signatures = ["partials.Include NAME [CONTEXT]"]
returnType = "any"
aliases = ["partial"]
+++

没有 [`return`][] 语句时，`partial` 函数返回 `template.HTML` 类型的字符串。有 `return` 语句时，`partial` 函数可以返回任意数据类型。

下例中有三个*局部模板*：

```tree
layouts/
└── _partials/
    ├── average.html
    ├── breadcrumbs.html
    └── footer.html
```

“average” *局部模板*返回一个或多个数字的平均值。我们通过上下文传入这些数字：

```go-html-template
{{ $numbers := slice 1 6 7 42 }}
{{ $average := partial "average.html" $numbers }}
```

“breadcrumbs” *局部模板*渲染[面包屑导航][breadcrumb navigation]，需要接收当前页面作为上下文：

```go-html-template
{{ partial "breadcrumbs.html" . }}
```

“footer” *局部模板*渲染站点页脚。在这个刻意构造的例子中，页脚无需访问当前页面，因此可以省略上下文：

```go-html-template
{{ partial "footer.html" }}
```

上下文可以传任何内容：页面、页面集合、标量值、切片或 map。下例传入当前页面与三个标量值：

```go-html-template
{{ $ctx := dict
  "page" .
  "name" "John Doe"
  "major" "Finance"
  "gpa" 4.0
}}
{{ partial "render-student-info.html" $ctx }}
```

然后在*局部模板*中：

```go-html-template
<p>{{ .name }} is majoring in {{ .major }}.</p>
<p>Their grade point average is {{ .gpa }}.</p>
<p>See <a href="{{ .page.RelPermalink }}">details.</a></p>
```

要从*局部模板*返回值，请使用 `return` 语句：

```go-html-template
{{ if math.ModBool . 2 }}
  {{ return "even" }}
{{ end }}
{{ return "odd" }}
```

## 相对路径

**（0.167.0 新增）**

在*局部模板*中，以 `./` 或 `../` 开头的路径相对于调用方*局部模板*所在目录解析。例如，给定以下结构：

```tree
layouts/
└── _partials/
    ├── cards/
    │   ├── card.html
    │   └── image.html
    └── footer.html
```

“card” *局部模板*可以这样调用它的同级模板与“footer” *局部模板*：

```go-html-template
{{ partial "./image.html" . }}
{{ partial "../footer.html" . }}
```

仅支持在*局部模板*内部使用相对路径。从其它任何模板调用 `partial "./foo.html"`，或路径解析后落在 `_partials` 目录之外，都会报错。

[`return`]: /functions/go-template/return/
[breadcrumb navigation]: /content-management/sections/#祖先与后代
