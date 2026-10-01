+++
title = "链接"
linkTitle = "链接"
description = "创建链接渲染钩子，覆盖 Markdown 链接到 HTML 的转换，并了解可用的上下文变量。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/render-hooks/links/"
+++

## Markdown 中的链接

一个 Markdown 链接由三部分组成：链接文本、链接目标地址，以及可选的链接标题。

```text
[Post 1](/posts/post-1 "My first post")
 ------  -------------  -------------
  文本      目标地址        标题
```

这三部分会按下文所列的字段传入渲染钩子的上下文。

## 上下文

链接**渲染钩子**模板接收以下上下文：

`Destination`
: （`string`）链接的目标地址。

`Ordinal`
: （`int`）链接在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`PlainText`
: （`string`）链接描述内容的纯文本形式。

`Position`
: （`string`）链接在页面内容中的位置。

`Text`
: （`template.HTML`）链接的描述内容。

`Title`
: （`string`）链接标题。

## 示例

> [!NOTE]
> 对于图片、链接这类行内元素，应使用 `{{-` 与 `-}}` 定界写法去掉首尾空白，避免在相邻的行内元素与文本之间产生空格。

默认配置下，Hugo 按 [CommonMark](https://spec.commonmark.org/current/) 规范渲染 Markdown 链接。要写出行为一致的渲染钩子：

```go-html-template
<a href="{{ .Destination | safeURL }}"
  {{- with .Title }} title="{{ . }}"{{ end -}}
>
  {{- with .Text }}{{ . }}{{ end -}}
</a>
{{- /* chomp trailing newline */ -}}
```

要为站外链接加上取值为 `external` 的 `rel` 属性：

```go-html-template
{{- $u := urls.Parse .Destination -}}
<a href="{{ .Destination | safeURL }}"
  {{- with .Title }} title="{{ . }}"{{ end -}}
  {{- if $u.IsAbs }} rel="external"{{ end -}}
>
  {{- with .Text }}{{ . }}{{ end -}}
</a>
{{- /* chomp trailing newline */ -}}
```

## 内建钩子

Hugo 自带一个内建链接渲染钩子，用于解析 Markdown 链接的目标地址，你可以在项目配置中调整它的行为。默认配置为：

```toml
[markup.goldmark.renderHooks.link]
useEmbedded = 'auto'
```

如上取值为 `auto` 时，Hugo 会自动为多语言单主机项目使用内建链接渲染钩子，具体条件是「共享页面资源复制」功能处于关闭状态；这也是这类项目的默认行为。如果项目、模块或主题定义了自定义链接渲染钩子，则改用自定义钩子。

还可以把该选项配置为 `always`（始终使用内建钩子）、`fallback`（仅作为回退）或 `never`（从不使用）。

内建链接渲染钩子解析站内 Markdown 目标地址时，先查找匹配的页面，再回退到匹配的页面资源，最后回退到匹配的全局资源；远程目标直接透传，无法解析时不会抛出错误或警告。

全局资源必须放在 `assets` 目录中。如果资源放在 `static` 目录且无法或不便迁移，就必须把 `static` 目录挂载到 `assets` 目录，即在项目配置中同时加入下面两项：

```toml
[[module.mounts]]
source = 'assets'
target = 'assets'

[[module.mounts]]
source = 'static'
target = 'assets'
```

## PageInner details

`PageInner` 的主要用途是相对于被包含的页面来解析链接与页面资源。例如可以创建一个「包含」短代码，用多个内容文件拼装一个页面，同时为脚注与目录保留全局上下文：先用位置参数取出要包含的页面逻辑路径，再调用该页面的 `RenderShortcodes` 方法，取不到页面时用 `errorf` 报错。

然后在 Markdown 中用 Markdown 记法调用这个短代码，被包含页面的路径写在位置参数里。

渲染 `/posts/post-2` 时触发的任何渲染钩子都会得到：

- 调用 `Page` 时返回 `/posts/post-1`
- 调用 `PageInner` 时返回 `/posts/post-2`

`PageInner` 在不适用时会回退为 `Page` 的值，并且始终有返回值。

> [!NOTE]
> `PageInner` 只对调用 `RenderShortcodes` 方法的短代码有意义，并且必须以 Markdown 记法调用该短代码。

作为实际例子，Hugo 的内建链接渲染钩子与内建图片渲染钩子都使用 `PageInner` 来解析 Markdown 中链接与图片的目标地址。
