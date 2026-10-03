+++
title = "RenderShortcodes"
linkTitle = "RenderShortcodes"
description = "返回给定页面的内容，其中所有短代码都已渲染，同时保留其周围的标记。"
date = 2026-10-02
weight = 690
source = "https://gohugo.io/methods/page/rendershortcodes/"

[params.functions_and_methods]
signatures = ["PAGE.RenderShortcodes"]
returnType = "template.HTML"
+++

## 这一页解决什么问题

「把另一个内容文件包含进来」是文档站的常见需求（例如把 `/snippets/services` 的 Markdown 拼进 `/about`）。直接用 `.Content` 会把内容**完全渲染成 HTML**，再嵌进外层 Markdown 就会出现「HTML 里再套 Markdown」的问题。

`.RenderShortcodes` 给出的正是中间态：**短代码已渲染，周围的 Markdown 标记原样保留**。因此它通常写在短代码模板里，用于「包含 Markdown 片段」，并让脚注、目录等全局上下文保持连续。

## 什么时候用，什么时候别用

**该用**：

- 写 `include` 类短代码，把多个 Markdown 文件组装成一个页面；
- 想让被包含内容里的短代码正常渲染，同时保留其 Markdown（以便外层再统一渲染）；
- 需要在保留 Markdown 的前提下触发短代码（例如 `ref`、图表类短代码）。

**别用**：

- 想要渲染后的 HTML → 用 [`.Content`](/methods/page/content/)；
- 想要**完全未处理**的原文（短代码也不渲染）→ 用 [`.RawContent`](/methods/page/rawcontent/)；
- 想把字符串渲染成 HTML → 用 [`.RenderString`](/methods/page/renderstring/)；
- 在 Markdown 里的 `HTML` 块内使用 → 会产生上游提到的警告（见「限制」）。

## 用法

在_短代码_模板中使用该方法，可以从多个内容文件组合出一个页面，同时为脚注和目录保留全局上下文。

例如：

```go-html-template {file="layouts/_shortcodes/include.html" copy=true}
{{ with .Get 0 }}
  {{ with $.Page.GetPage . }}
    {{- .RenderShortcodes }}
  {{ else }}
    {{ errorf "The %q shortcode was unable to find %q. See %s" $.Name . $.Position }}
  {{ end }}
{{ else }}
  {{ errorf "The %q shortcode requires a positional parameter indicating the logical path of the file to include. See %s" .Name .Position }}
{{ end }}
```

然后在你的 Markdown 中调用该短代码：

```md {file="content/about.md"}
{{%/* include "/snippets/services" */%}}
{{%/* include "/snippets/values" */%}}
{{%/* include "/snippets/leadership" */%}}
```

每个被包含的 Markdown 文件都可以包含对其他短代码的调用。

### 短代码记法

在上例中，理解调用短代码时所用两种定界符的区别很重要：

- `{{</* myshortcode */>}}` 告诉 Hugo，渲染后的短代码不需要进一步处理。例如，短代码的内容是 HTML。
- `{{%/* myshortcode */%}}` 告诉 Hugo，渲染后的短代码需要进一步处理。例如，短代码的内容是 Markdown。

对于上面描述的 “include” 短代码，请使用后者。

### 进一步说明

要理解 `RenderShortcodes` 方法返回什么，请看这个内容文件

```md {file="content/about.md"}
+++
title = 'About'
date = 2023-10-07T12:28:33-07:00
+++

{{</* ref "privacy" */>}}

An *emphasized* word.
```

配合这段模板代码：

```go-html-template
{{ $p := site.GetPage "/about" }}
{{ $p.RenderShortcodes }}
```

Hugo 渲染出：;

```html
https://example.org/privacy/

An *emphasized* word.
```

注意内容文件中的短代码被渲染了，而周围的 Markdown 被保留了下来。

### 限制

`.RenderShortcodes` 的主要用途是包含 Markdown 内容。如果你在 Markdown 中的 `HTML` 块里使用 `.RenderShortcodes`，会收到类似这样的警告：

```text
WARN .RenderShortcodes detected inside HTML block in "/content/mypost.md"; this may not be what you intended ...
```

如果这确实是你想要的效果，可以关闭上述警告。

## 完整示例：短代码渲染、Markdown 保留

测试站的内容文件 `content/posts/plain-demo.md`：

```md {file="content/posts/plain-demo.md"}
这是**加粗**文字，链接 [文档](/docs/)，实体 &amp; 与 &copy; 混合。

{{</* note */>}}短代码里的内容{{</* /note */>}}

## 小节标题
小节正文。
```

其中 `note` 短代码的模板是 `<div class="note">{{ .Inner | .Page.RenderString }}</div>`。模板：

```go-html-template {file="layouts/_default/single.html"}
<pre>{{ .RenderShortcodes }}</pre>
```

实测（Hugo 0.167.0），`.RenderShortcodes` 的值（控制字符显式写出）：

```text
这是**加粗**文字，链接 [文档](/docs/)，实体 &amp; 与 &copy; 混合。\n\n<div class="note">短代码里的内容</div>\r\n\n\n## 小节标题\n小节正文。\r\n
```

**你应当看到什么**：

- `{{</* note */>}}` 已经被**渲染**成 `<div class="note">短代码里的内容</div>`；
- 而 `**加粗**`、`[文档](/docs/)`、`## 小节标题` 这些 Markdown **没有**被转换成 HTML，仍是原文——这正是「保留周围标记」的含义；
- 对比 [`.RawContent`](/methods/page/rawcontent/)：那里的短代码仍是 `{{</* note */>}}` 调用原文。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 内容里有短代码 | 短代码被渲染（实测 `note` 变成 `<div>`） | 否 |
| 周围的 Markdown | 原样保留（实测 `**`、`[]()`、`##` 都在） | 否 |
| 内容里没有短代码 | 返回值基本等同于 `.RawContent` | 否 |
| 短代码内再调用短代码 | 支持（上游说明：被包含的文件可再含短代码） | 否 |
| 在 Markdown 的 HTML 块里使用 | 输出可能不符合预期，且会有 `WARN .RenderShortcodes detected inside HTML block …`（上游说明） | 否（仅警告） |
| 返回类型 | `template.HTML`（输出时不再转义） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
