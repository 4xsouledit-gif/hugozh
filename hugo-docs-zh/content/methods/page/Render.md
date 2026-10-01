+++
title = "Render"
linkTitle = "Render"
description = "以给定页面为上下文、或使用可选的上下文参数渲染视图模板，并返回结果。"
date = 2026-10-02
weight = 680
source = "https://gohugo.io/methods/page/render/"

[params.functions_and_methods]
signatures = ["PAGE.Render VIEW [CONTEXT]"]
returnType = "template.HTML"
+++

`Page` 对象上的 `Render` 方法会用给定页面作为[上下文](g)渲染一个[视图模板][]，也可以使用可选的上下文参数来渲染。

**（0.164.0 新增）**：`VIEW` 参数现在支持以斜杠分隔的目录路径。

**（0.166.0 新增）**：该方法现在接受可选的 `CONTEXT` 参数。

`VIEW` 参数是_视图_模板的名称，前面可以有以斜杠分隔的目录路径。不要包含文件扩展名。Hugo 会通过[模板查找顺序][]解析该模板，因此同一个 `VIEW` 值可能因正在渲染的页面不同而映射到不同的模板。

默认情况下，渲染模板时 Hugo 会把 `Page` 对象作为上下文（即点号）。要传入不同的上下文，请提供可选的 `CONTEXT` 参数。

## 示例

以下示例演示了带自定义上下文参数和不带该参数调用该方法的情况。

### 默认上下文

不带上下文参数调用时，模板中的上下文就是 `Page` 对象：

```go-html-template {file="layouts/home.html"}
<ul>
  {{ range site.RegularPages }}
    <li>{{ .Render "_views/summary" }}</li>
  {{ end }}
</ul>
```

```go-html-template {file="layouts/_views/summary.html"}
<a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
```

### 自定义上下文

要向视图模板传递额外数据，请提供自定义上下文参数。下例把一个映射作为上下文传入，其中组合了 `Page` 对象和一个额外的键值对：

```go-html-template {file="layouts/home.html"}
<div>
  {{ range site.RegularPages }}
    {{ .Render "_views/card" (dict "page" . "class" "featured") }}
  {{ end }}
</div>
```

```go-html-template {file="layouts/_views/card.html"}
<div class="card {{ .class }}">
  <h2><a href="{{ .page.RelPermalink }}">{{ .page.LinkTitle }}</a></h2>
  {{ .page.Summary }}
</div>
```

## 组织方式

最佳实践是把_视图_模板集中放在一个专用子目录中。Hugo 并不像对 `_partials`、`_shortcodes` 和 `_markup` 那样为_视图_模板保留目录名。下面的示例使用 `_views`，其下划线前缀把它与其他路径段区分开，并传达出它的用途，但用一个名为 `foo` 的目录也同样可行。

下例使用路径段把_视图_模板组织到一个专用子目录中：

```tree
layouts/
├── _views/
│   └── summary.html
├── books/
│   └── _views/
│       └── summary.html
├── baseof.html
├── home.html
├── page.html
├── section.html
├── taxonomy.html
└── term.html
```

以及这个模板：

```go-html-template {file="layouts/home.html"}
<ul>
  {{ range site.RegularPages }}
    {{ .Render "_views/summary" }}
  {{ end }}
</ul>
```

渲染类型为 `books` 的内容时，`Render` 方法会调用：

```text
layouts/books/_views/summary.html
```

对于所有其他页面，`Render` 方法会调用：

```text
layouts/_views/summary.html
```

## 说明

尽管与 [`partial`][] 函数相似，但两者有重要区别。

`Render` 方法|`partial` 函数
:--|:--
默认以 `Page` 对象作为上下文。你可以传入可选的 `CONTEXT` 参数来替换它，从而传入对象、切片、映射和标量的组合。|你必须指定上下文，从而传入对象、切片、映射和标量的组合。
Hugo 会通过[模板查找顺序][]自动解析模板，并且可以针对任意页面类型、内容类型、逻辑路径、语言或输出格式。|在查找匹配的模板时，Hugo 不考虑当前页面类型、内容类型、逻辑路径、语言或输出格式。
模板可以位于 `layouts` 目录中的任意层级。|模板必须位于 `layouts/_partials` 目录中。
没有缓存版本。|[`partialCached`][] 函数是它的缓存版本。

[`partial`]: /functions/partials/include/
[`partialCached`]: /functions/partials/includecached/
[template lookup order]: /templates/lookup-order/
[view template]: /templates/types/#view
