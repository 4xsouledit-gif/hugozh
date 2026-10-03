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

## 这一页解决什么问题

带结束标签的短代码（`{{</* card */>}}…{{</* /card */>}}`）需要把「标签之间的那一段内容」取出来再加工——包一层 `<div>`、加标题、决定是否按 Markdown 渲染。`Inner` 返回的就是这段内容。

它最容易让人困惑的地方是：**同一段内容，用 `{{</* */>}}` 调用和用 `{{%/* */%}}` 调用，`.Inner` 拿到的都是「原始 Markdown 文本」；差别在于 Markdown 记法下短代码的**输出**还会被 Markdown 渲染器再处理一遍**。把这一点想成「Markdown 记法下 `.Inner` 已经是 HTML」，页面就会显示一堆 `**星号**`，或者出现双重转义。这一页把两种记法下的取值、以及要不要 `TrimSpace`/`RenderString` 讲清楚，实测依据见文末「返回值边界」。

> [!IMPORTANT]
> **实测更正（Hugo 0.167.0，Windows，最小站点）**：`.Inner` 在两种记法下都是**未渲染的原文**。测法很简单——模板写成 `<pre>[{{ .Inner }}]</pre>`，两种记法各调用一次，产出的 `<pre>` 里显示的都是同一行原始 Markdown（`We design the **best** widgets in the world.`）。
>
> 那为什么 Markdown 记法「看起来」渲染了？因为博客/文档里常见的模板都是把 `.Inner` 直接输出，而 Markdown 记法的输出之后还会过一遍 Markdown 渲染器。**只有输出这一层被渲染，`.Inner` 本身始终是原文**。这一点直接影响下面的写法选择：Markdown 记法下不要再套 `RenderString`（会渲染两遍），标准记法下则必须套。

## 什么时候用，什么时候别用

**该用**：

- 短代码是「包裹型」的：卡片、提示框、折叠面板、画廊，需要拿到内部内容；
- 需要决定内部内容的渲染方式（纯文本转义 / Markdown 转 HTML / 原样输出）；
- 想把内部内容拆开处理（例如按行遍历）。

**别用**：

- 短代码是自闭合的（`{{</* img src="…" */>}}`）→ 它没有内部内容，`.Inner` 是空字符串；
- 只想取**参数** → 用 [`Get`](/methods/shortcode/get/) / [`Params`](/methods/shortcode/params/)；
- 内部内容被缩进过、又想按 Markdown 渲染 → 先用 [`InnerDeindent`](/methods/shortcode/innerdeindent/) 去掉缩进，否则会被当成代码块。

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

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

模板 `layouts/_shortcodes/card.html`：

```go-html-template {file="layouts/_shortcodes/card.html"}
<div class="card">
  {{ with .Get "title" }}<div class="card-title">{{ . }}</div>{{ end }}
  <div class="card-content">{{ .Inner | strings.TrimSpace | .Page.RenderString }}</div>
</div>
```

内容 `content/services.md`：

```md {file="content/services.md"}
{{</* card title="Product Design" */>}}
We design the **best** widgets in the world.
{{</* /card */>}}
```

Hugo 渲染为：

```html
<div class="card">
  <div class="card-title">Product Design</div>
  <div class="card-content">We design the <strong>best</strong> widgets in the world.</div>
</div>
```

**你应当看到什么**：`**best**` 变成了 `<strong>best</strong>`，说明 `Inner` 返回的是 **Markdown 原文**，需要 `RenderString` 才会变成 HTML。这一步很容易验证——把 `.Page.RenderString` 去掉，页面里就会原样显示 `**best**`（上游「示例」一节的渲染结果正是如此）。

改用 Markdown 记法后，情况看起来反过来：

```md {file="content/services.md"}
{{%/* card title="Product Design" */%}}
We design the **best** widgets in the world.
{{%/* /card */%}}
```

