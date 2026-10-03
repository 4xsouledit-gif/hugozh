+++
title = "RenderString"
linkTitle = "RenderString"
description = "把给定的标记语言渲染为 HTML 并返回。"
date = 2026-10-02
weight = 700
source = "https://gohugo.io/methods/page/renderstring/"

[params.functions_and_methods]
signatures = ["PAGE.RenderString [OPTIONS] MARKUP"]
returnType = "template.HTML"
+++

## 这一页解决什么问题

参数、数据文件、短代码参数里拿到的往往是一段**字符串形式的 Markdown**（比如 `[params].tagline = "**快来**看看"`）。直接输出会显示星号。`.RenderString` 把这段字符串按当前页面的标记语言渲染成 HTML：

```go-html-template
{{ $s := "An *emphasized* word" }}
{{ $s | .RenderString }} → An <em>emphasized</em> word
```

它返回 `template.HTML`，所以输出时不会再被转义。

## 什么时候用，什么时候别用

**该用**：

- 渲染来自 front matter / 数据文件 / 站点参数的 Markdown 字符串；
- 短代码内部把 `.Inner` 当作 Markdown 处理（本站测试站的 `note` 短代码就是这么写的）；
- 需要在**非 Markdown 上下文**（如 HTML 模板）里渲染一段 Markdown。

**别用**：

- 渲染整个页面的正文 → 用 [`.Content`](/methods/page/content/)；
- 渲染另一个**内容文件**的正文 → 用 [`.RenderShortcodes`](/methods/page/rendershortcodes/)（保留 Markdown）或那个页面的 `.Content`；
- 只想把 HTML 标签去掉 → 用 [`transform.Plainify`](/functions/transform/plainify/)；
- 想把普通文本原样输出 → 不需要它。

## 用法

`Page` 对象上的 `RenderString` 方法会把标记语言渲染为 HTML。

```go-html-template
{{ $s := "An *emphasized* word" }}
{{ $s | .RenderString }} → An <em>emphasized</em> word
```

### 选项

`Page` 对象上的 `RenderString` 方法接受一个选项映射。

`display`
: （`string`）指定 `inline` 或 `block`。若为 `inline`，会移除短片段外围的 `p` 标签。默认为 `inline`。

`markup`
: （`string`）为所提供的标记语言指定一个[标记语言标识符][]。默认取前置元数据中的 `markup` 值，若没有则回退到根据页面文件扩展名推导出的值。

### 示例

以块级显示模式把 Markdown 内容渲染为 HTML：

```go-html-template
{{ $opts := dict "display" "block" }}
{{ $s | .RenderString $opts }} → <p>An <em>emphasized</em> word</p>
```

以块级显示模式把 [Pandoc][] 内容渲染为 HTML：

```go-html-template
{{ $s := "H~2~O" }}

{{ $opts := dict "markup" "pandoc" "display" "block" }}
{{ $s | .RenderString $opts }} → H<sub>2</sub>O
```

## 完整示例：inline 与 block

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
{{ $s := "An *emphasized* word" }}
<p>默认（inline）：{{ $s | .RenderString }}</p>
<p>block：{{ $s | .RenderString (dict "display" "block") }}</p>
```

实测（Hugo 0.167.0）渲染结果：

```html
<p>默认（inline）：An <em>emphasized</em> word</p>
<p>block：<p>An <em>emphasized</em> word</p></p>
```

**你应当看到什么**：默认 `inline` **不**产生 `<p>`，适合塞进标题、按钮、行内位置；`display = "block"` 会带上 `<p>`（上例里因此出现了 `<p>` 套 `<p>` 的嵌套——把 block 结果单独放，别塞进另一个 `<p>` 里）。

`markup` 选项用于「字符串不是 Markdown」的场合（如 Pandoc），本站未安装 Pandoc，故不列实测输出。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 默认（`inline`） | 不含外层 `<p>`（实测 `An <em>emphasized</em> word`） | 否 |
| `display = "block"` | 含 `<p>`（实测 `<p>An <em>emphasized</em> word</p>`） | 否 |
| 含 HTML 标签的字符串 | 按 Markdown 规则处理；是否保留取决于 `markup.goldmark.renderer.unsafe` 配置 | 否 |
| 空字符串 | 返回空（无输出） | 否 |
| `markup` 指定为未启用的格式（如 pandoc） | 上游示例如此；本站未安装 Pandoc，故不列输出 | 可能报错 |
| 返回类型 | `template.HTML`（输出不转义） | 否 |

> [!NOTE]
> 参数顺序是 `[OPTIONS] MARKUP`——`MARKUP` 是**最后一个**参数。管道写法 `{{ $s | .RenderString $opts }}` 正好把 `$s` 放到最后，所以两种写法都对：`{{ .RenderString $opts $s }}` 与 `{{ $s | .RenderString $opts }}`。

更多排查入口见[故障排查](/troubleshooting/)。

[Pandoc]: /content-management/formats/#pandoc
[markup identifier]: /content-management/formats/#classification
