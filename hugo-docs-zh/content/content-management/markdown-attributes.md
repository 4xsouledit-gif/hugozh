+++
title = "Markdown 属性"
linkTitle = "Markdown 属性"
description = "在 Markdown 元素后追加属性块，为标题、段落、图片等设置 HTML 属性。"
date = 2026-10-01
weight = 140
source = "https://gohugo.io/content-management/markdown-attributes/"
+++

## 概述

Hugo 支持在图片，以及引用块（blockquote）、围栏代码块（fenced code block）、标题、水平分隔线、列表、段落、表格等块级元素上使用 Markdown 属性（Markdown attributes）。

例如：

```md
这是一个段落。
{class="foo bar" id="baz"}
```

对于 `class` 与 `id`，还可以使用简写形式：

```md
这是一个段落。
{.foo .bar #baz}
```

两种写法都会被 Hugo 渲染为：

```html
<p class="foo bar" id="baz">这是一个段落。</p>
```

无论使用长形式还是简写形式，`class` 与 `id` 的最终取值都会通过 `Attributes` 方法暴露给[渲染钩子模板](/render-hooks/)。例如：

```go-html-template
{{ .Attributes.class }}
{{ .Attributes.id }}
```

在上面的示例中，两个取值分别是 `foo bar` 与 `baz`。

## 块级元素

块级元素的属性默认不生效，需要在项目配置中显式开启：

```toml
[markup.goldmark.parser.attribute]
  title = true # 默认值为 true
  block = true # 默认值为 false
```

其中 `title` 控制标题，`block` 控制其他块级元素，二者的默认值并不相同。

## 独立图片

默认情况下，当 [Goldmark](https://github.com/yuin/goldmark) Markdown 渲染器遇到独立图片元素（同一行上没有其他元素或文字）时，会按照 [CommonMark](https://spec.commonmark.org/current/) 规范把它包裹在 `<p>` 元素中。

因此，如果在图片元素下方写属性块，Hugo 会把属性应用到外层的段落上，而不是图片本身。

要让属性作用于独立图片元素，必须关闭这一默认包裹行为：

```toml
[markup.goldmark.parser]
  wrapStandAloneImageWithinParagraph = false # 默认值为 true
```

## 用法

属性块中可以写[全局 HTML 属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes)，也可以写当前元素类型特有的 HTML 属性。出于内容安全模型的考虑，Hugo 会移除 `onclick`、`onmouseover` 这类 HTML 事件属性。

> [!NOTE]
> 在围栏代码块中，`style` 属性会被 Hugo 当作语法高亮选项处理，而不是全局 HTML 属性。

属性块由一个或多个键值对组成，键值对之间用空格或逗号分隔，整体用花括号包裹。包含空格的字符串值必须加引号。与 HTML 不同，布尔属性必须同时写出键与值。

例如：

```md
> 这是一段引用。
{class="foo bar" hidden=hidden}
```

Hugo 会把它渲染为：

```html
<blockquote class="foo bar" hidden="hidden">
  <p>这是一段引用。</p>
</blockquote>
```

多数情况下，属性块写在 Markdown 元素的下方；标题与围栏代码块则写在右侧：

| 元素 | 属性块位置 |
| --- | --- |
| 引用块 | 下方 |
| 围栏代码块 | 右侧 |
| 标题 | 右侧 |
| 水平分隔线 | 下方 |
| 图片 | 下方 |
| 列表 | 下方 |
| 段落 | 下方 |
| 表格 | 下方 |

例如：

````md
## 第一节 {class=foo}

```sh {class=foo linenos=inline}
declare a=1
echo "${a}"
```

这是一个段落。
{class=foo}
````

如上所示，围栏代码块的属性块并不局限于 HTML 属性，还可以传入语法高亮选项来调整渲染效果。

## 与渲染钩子配合

属性块中声明的属性会以 `.Attributes` 的形式传给渲染钩子（render hook），由钩子模板决定如何把它们写入最终输出。例如标题钩子可以读取 `.Anchor`，并输出带有自定义锚点的标题：

```go-html-template
<h{{ .Level }} id="{{ .Anchor }}" {{- with .Attributes.class }} class="{{ . }}" {{- end }}>
  {{ .Text }}
  <a href="#{{ .Anchor }}">#</a>
</h{{ .Level }}>
```

需要注意，标题的属性块必须在配置中开启 `title = true` 才会生效，否则钩子拿到的 `.Attributes` 中不会包含这些取值。渲染钩子的完整用法见 [渲染钩子](/render-hooks/)。
