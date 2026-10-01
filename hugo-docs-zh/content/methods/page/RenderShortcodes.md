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

## 短代码记法

在上例中，理解调用短代码时所用两种定界符的区别很重要：

- `{{</* myshortcode */>}}` 告诉 Hugo，渲染后的短代码不需要进一步处理。例如，短代码的内容是 HTML。
- `{{%/* myshortcode */%}}` 告诉 Hugo，渲染后的短代码需要进一步处理。例如，短代码的内容是 Markdown。

对于上面描述的 “include” 短代码，请使用后者。

## 进一步说明

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

## 限制

`.RenderShortcodes` 的主要用途是包含 Markdown 内容。如果你在 Markdown 中的 `HTML` 块里使用 `.RenderShortcodes`，会收到类似这样的警告：

```text
WARN .RenderShortcodes detected inside HTML block in "/content/mypost.md"; this may not be what you intended ...
```

如果这确实是你想要的效果，可以关闭上述警告。
