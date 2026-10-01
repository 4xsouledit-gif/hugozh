+++
title = "Inner"
linkTitle = "Inner"
description = "返回短代码开始标签与结束标签之间的内容，适用于短代码调用包含结束标签的情况。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/shortcode/inner/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Inner"]
returnType = "template.HTML"
+++

这段内容：

```md {file="content/services.md"}
{{</* card title="Product Design" */>}}
We design the **best** widgets in the world.
{{</* /card */>}}
```

配上这个短代码：

```go-html-template {file="layouts/_shortcodes/card.html"}
<div class="card">
  {{ with .Get "title" }}
    <div class="card-title">{{ . }}</div>
  {{ end }}
  <div class="card-content">
    {{ .Inner | strings.TrimSpace }}
  </div>
</div>
```

渲染结果为：

```html
<div class="card">
  <div class="card-title">Product Design</div>
  <div class="card-content">
    We design the **best** widgets in the world.
  </div>
</div>
```

> [!NOTE]
> 短代码开始标签与结束标签之间的内容可能带有开头和/或结尾换行符，具体取决于它在 Markdown 中的位置。请如上所示使用 [`strings.TrimSpace`][] 函数移除回车符和换行符。

> [!NOTE]
> 在上面的示例中，`Inner` 返回的值是 Markdown，但它被当作纯文本渲染了。要把 Markdown 渲染为 HTML，请使用下面任意一种做法。

## 使用 RenderString

让我们修改上面的示例，把 `Inner` 返回的值传给 `Page` 对象上的 [`RenderString`][] 方法：

```go-html-template {file="layouts/_shortcodes/card.html"}
<div class="card">
  {{ with .Get "title" }}
    <div class="card-title">{{ . }}</div>
  {{ end }}
  <div class="card-content">
    {{ .Inner | strings.TrimSpace | .Page.RenderString }}
  </div>
</div>
```

Hugo 渲染结果为：

```html
<div class="card">
  <div class="card-title">Product design</div>
  <div class="card-content">
    We produce the <strong>best</strong> widgets in the world.
  </div>
</div>
```

你也可以用 [`markdownify`][] 函数代替 `RenderString` 方法，但后者的灵活性更好。详见[说明][]。

## 另一种记法

除了用 `{{</* */>}}` 记法调用短代码，还可以使用 `{{%/* */%}}` 记法：

```md {file="content/services.md"}
{{%/* card title="Product Design" */%}}
We design the **best** widgets in the world.
{{%/* /card */%}}
```

使用 `{{%/* */%}}` 记法时，Hugo 会把整个短代码当作 Markdown 渲染，因此需要做如下修改。

首先，配置渲染器，允许在 Markdown 中使用原始 HTML：

```toml
[markup.goldmark.renderer]
unsafe = true
```

如果内容是_你_自己控制的，这个配置并不危险。更多内容请阅读 Hugo 的[安全模型][]。

其次，由于我们把整个短代码当作 Markdown 渲染，就必须遵守 [CommonMark][] 规范中关于[缩进][]和[原始 HTML 块][]的规则。

```go-html-template {file="layouts/_shortcodes/card.html"}
<div class="card">
  {{ with .Get "title" }}
  <div class="card-title">{{ . }}</div>
  {{ end }}
  <div class="card-content">

  {{ .Inner | strings.TrimSpace }}
  </div>
</div>
```

它与前面示例的差别很细微，但却是必需的。注意缩进的变化、空行的增加，以及 `RenderString` 方法的移除。

```diff
--- layouts/_shortcodes/a.html
+++ layouts/_shortcodes/b.html
@@ -1,8 +1,9 @@
 <div class="card">
   {{ with .Get "title" }}
-    <div class="card-title">{{ . }}</div>
+  <div class="card-title">{{ . }}</div>
   {{ end }}
   <div class="card-content">
-    {{ .Inner | strings.TrimSpace | .Page.RenderString }}
+
+  {{ .Inner | strings.TrimSpace }}
   </div>
 </div>
```

> [!NOTE]
> 使用 [Markdown 记法][]调用短代码时，不要用 `RenderString` 或 `markdownify` 处理 `Inner` 的值。

[CommonMark]: https://spec.commonmark.org/current/
[Markdown 记法]: /content-management/shortcodes/#notation
[`RenderString`]: /methods/page/renderstring/
[`markdownify`]: /functions/transform/markdownify/
[`strings.TrimSpace`]: /functions/strings/trimspace/
[说明]: /methods/page/renderstring/
[缩进]: https://spec.commonmark.org/current/#indented-code-blocks
[原始 HTML 块]: https://spec.commonmark.org/current/#html-blocks
[安全模型]: /about/security/
