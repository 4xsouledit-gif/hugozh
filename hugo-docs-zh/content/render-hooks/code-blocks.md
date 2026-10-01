+++
title = "代码块"
linkTitle = "代码块"
description = "创建代码块渲染钩子，覆盖围栏代码块的默认高亮输出，并按语言定制渲染方式。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/render-hooks/code-blocks/"
+++

## Markdown 中的代码块

下面这段 Markdown 含有一个围栏代码块：

````md
```sh {class="my-class" id="my-codeblock" lineNos=inline tabWidth=2}
declare a=1
echo "$a"
exit
```
````

一个围栏代码块由以下部分组成：

- 起始[代码围栏](https://spec.commonmark.org/current/#code-fence)
- 可选的信息字符串
- 代码样例
- 结束代码围栏

在上面的例子中，信息字符串包含：

- 代码样例的语言（第一个词）
- 可选的属性列表，用空格或逗号分隔，写在花括号内

信息字符串中的属性可以是通用属性，也可以是高亮选项。

上例中的**通用属性**是 `class` 与 `id`。如果代码块渲染钩子没有做特殊处理，Hugo 会把每个通用属性加到包裹代码块输出的 HTML 元素上。按照自身的内容安全模型，Hugo 会移除 `onclick`、`onmouseover` 这类 HTML 事件属性。通用属性通常是全局 HTML 属性，也可以包含自定义属性。

上例中的**高亮选项**是 `lineNos` 与 `tabWidth`。Hugo 使用内建语法高亮器渲染代码样例，可以通过指定一个或多个[高亮选项](/content-management/syntax-highlighting/)来控制渲染结果的外观。

> [!NOTE]
> `style` 虽然是全局 HTML 属性，但出现在信息字符串中时会被当作高亮选项。

## 上下文

代码块**渲染钩子**模板接收以下上下文：

`Attributes`
: （`map`）信息字符串中的通用属性。

`Inner`
: （`string`）起始与结束代码围栏之间的内容，不含信息字符串。

`Options`
: （`map`）信息字符串中的高亮选项。

`Ordinal`
: （`int`）代码块在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`Position`
: （`text.Position`）代码块在页面内容中的位置。

`Type`
: （`string`）信息字符串的第一个词，通常是代码语言。

## 示例

默认情况下，Hugo 使用内建语法高亮器渲染围栏代码块，并包裹渲染结果。要写出行为一致的渲染钩子：

```go-html-template
{{ $result := transform.HighlightCodeBlock . }}
{{ $result.Wrapped }}
```

当语言未指定或高亮器不支持该语言时回退为纯文本：

```go-html-template
{{- $opts := dict }}
{{- if not (transform.CanHighlight .Type) }}
  {{- $opts = dict "type" "text" }}
{{- end }}
{{- $result := transform.HighlightCodeBlock . $opts }}
{{- $result.Wrapped }}
```

尽管可以用一个模板加条件逻辑来按语言区分行为，也可以为不同语言创建单独的模板：

```tree
layouts/
  └── _markup/
      ├── render-codeblock-mermaid.html
      ├── render-codeblock-python.html
      └── render-codeblock.html
```

例如，创建一个渲染 [Mermaid](https://mermaid.js.org/) 图表的代码块渲染钩子：

```go-html-template
<pre class="mermaid">
  {{ .Inner | htmlEscape | safeHTML }}
</pre>
{{ .Page.Store.Set "hasMermaid" true }}
```

然后在**基础**模板的**末尾**、`body` 结束标签之前加入这段代码：

```go-html-template
{{ if .Store.Get "hasMermaid" }}
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
  </script>
{{ end }}
```

## 内建钩子

Hugo 自带一个内建代码块渲染钩子，用于渲染 GoAT 图表（ASCII 图），详见[图表](/content-management/diagrams/)。

## PageInner details

`PageInner` 的主要用途是相对于被包含的页面来解析链接与页面资源。例如可以创建一个「包含」短代码，用多个内容文件拼装一个页面，同时为脚注与目录保留全局上下文：先用位置参数取出要包含的页面逻辑路径，再调用该页面的 `RenderShortcodes` 方法，取不到页面时用 `errorf` 报错。

然后在 Markdown 中用 Markdown 记法调用这个短代码，被包含页面的路径写在位置参数里。渲染 `/posts/post-2` 时触发的任何渲染钩子，调用 `Page` 会得到 `/posts/post-1`，调用 `PageInner` 则会得到 `/posts/post-2`。

`PageInner` 在不适用时会回退为 `Page` 的值，并且始终有返回值。它只对调用 `RenderShortcodes` 方法的短代码有意义，并且必须以 Markdown 记法调用该短代码。
