+++
title = "引用块"
linkTitle = "引用块"
description = "创建引用块渲染钩子，覆盖 Markdown 引用块的渲染，并处理 NOTE 等警示块类型。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/render-hooks/blockquotes/"
+++

## 上下文

引用块**渲染钩子**模板接收以下上下文：

`AlertType`
: （`string`）当 `Type` 为 `alert` 时适用，取警示块类型的小写形式。参见下文[警示块](#警示块)。

`AlertTitle`
: （`template.HTML`）当 `Type` 为 `alert` 时适用，取警示块标题。参见下文[警示块](#警示块)。

`AlertSign`
: （`string`）当 `Type` 为 `alert` 时适用，取警示块标记。通常用于表示警示块是否可在界面上折叠，取值为 `+`、`-` 或空字符串。参见下文[警示块](#警示块)。

`Attributes`
: （`map`）[Markdown 属性](/content-management/markdown-attributes/)，需要按下面的方式配置站点后才可用：

  ```toml
  [markup.goldmark.parser.attribute]
  block = true
  ```

`Ordinal`
: （`int`）引用块在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`Position`
: （`string`）引用块在页面内容中的位置。

`Text`
: （`template.HTML`）引用块的文本；当 `Type` 为 `alert` 时不含第一行。参见下文[警示块](#警示块)。

`Type`
: （`string`）引用块类型。带警示块标记时返回 `alert`，否则返回 `regular`。参见下文[警示块](#警示块)。

## 示例

默认配置下，Hugo 按 [CommonMark](https://spec.commonmark.org/current/) 规范渲染 Markdown 引用块。要写出行为一致的渲染钩子：

```go-html-template
<blockquote>
  {{ .Text }}
</blockquote>
```

要把引用块渲染为 HTML 的 `figure` 元素，并附上可选的出处与题注：

```go-html-template
<figure>
  <blockquote {{ with .Attributes.cite }}cite="{{ . }}"{{ end }}>
    {{ .Text }}
  </blockquote>
  {{ with .Attributes.caption }}
    <figcaption class="blockquote-caption">
      {{ . | safeHTML }}
    </figcaption>
  {{ end }}
</figure>
```

对应的 Markdown 写法是：在引用块下方另起一行，用花括号给出 `cite` 与 `caption` 两个属性：

```md
> Some text
{cite="https://gohugo.io" caption="Some caption"}
```

## 警示块

警示块（alert）又称 callout 或 admonition，是用于强调关键信息的引用块。

### 基本语法

使用基本 Markdown 语法时，每个警示块的第一行是警示块标记：一个感叹号加警示块类型，整体包在方括号中。类型可以是 `NOTE`、`TIP`、`IMPORTANT`、`WARNING` 与 `CAUTION`，例如在引用块首行写 `> [!NOTE]`，随后的行写正文内容。基本语法与 [GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)、[Obsidian](https://help.obsidian.md/Editing+and+formatting/Callouts) 和 [Typora](https://support.typora.io/Markdown-Reference/#callouts--github-style-alerts) 兼容。

### 扩展语法

使用扩展 Markdown 语法时，可以额外给出警示块标记和/或警示块标题。警示块标记是 `+` 或 `-`，通常用于表示警示块是否可在界面上折叠。例如首行写 `> [!WARNING]+ Radiation hazard`，再写正文行。

扩展语法与 [Obsidian](https://help.obsidian.md/Editing+and+formatting/Callouts) 兼容。

> [!NOTE]
> 扩展语法与 GitHub、Typora 不兼容。如果加了警示块标记或警示块标题，这两个应用会把该 Markdown 当作普通引用块渲染。

### 示例

下面这个引用块渲染钩子在存在警示块标记时渲染多语言警示块，否则按 CommonMark 规范渲染普通引用块：

```go-html-template
{{ $emojis := dict
  "caution" ":exclamation:"
  "important" ":information_source:"
  "note" ":information_source:"
  "tip" ":bulb:"
  "warning" ":information_source:"
}}

{{ if eq .Type "alert" }}
  <blockquote class="alert alert-{{ .AlertType }}">
    <p class="alert-heading">
      {{ transform.Emojify (index $emojis .AlertType) }}
      {{ with .AlertTitle }}
        {{ . }}
      {{ else }}
        {{ or (i18n .AlertType) (title .AlertType) }}
      {{ end }}
    </p>
    {{ .Text }}
  </blockquote>
{{ else }}
  <blockquote>
    {{ .Text }}
  </blockquote>
{{ end }}
```

要覆盖标签文本，在 i18n 文件中加入如下条目：

```toml
caution = 'Caution'
important = 'Important'
note = 'Note'
tip = 'Tip'
warning = 'Warning'
```

虽然可以像上面那样用一个模板加条件逻辑处理，也可以为每种引用块 `Type` 创建单独的模板：

```tree
layouts/
  └── _markup/
      ├── render-blockquote-alert.html
      └── render-blockquote-regular.html
```

## PageInner details

`PageInner` 的主要用途是相对于被包含的页面来解析链接与页面资源。例如可以创建一个「包含」短代码，用多个内容文件拼装一个页面，同时为脚注与目录保留全局上下文：先用位置参数取出要包含的页面逻辑路径，再调用该页面的 `RenderShortcodes` 方法，取不到页面时用 `errorf` 报错。

然后在 Markdown 中用 Markdown 记法调用这个短代码，被包含页面的路径写在位置参数里。渲染 `/posts/post-2` 时触发的任何渲染钩子，调用 `Page` 会得到 `/posts/post-1`，调用 `PageInner` 则会得到 `/posts/post-2`。

`PageInner` 在不适用时会回退为 `Page` 的值，并且始终有返回值。它只对调用 `RenderShortcodes` 方法的短代码有意义，并且必须以 Markdown 记法调用该短代码。