此时**页面上的输出**是渲染过的 HTML。实测在 `layouts/_shortcodes/sccardmd.html` 中直接输出 `.Inner` 得到：

```html
<p>We design the <strong>best</strong> widgets in the world.</p>
```

注意这里有个容易误读的地方：`<p>` 与 `<strong>` **不是 `.Inner` 的内容**，而是「短代码输出之后再过一遍 Markdown 渲染器」的结果。对照证据见文末「返回值边界」表——同一个模板换成 `<pre>` 包住 `.Inner`，两种记法显示的都是原始 Markdown。

所以 [Markdown 记法][]下**不要**再套 `RenderString`（那会把内容渲染两遍）；标准记法下**必须**套（否则星号就是星号）。上游「另一种记法」一节还给出了配套的缩进/空行写法，以及需要 `unsafe = true` 的原因。本站短代码章节的「[跑一遍：同一段内容，两种记法](/shortcodes/#跑一遍同一段内容两种记法)」一节把这两种记法的真实产物并排放在页面上，可以直接看。

自闭合调用没有内部内容，实测 `.Inner` 为空字符串、不报错：

```text
有开始标签、没有结束标签 → 构建在解析阶段就失败（见下）
自闭合写法（在 > 之前加 /）→ .Inner 为空字符串
```

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{</* */>}}` 记法 + 结束标签 | **原始 Markdown 文本**，含开头/结尾换行（实测 `\nWe design the **best** widgets…\n`） | 否 |
| 同上，经过 `strings.TrimSpace` | 去掉首尾空白后的 Markdown | 否 |
| 同上，再经过 `.Page.RenderString` | 渲染后的 HTML（实测 `<strong>best</strong>`） | 否 |
| `{{%/* */%}}` 记法 | `.Inner` 同样是**原始 Markdown 文本**（实测：把 `.Inner` 包进 `<pre>` 打印，两种记法逐字相同）；区别在**输出**——Markdown 记法下短代码输出之后还会过一遍 Markdown 渲染器，所以「把 `.Inner` 原样输出」的模板得到 `<p>We design the <strong>best</strong> widgets in the world.</p>` | 否 |
| 自闭合写法（在 `>` 之前加 `/`） | 空字符串 | 否 |
| 有开始标签但没有结束标签 | —— | 是：`failed to extract shortcode: shortcode "x" must be closed or self-closed` |
| 返回类型 | `template.HTML`（所以直接输出不会被转义） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上显示 `**best**` 字面量 | `{{</* */>}}` 记法下 `Inner` 是 Markdown，没渲染 | 用 `.Page.RenderString` 或 `markdownify` |
| 没报错但结果不对 | Markdown 记法下 HTML 标签被显示出来 | 已经渲染过，又套了一次 `RenderString`/`markdownify` | Markdown 记法下直接输出 `.Inner` |
| 没报错但结果不对 | 输出里多出空白行 | `Inner` 带首尾换行 | `strings.TrimSpace` |
| 构建失败 | `shortcode "x" must be closed or self-closed` | 有开始标签、没写结束标签 | 补上 `{{</* /x */>}}`，或把调用改成自闭合写法（在 `>` 之前加 `/`） |
| 没报错但结果不对 | 内部 Markdown 变成了代码块 | 内容被缩进（CommonMark 的缩进代码块） | 见 [`InnerDeindent`](/methods/shortcode/innerdeindent/) |

更多排查入口见[故障排查](/troubleshooting/)。

[CommonMark]: https://spec.commonmark.org/current/
[Markdown 记法]: /shortcodes/
[`RenderString`]: /methods/page/renderstring/
[`markdownify`]: /functions/transform/markdownify/
[`strings.TrimSpace`]: /functions/strings/trimspace/
[说明]: /methods/page/renderstring/
[缩进]: https://spec.commonmark.org/current/#indented-code-blocks
[原始 HTML 块]: https://spec.commonmark.org/current/#html-blocks
[安全模型]: /about/security/
