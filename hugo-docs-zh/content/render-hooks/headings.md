+++
title = "标题"
linkTitle = "标题"
description = "创建标题渲染钩子，覆盖 Markdown 标题到 HTML 的转换，并为标题追加锚点链接。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/render-hooks/headings/"
+++

## 上下文

标题**渲染钩子**模板接收以下上下文：

`Anchor`
: （`string`）标题元素的 `id` 属性。

`Attributes`
: （`map`）[Markdown 属性](/content-management/markdown-attributes/)，需要按下面的方式配置站点后才可用：

  ```toml
  [markup.goldmark.parser.attribute]
  title = true
  ```

`Level`
: （`int`）标题层级，取值为 1 到 6。

`Ordinal`
: （`int`）标题在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`PlainText`
: （`string`）标题文本的纯文本形式。

`Position`
: （`string`）标题在页面内容中的位置。

`Text`
: （`template.HTML`）标题文本。

## 示例

默认配置下，Hugo 按 [CommonMark](https://spec.commonmark.org/current/) 规范渲染 Markdown 标题，并额外加入自动生成的 `id` 属性。要写出行为一致的渲染钩子：

```go-html-template
<h{{ .Level }} id="{{ .Anchor }}" {{- with .Attributes.class }} class="{{ . }}" {{- end }}>
  {{- .Text -}}
</h{{ .Level }}>
```

要为每个标题右侧追加一个锚点链接：

```go-html-template
<h{{ .Level }} id="{{ .Anchor }}" {{- with .Attributes.class }} class="{{ . }}" {{- end }}>
  {{ .Text }}
  <a href="#{{ .Anchor }}">#</a>
</h{{ .Level }}>
```

## 使用要点

`Anchor` 通常由标题文本推导而来，因此标题文本一改动，旧锚点就会失效，指向旧链接的读者会落到错误的位置。示例用 `id="{{ .Anchor }}"` 把锚点原样输出到标题元素上，标题钩子因此也是统一改写锚点命名规则的地方。

`Attributes` 中的 `class` 是标题钩子最常用的字段，上面的示例已经把它传递到输出的 `<h*>` 元素；其他属性可以按同样方式取用。只要提供了标题钩子，标题的整个 HTML 输出就由模板决定，因此 `Level`、`Anchor` 与 `Text` 都应保留在输出中，否则目录与锚点导航会失效。

标题钩子还可以按页面类型（type）、语言与输出格式分别提供，例如只为某个内容分区或 RSS 输出使用不同的标题结构，具体查找方式见[简介](/render-hooks/introduction/)。

## PageInner details

`PageInner` 的主要用途是相对于被包含的页面来解析链接与页面资源。例如可以创建一个「包含」短代码，用多个内容文件拼装一个页面，同时为脚注与目录保留全局上下文：先用位置参数取出要包含的页面逻辑路径，再调用该页面的 `RenderShortcodes` 方法，取不到页面时用 `errorf` 报错。

然后在 Markdown 中用 Markdown 记法调用这个短代码，被包含页面的路径写在位置参数里。渲染 `/posts/post-2` 时触发的任何渲染钩子，调用 `Page` 会得到 `/posts/post-1`，调用 `PageInner` 则会得到 `/posts/post-2`。

`PageInner` 在不适用时会回退为 `Page` 的值，并且始终有返回值。它只对调用 `RenderShortcodes` 方法的短代码有意义，并且必须以 Markdown 记法调用该短代码。
