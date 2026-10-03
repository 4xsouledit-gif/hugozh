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

## 这一页解决什么问题

同一个「卡片」样式，列表页要用、首页要用、相关阅读也要用。`.Render` 让你把这段视图抽成一个**视图模板**（view template），然后对每个页面调用它：默认以该页面为上下文；需要额外数据时传第二个参数。

它和 [`partial`](/functions/partials/include/) 的关系是：**`.Render` 会走模板查找顺序**，同一个 `VIEW` 名可能因页面类型/内容类型/语言/输出格式而映射到不同模板——这是 `partial` 做不到的。

## 什么时候用，什么时候别用

**该用**：

- 视图需要「按内容类型/语言/输出格式自动选择模板」——例如 `books` 类型用一套卡片、其他类型用另一套；
- 想把渲染逻辑组织在 `layouts/_views/` 这类目录里，并让 Hugo 自动解析路径。

**别用**：

- 只是复用一段无差别的模板片段、不需要查找顺序 → 用 [`partial`](/functions/partials/include/)，需要缓存用 [`partialCached`](/functions/partials/includecached/)（`.Render` 没有缓存版本）；
- 想在页面里渲染 Markdown 字符串 → 用 [`.RenderString`](/methods/page/renderstring/)；
- 想在短代码里包含另一个内容文件 → 用 [`.RenderShortcodes`](/methods/page/rendershortcodes/)。

**`.Render` 与 `partial` 的三点差别（上游）**：上下文默认是 `Page`（partial 必须显式传）；会按模板查找顺序解析（partial 不会）；模板可放在 `layouts` 任意层级（partial 必须在 `layouts/_partials`）。

## 用法

`Page` 对象上的 `Render` 方法会用给定页面作为[上下文](g)渲染一个[视图模板][]，也可以使用可选的上下文参数来渲染。

**（0.164.0 新增）**：`VIEW` 参数现在支持以斜杠分隔的目录路径。

**（0.166.0 新增）**：该方法现在接受可选的 `CONTEXT` 参数。

`VIEW` 参数是_视图_模板的名称，前面可以有以斜杠分隔的目录路径。不要包含文件扩展名。Hugo 会通过[模板查找顺序][]解析该模板，因此同一个 `VIEW` 值可能因正在渲染的页面不同而映射到不同的模板。

默认情况下，渲染模板时 Hugo 会把 `Page` 对象作为上下文（即点号）。要传入不同的上下文，请提供可选的 `CONTEXT` 参数。

### 示例

以下示例演示了带自定义上下文参数和不带该参数调用该方法的情况。

#### 默认上下文

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

#### 自定义上下文

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

### 组织方式

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

### 说明

尽管与 [`partial`][] 函数相似，但两者有重要区别。

`Render` 方法|`partial` 函数
:--|:--
默认以 `Page` 对象作为上下文。你可以传入可选的 `CONTEXT` 参数来替换它，从而传入对象、切片、映射和标量的组合。|你必须指定上下文，从而传入对象、切片、映射和标量的组合。
Hugo 会通过[模板查找顺序][]自动解析模板，并且可以针对任意页面类型、内容类型、逻辑路径、语言或输出格式。|在查找匹配的模板时，Hugo 不考虑当前页面类型、内容类型、逻辑路径、语言或输出格式。
模板可以位于 `layouts` 目录中的任意层级。|模板必须位于 `layouts/_partials` 目录中。
没有缓存版本。|[`partialCached`][] 函数是它的缓存版本。

## 完整示例：默认上下文与自定义上下文

两个视图模板：

```go-html-template {file="layouts/_views/summary.html"}
<a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
```

```go-html-template {file="layouts/_views/card.html"}
<div class="card {{ .class }}"><h2><a href="{{ .page.RelPermalink }}">{{ .page.LinkTitle }}</a></h2></div>
```

调用它们的内容页模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
{{ .Render "_views/summary" }}
{{ .Render "_views/card" (dict "page" . "class" "featured") }}
```

实测（Hugo 0.167.0）渲染 `/posts/post-2/`：

```html
<a href="/posts/post-2/">第二篇</a>
<div class="card featured"><h2><a href="/posts/post-2/">第二篇</a></h2></div>
```

渲染 `/posts/first-post/` 时第一行变成 `<a href="/posts/first-post/">第一篇</a>`（页面设了 `slug`，所以 URL 与 `.Path` 不同）。

**你应当看到什么**：默认上下文里直接写 `.RelPermalink` 就有效；自定义上下文里必须写 `.page.RelPermalink`（映射里的键名 `page`），另外 `.class` 被 `{{ .class }}` 插入到类名中。少写一层（例如在自定义上下文里直接 `.RelPermalink`）不会报错但会输出空值。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 模板存在 | `template.HTML`（可直接输出，不会被转义） | 否 |
| 默认上下文 | 点号是当前 `Page` 对象（实测） | 否 |
| 传 `CONTEXT` | 点号是你传入的值（实测 `dict` 可用） | 否 |
| `VIEW` 带目录路径 | 支持（0.164.0 起；实测 `_views/card`） | 否 |
| `VIEW` 写错/模板不存在 | —— | 是：找不到模板会在构建时报错（`failed to render …` 之类） |
| 返回值类型 | `template.HTML` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`partial`]: /functions/partials/include/
[`partialCached`]: /functions/partials/includecached/
[template lookup order]: /templates/lookup-order/
[view template]: /templates/types/#view
