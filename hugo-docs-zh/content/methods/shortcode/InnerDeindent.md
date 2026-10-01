+++
title = "InnerDeindent"
linkTitle = "InnerDeindent"
description = "返回短代码开始标签与结束标签之间的内容，并移除缩进，适用于短代码调用包含结束标签的情况。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/shortcode/innerdeindent/"

[params.functions_and_methods]
signatures = ["SHORTCODE.InnerDeindent"]
returnType = "template.HTML"
+++

与 [`Inner`][] 方法类似，`InnerDeindent` 返回短代码开始标签与结束标签之间的内容。不过，`InnerDeindent` 会移除内容前面的缩进。

这样我们就能有效绕过 [CommonMark][] 规范中关于缩进的规则。

看这段 Markdown，它是一个无序列表，每个列表项里都有一小组缩略图：

```md {file="content/about.md"}
- Gallery one

    {{</* gallery */>}}
    ![kitten a](thumbnails/a.jpg)
    ![kitten b](thumbnails/b.jpg)
    {{</* /gallery */>}}

- Gallery two

    {{</* gallery */>}}
    ![kitten c](thumbnails/c.jpg)
    ![kitten d](thumbnails/d.jpg)
    {{</* /gallery */>}}
```

在上面的示例中可以看到，短代码开始标签与结束标签之间的内容缩进了四个空格。按照 CommonMark 规范，这会被当作缩进代码块处理。

用这个短代码，并调用 `Inner` 而不是 `InnerDeindent`：

```go-html-template {file="layouts/_shortcodes/gallery.html"}
<div class="gallery">
  {{ .Inner | strings.TrimSpace | .Page.RenderString }}
</div>
```

Hugo 把这段 Markdown 渲染为：

```html
<ul>
  <li>
    <p>Gallery one</p>
    <div class="gallery">
      <pre><code>![kitten a](images/a.jpg)
      ![kitten b](images/b.jpg)
      </code></pre>
    </div>
  </li>
  <li>
    <p>Gallery two</p>
    <div class="gallery">
      <pre><code>![kitten c](images/c.jpg)
      ![kitten d](images/d.jpg)
      </code></pre>
    </div>
  </li>
</ul>
```

虽然按 CommonMark 规范来说这完全正确，但并不是我们想要的结果。如果改用 `InnerDeindent` 方法移除缩进：

```go-html-template {file="layouts/_shortcodes/gallery.html"}
<div class="gallery">
  {{ .InnerDeindent | strings.TrimSpace | .Page.RenderString }}
</div>
```

Hugo 把这段 Markdown 渲染为：

```html
<ul>
  <li>
    <p>Gallery one</p>
    <div class="gallery">
      <img src="images/a.jpg" alt="kitten a">
      <img src="images/b.jpg" alt="kitten b">
    </div>
  </li>
  <li>
    <p>Gallery two</p>
    <div class="gallery">
      <img src="images/c.jpg" alt="kitten c">
      <img src="images/d.jpg" alt="kitten d">
    </div>
  </li>
</ul>
```

[CommonMark]: https://spec.commonmark.org/current/#indented-code-blocks
[`Inner`]: /methods/shortcode/inner/
