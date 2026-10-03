+++
title = "block"
linkTitle = "block"
description = "定义模板，并在当前位置执行它。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/go-template/block/"

[params.functions_and_methods]
signatures = ["block NAME CONTEXT"]
+++

## 这一页解决什么问题

`block` 把「定义一个模板」和「立刻执行它」合成一句：`{{ block "main" . }}默认内容{{ end }}` 等价于先 `{{ define "main" }}…{{ end }}`，再 `{{ template "main" . }}`。它的价值在于**留出可覆盖的缺口**：`baseof.html` 用 `block` 定义页面骨架，具体页面模板再用 `define` 覆盖其中一块，而不必复制整个 HTML 骨架。

## 什么时候用，什么时候别用

**该用**：

- 搭「基础模板 + 每页只改一块」的结构：`baseof.html` 里写 `{{ block "main" . }}{{ end }}`，`single.html`、`list.html` 各自 `{{ define "main" }}…{{ end }}`；
- 需要给某个位置准备一段**默认内容**：没有页面覆盖它时就用默认值。

**别用**：

- 复用一小段 HTML / 逻辑 → 用 [`partial`](/functions/partials/include/)；`block` 是模板级结构，不适合当函数调用；
- 只是想定义一个模板、稍后再调用 → 用 [`define`](/functions/go-template/define/) + [`template`](/functions/go-template/template/)；
- 参数化渲染（把数据传进被调模板）→ `template` / `partial` 更直接。

## 用法

`block` 是「定义模板」的简写：

```go-html-template
{{ define "name" }} T1 {{ end }}
```

随后在当前位置执行它：

```go-html-template
{{ template "name" pipeline }}
```

典型用法是先定义一组根模板，再通过重新定义其中的 block 模板来定制它们。

```go-html-template {file="layouts/baseof.html"}
<body>
  <main>
    {{ block "main" . }}
      {{ print "default value if 'main' template is empty" }}
    {{ end }}
  </main>
</body>
```

```go-html-template {file="layouts/page.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
{{ end }}
```

```go-html-template {file="layouts/section.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  {{ range .Pages }}
    <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ end }}
{{ end }}
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

## 完整示例（实测）

基础骨架 `layouts/baseof.html` 留出 `main` 与 `footer` 两个缺口；列表页只覆盖 `footer`，于是 `main` 落回默认值。

```go-html-template {file="layouts/baseof.html"}
<!doctype html>
<html><body>
BASE-START
{{ block "main" . }}DEFAULT-MAIN{{ end }}
FOOTER:{{ block "footer" . }}DEFAULT-FOOTER{{ end }}
BASE-END
</body></html>
```

```go-html-template {file="layouts/_default/list.html"}
{{ define "footer" }}CUSTOM-FOOTER{{ end }}
```

Hugo 0.167.0 实测，列表页（`public/posts/index.html`）渲染为：

```html
<!doctype html>
<html><body>
BASE-START
DEFAULT-MAIN
FOOTER:CUSTOM-FOOTER
BASE-END
</body></html>
```

**你应当看到什么**：`main` 位置是默认值 `DEFAULT-MAIN`（列表页没有覆盖它），`footer` 位置是覆盖后的 `CUSTOM-FOOTER`。这正是 `block` 的语义：**有覆盖就用覆盖，没有就用 `block` 自身的内容**。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 同名模板未被 `define` | 渲染 `block` 自带的默认内容 | 否 |
| 同名模板已被 `define` | 渲染 `define` 的内容，`block` 默认内容被忽略 | 否 |
| 子模板完全没有 `define` 任何块 | `baseof.html` **不会**被套用，子模板内容原样输出（实测：`list.html` 只写一行文本时，输出就是那一行，没有 `BASE-START`） | 否 |
| `CONTEXT` | 决定块内点（`.`）的值；实测传入页面对象后，块内可用 `.Title` | 否 |

> [!NOTE]
> 「子模板必须至少定义一个块，`baseof.html` 才会生效」这一点上游没有写明，是本站实测结论（Hugo 0.167.0）。
