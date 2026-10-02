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

## 这一页解决什么问题

当短代码被写在**缩进环境**里（最典型的是列表项内部，或任何前面有四个空格的 Markdown 位置），标签之间的内容会带着那些空格。CommonMark 规定「行首四个空格」是缩进代码块，于是本来想渲染成图片、段落的 Markdown，会被原样显示成一段代码。

`InnerDeindent` 与 [`Inner`](/methods/shortcode/inner/) 的唯一区别就是：**它会先把内容前面的缩进去掉**，让 Markdown 按原意渲染。

## 什么时候用，什么时候别用

**该用**：

- 短代码写在列表项、引用块等缩进位置里；
- 内容里的缩进是「排版缩进」，不应该影响 Markdown 解析；
- 你希望内容按**块级** Markdown（段落、列表、图片）渲染。

**别用**：

- 内容本身就有**有意义的缩进**（要保留代码示例的缩进）→ 用 [`Inner`](/methods/shortcode/inner/)，让它保持原样；
- 只是想去掉首尾换行 → `strings.TrimSpace` 就够，不必 `InnerDeindent`；
- 内容里根本没有缩进 → 两者结果相同。

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

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。内容与上游示例同构——短代码写在列表项里，标签之间的内容缩进四个空格：

```md {file="content/about.md"}
- Gallery one

    {{</* gallery */>}}
    ![kitten a](thumbnails/a.jpg)
    ![kitten b](thumbnails/b.jpg)
    {{</* /gallery */>}}
```

用一个把四种写法都打印出来的模板 `layouts/_shortcodes/gallery.html`：

```go-html-template {file="layouts/_shortcodes/gallery.html"}
INNER-BEGIN
{{ .Inner }}
INNER-END
DEINDENT-BEGIN
{{ .InnerDeindent }}
DEINDENT-END
RENDER-INNER-BEGIN
{{ .Inner | .Page.RenderString }}
RENDER-INNER-END
RENDER-DEINDENT-BEGIN
{{ .InnerDeindent | .Page.RenderString }}
RENDER-DEINDENT-END
```

Hugo 渲染为（实测，取最相关的部分）：

```html
INNER-BEGIN

    ![kitten a](thumbnails/a.jpg)
    ![kitten b](thumbnails/b.jpg)
    
INNER-END
DEINDENT-BEGIN

![kitten a](thumbnails/a.jpg)
![kitten b](thumbnails/b.jpg)

DEINDENT-END
RENDER-INNER-BEGIN
<pre><code>![kitten a](thumbnails/a.jpg)
![kitten b](thumbnails/b.jpg)
</code></pre>
RENDER-INNER-END
RENDER-DEINDENT-BEGIN
<img src="thumbnails/a.jpg" alt="kitten a">
<img src="thumbnails/b.jpg" alt="kitten b">
RENDER-DEINDENT-END
```

**你应当看到什么**：`.Inner` 保留了每行前面的四个空格，`.InnerDeindent` 把它们去掉了；因此**不加 `TrimSpace` 直接交给 `RenderString`** 时，前者变成 `<pre><code>` 代码块，后者才是 `<img>`——这正是上游示例要说明的差别。

> [!IMPORTANT]
> 本站实测到一个与上游示例写法有关的细节：如果先做 `strings.TrimSpace` 再 `RenderString`（上游示例的写法），**两种方法在这个例子里输出相同**，都得到 `<img>`。原因是 `TrimSpace` 会去掉第一行开头的缩进，CommonMark 随后把后面的行视为段落的续行。所以：
>
> - 想复现上游「`Inner` 变代码块」的效果，就**不要**先 `TrimSpace`；
> - 若内容已缩进、又只想去掉首尾空行，用 `InnerDeindent | strings.TrimSpace` 更稳。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 内容缩进四个空格 | `.Inner` 保留缩进；`.InnerDeindent` 去掉缩进 | 否 |
| 上述内容直接 `RenderString`（不 TrimSpace） | `.Inner` → `<pre><code>…`；`.InnerDeindent` → `<img>…` | 否 |
| 上述内容先 `TrimSpace` 再 `RenderString` | 两者输出相同（实测都得到 `<img>`） | 否 |
| 内容没有缩进 | 两者结果相同 | 否 |
| 自闭合调用（无内部内容） | 空字符串（与 [`Inner`](/methods/shortcode/inner/) 一致） | 否 |
| 返回类型 | `template.HTML` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 列表项里的图片被显示成一串 Markdown 代码 | 内容带缩进，被当成缩进代码块 | 改用 `.InnerDeindent` |
| 没报错但结果不对 | 换了 `InnerDeindent` 还是代码块 | 又调用了 `RenderString` 之前/之后顺序不对，或缩进来自别处 | 用本页四段对照法逐步定位 |
| 没报错但结果不对 | 代码示例的缩进丢了 | `InnerDeindent` 的语义就是移除缩进 | 需要保留缩进的内容改用 `.Inner` |
| 没报错但结果不对 | 以为 `InnerDeindent` 能去掉首尾空行 | 它只处理行首缩进，不裁首尾空白 | 再套一层 `strings.TrimSpace` |

更多排查入口见[故障排查](/troubleshooting/)。

[CommonMark]: https://spec.commonmark.org/current/#indented-code-blocks
[`Inner`]: /methods/shortcode/inner/
