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
