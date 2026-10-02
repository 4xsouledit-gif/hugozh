+++
title = "diagrams.Goat"
linkTitle = "Goat"
description = "返回由给定 GoAT 标记与选项创建的 SVGDiagram 对象。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/diagrams/goat/"

[params.functions_and_methods]
signatures = ["diagrams.Goat MARKUP"]
returnType = "diagrams.SVGDiagram"
+++

## 这一页解决什么问题

想在构建时把 ASCII 图（GoAT 标记）变成 SVG，又不想引入客户端 JS，`diagrams.Goat` 就是那个转换器：传入 GoAT 文本，返回一个 `SVGDiagram` 对象，再用 `.Inner` / `.Wrapped` 取 SVG、用 `.Width` / `.Height` 取尺寸。

它最典型的落点是**代码块渲染钩子**：Hugo 已经内建了 `goat` 代码块的渲染支持；要自定义（加图注、换 class）才需要自己写钩子并调用本函数。

## 什么时候用，什么时候别用

**该用**：

- 自定义 `goat` 代码块的渲染（图注、id、class、响应式容器）；
- 需要在模板里手动把一段 GoAT 标记转成 SVG；
- 需要知道渲染后的宽高来做布局预留。

**别用**：

- 只是想在 Markdown 里画一张图 → 直接用内建 `goat` 代码块，无需调用本函数；
- 需要流程图 / 交互图 → GoAT 只支持固定宽度的字符图；
- 需要位图 / 图标 → 用 [`images`](/functions/images/) 命名空间或静态资源。

在[代码块渲染钩子][]中使用时很有用：`diagrams.Goat` 函数返回由给定 [GoAT][] 标记创建的 SVGDiagram 对象。

## 方法

可在 `SVGDiagram` 对象上调用下列方法。

`Inner`
: (`template.HTML`) 返回不带外层 `svg` 元素的 SVG 子元素，便于你自己创建外层包装。

`Wrapped`
: (`template.HTML`) 返回包在 `svg` 元素中的 SVG 子元素。

`Width`
: (`int`) 返回渲染后图表的宽度，单位像素。

`Height`
: (`int`) 返回渲染后图表的高度，单位像素。

## GoAT 图表

Hugo 通过[内建代码块渲染钩子][]原生支持 GoAT 图表。

这段 Markdown：

````md
```goat
.---.     .-.       .-.       .-.     .---.
| A +--->| 1 |<--->| 2 |<--->| 3 |<---+ B |
'---'     '-'       '+'       '+'     '---'
```
````

会被渲染为：

```html
<div class="goat svg-container">
  <svg xmlns="http://www.w3.org/2000/svg" font-family="Menlo,Lucida Console,monospace" viewBox="0 0 352 57">
    ...
  </svg>
</div>
```

在浏览器中显示为：

```goat {class="mw6-ns"}
.---.     .-.       .-.       .-.     .---.
| A +--->| 1 |<--->| 2 |<--->| 3 |<---+ B |
'---'     '-'       '+'       '+'     '---'
```

要自定义渲染方式，可以为 GoAT 图表覆盖 Hugo 的[内建代码块渲染钩子][]。

## 代码块渲染钩子

作为示例，我们来创建一个代码块渲染钩子，把 GoAT 图表渲染为 `figure` 元素，并支持可选图注。

```go-html-template {file="layouts/_markup/render-codeblock-goat.html"}
{{ $caption := or .Attributes.caption "" }}
{{ $class := or .Attributes.class "diagram" }}
{{ $id := or .Attributes.id (printf "diagram-%d" (add 1 .Ordinal)) }}

<figure id="{{ $id }}">
  {{ with diagrams.Goat (trim .Inner "\n\r") }}
    <svg class="{{ $class }}" width="{{ .Width }}" height="{{ .Height }}"  xmlns="http://www.w3.org/2000/svg" version="1.1">
      {{ .Inner }}
    </svg>
  {{ end }}
  <figcaption>{{ $caption }}</figcaption>
</figure>
```

这段 Markdown：

````md {file="content/example.md" }
```goat {class="foo" caption="Diagram 1: Example"}
.---.     .-.       .-.       .-.     .---.
| A +--->| 1 |<--->| 2 |<--->| 3 |<---+ B |
'---'     '-'       '+'       '+'     '---'
```
````

会被渲染为：

```html
<figure id="diagram-1">
  <svg class="foo" width="272" height="57" xmlns="http://www.w3.org/2000/svg" version="1.1">
    ...
  </svg>
  <figcaption>Diagram 1: Example</figcaption>
</figure>
```

按需用 CSS 为这个 SVG 添加样式：

```css
svg.foo {
  font-family: "Segoe UI","Noto Sans",Helvetica,Arial,sans-serif
}
```

[GoAT]: https://github.com/bep/goat
[代码块渲染钩子]: /render-hooks/code-blocks/
[内建代码块渲染钩子]: <https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_markup/render-codeblock-goat.html>

## 完整示例（实测）

代码块渲染钩子 `layouts/_markup/render-codeblock-goat.html`：

```go-html-template {file="layouts/_markup/render-codeblock-goat.html"}
{{ $caption := or .Attributes.caption "" }}
{{ $class := or .Attributes.class "diagram" }}
{{ $id := or .Attributes.id (printf "diagram-%d" (add 1 .Ordinal)) }}

<figure id="{{ $id }}">
  {{ with diagrams.Goat (trim .Inner "\n\r") }}
    <svg class="{{ $class }}" width="{{ .Width }}" height="{{ .Height }}"  xmlns="http://www.w3.org/2000/svg" version="1.1">
      {{ .Inner }}
    </svg>
  {{ end }}
  <figcaption>{{ $caption }}</figcaption>
</figure>
```

页面内容：

````md {file="content/diagram.md"}
```goat {class="foo" caption="Diagram 1: Example"}
.---.     .-.       .-.       .-.     .---.
| A +--->| 1 |<--->| 2 |<--->| 3 |<---+ B |
'---'     '-'       '+'       '+'     '---'
```
````

Hugo 0.167.0 实测渲染（SVG 子元素已省略）：

```html
<figure id="diagram-1">
  <svg class="foo" width="352" height="57"  xmlns="http://www.w3.org/2000/svg" version="1.1">
    ...
  </svg>
  <figcaption>Diagram 1: Example</figcaption>
</figure>
```

> [!NOTE]
> 上游该示例写的是 `width="272"`；本站用 Hugo 0.167.0 实测同一段标记得到 `352`（与上游本页开头的内建钩子示例 `viewBox="0 0 352 57"` 一致）。

**你应当看到什么**：`.Ordinal` 从 0 开始，所以 `id` 是 `diagram-1`；`.Inner` 是**不带** `<svg>` 包装的子元素（实测以 `<g transform=…>` 开头），`.Wrapped` 才带 `<svg>`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 合法 GoAT 标记 | `Width` / `Height` 为整数像素（实测 `352` / `57`） | 否 |
| `.Inner` | SVG 子元素，不含外层 `<svg>` | 否 |
| `.Wrapped` | 含 `<svg>` 的完整片段 | 否 |
| 不是合法图形的文本（如 `"not a diagram"`） | **不报错**，按字符逐个渲染成 SVG 文本（实测） | 否 |
| 返回类型 | `diagrams.SVGDiagram` | 否 |
