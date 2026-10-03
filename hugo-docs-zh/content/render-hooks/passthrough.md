+++
title = "原样透传"
linkTitle = "原样透传"
description = "创建透传渲染钩子，处理 Goldmark 透传扩展捕获的文本片段，并在构建时用 KaTeX 渲染数学公式。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/render-hooks/passthrough/"

[params.teach]
difficulty = "进阶"
time = "20–30 分钟"
prereq = [
  "读过[简介](/render-hooks/introduction/)，知道钩子模板要放在 `layouts/_markup/`、文件名怎么取。",
  "站点配置里已开启 Goldmark 的 Passthrough 扩展（本页「概述」一节给出配置）。",
  "知道站点的基础模板是哪一个文件——最后一步要在那里加一段 `head` 内容。",
]
outcomes = [
  "说清透传元素为什么需要单独的钩子，以及不写钩子时页面会发生什么；",
  "写出一个在构建时用 KaTeX 渲染公式的 `render-passthrough.html`，并只在需要时加载 KaTeX 样式；",
  "看懂公式渲染失败时那条长长的报错，知道该回到哪里改；",
  "解释基础模板里那句「空操作」语句为什么不能删。",
]
next = ["/content-management/mathematics/", "/functions/transform/tomath/", "/render-hooks/introduction/"]

+++

## 概述

Hugo 使用 [Goldmark](https://github.com/yuin/goldmark) 把 Markdown 渲染为 HTML。Goldmark 支持通过自定义扩展来扩展核心功能。[Passthrough](https://gohugo.io/configuration/markup/) 扩展会捕获并保留被定界符包围的原始 Markdown 文本片段，连定界符本身也一并保留。这类片段称为**透传元素**（passthrough element）。

取决于所选用的定界符，Hugo 会把透传元素归类为**块级**（block）或**行内**（inline）。看下面这个刻意构造的例子：

```md
This is a

\[block\]

passthrough element with opening and closing block delimiters.

This is an \(inline\) passthrough element with opening and closing inline delimiters.
```

需要在项目配置中启用 Passthrough 扩展，并为每种透传元素类型（`block` 或 `inline`）定义起始与结束定界符。例如：

```toml
[markup.goldmark.extensions.passthrough]
enable = true
[markup.goldmark.extensions.passthrough.delimiters]
block = [['\[', '\]'], ['$$', '$$']]
inline = [['\(', '\)']]
```

上例为 `block` 定义了两组定界符，在 Markdown 中使用其中任意一组都可以。

实测（Hugo 0.167，本站）：本站 `hugo.toml` 里的配置与上面这段**完全一致**——`enable = true`，`block` 为 `\[…\]` 与 `$$…$$`，`inline` 为 `\(…\)`。所以本站的 Markdown 里写公式不会报错，也不会被当成普通文本处理。

Passthrough 扩展常与 MathJax 或 KaTeX 显示引擎搭配使用，用来渲染以 LaTeX 标记语言书写的[数学表达式](/content-management/mathematics/)。

要启用透传元素的自定义渲染，需创建透传渲染钩子。

**不写钩子会怎样？** 透传元素会被**连同定界符一起**原样写进 HTML。如果页面里同时挂了 MathJax／KaTeX 之类的客户端渲染器，它会识别这些定界符并当场渲染——这是「不写钩子」也能显示公式的原因。但如果页面**没有**挂任何客户端渲染器，读者看到的就是字面的一串 `$$E = mc^2$$`：

- 这不是报错，构建完全成功；
- 页面上也「有内容」，只是内容是公式源码本身；
- 实测（Hugo 0.167，本站）：本站目前既没有透传渲染钩子，也没有引入 KaTeX／MathJax，因此本站页面上的公式会按字面显示——本页下面的示例就是把它修好的做法。

两者的取舍很清楚：**客户端渲染**不增加构建时间、公式可以交互缩放，但有短暂闪烁、依赖外网 CDN、而且搜索引擎读到的仍是源码；**构建时渲染**（本页示例）产出纯 HTML，没有闪烁、利于索引，代价是构建变慢、需要引入 KaTeX 的样式表。

## 上下文

透传**渲染钩子**模板接收以下上下文：

`Attributes`
: （`map`）[Markdown 属性](/content-management/markdown-attributes/)，需要按下面的方式配置站点后才可用：

  ```toml
  [markup.goldmark.parser.attribute]
  block = true
  ```

  Hugo 只为**块级**透传元素填充 `Attributes` 映射；Markdown 属性不适用于**行内**元素。

`Inner`
: （`string`）透传元素的内层内容，不含定界符。

`Ordinal`
: （`int`）透传元素在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`Position`
: （`string`）透传元素在页面内容中的位置。

`Type`
: （`string`）透传元素类型，取值为 `block` 或 `inline`。

`.Inner` **不含定界符**：`$$E = mc^2$$` 传进模板的 `.Inner` 是 `E = mc^2`。这一点很关键——`transform.ToMath` 需要的是公式本身，不是带定界符的原文；如果自己再手动去掉 `$$`，反而会把公式弄坏。

`.Position` 是普通字符串，用于把「哪个公式出错了」写进报错消息里（见下面的示例）。

## 示例

与其在浏览器端用 MathJax 或 KaTeX 通过 JavaScript 渲染数学标记，不如创建一个透传渲染钩子，在构建时调用 `transform.ToMath` 函数完成渲染：

```go-html-template {file="layouts/_markup/render-passthrough.html"}
{{- $opts := dict "output" "htmlAndMathml" "displayMode" (eq .Type "block") }}
{{- with try (transform.ToMath .Inner $opts) }}
  {{- with .Err }}
    {{- errorf "Unable to render mathematical markup to HTML using the transform.ToMath function. The KaTeX display engine threw the following error: %s: see %s." . $.Position }}
  {{- else }}
    {{- .Value }}
    {{- $.Page.Store.Set "hasMath" true }}
  {{- end }}
{{- end -}}
```

随后在**基础**模板中，按条件在 `head` 元素内引入 KaTeX 的 CSS：

```go-html-template {file="layouts/baseof.html"}
<head>
  {{ $noop := .WordCount }}
  {{ if .Page.Store.Get "hasMath" }}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css" integrity="sha384-u1zONI5gPXUx0UKI62c75/zww972y0v2rSK5ZYlVdS6xEuWDeZWUI66v6t1gvlXJ" crossorigin="anonymous">
  {{ end }}
</head>
```

上面的写法用了一个空操作（noop）语句，强制先完成内容渲染，再用 `Store.Get` 方法检查 `hasMath` 的值。

这段示例有四处理解了才不容易写错：

1. **`displayMode` 从哪里来。** `(eq .Type "block")` 把「块级透传元素」映射成「独立成行的公式」。块级公式居中单独占一行，行内公式跟着文字走——这正是 `Type` 的用途。
2. **为什么要用 `try`。** 公式写错时 `transform.ToMath` 会返回错误而不是让构建崩掉。`try` 把结果包成一个对象：`.Err` 有值表示失败，否则从 `.Value` 取渲染结果。**没有 `try` 就直接取结果，一旦公式写错，报错会指向 Hugo 内部而不是你的内容**，这就是「报错看不懂」的典型来源。
3. **为什么报错里要带 `$.Position`。** 自己写的 `errorf` 会把公式的源文件位置附在消息末尾，读者据此能直接回到那一行——注意在 `with` 块内要写 `$.Position` 才能取到外层上下文。
4. **`$noop := .WordCount` 为什么不能删。** 钩子是在渲染页面**内容**的过程中执行的，而 `head` 属于更外层的基础模板，执行更早，那时 `hasMath` 还没被设置。文档列出会触发内容渲染的方法有 `Content`、`ContentWithoutSummary`、`FuzzyWordCount`、`Len`、`Plain`、`PlainWords`、`ReadingTime`、`Summary`、`Truncated`、`WordCount`，这里借 `WordCount` 把内容渲染「提前拉起来」。相关讨论见[页面的 Store 里为什么缺少某个值](/troubleshooting/faq/#页面的-store-里为什么缺少某个值)。

尽管可以像上面那样用一个模板加条件逻辑处理，也可以为每种透传元素 `Type` 创建单独的模板：

```tree
layouts/
  └── _markup/
      ├── render-passthrough-block.html
      └── render-passthrough-inline.html
```

### 本站实际渲染效果

下面这一行里有一个**真的写在正文里**的行内公式（不是代码块里的示意）：勾股定理 \(a^2+b^2=c^2\) 就是这种形状。

再下面是**真的写在正文里**的块级公式，它单独成段：

$$\int_0^1 x^2\,dx = \frac{1}{3}$$

本站 `hugo.toml` 开着 Passthrough 扩展（`enable = true`，`block = [['\[','\]'],['$$','$$']]`、`inline = [['\(','\)']]`），但**没有加载任何数学渲染器**：`themes/hugo-docs-theme/layouts/_markup/` 下没有 `render-passthrough.html`，主题里也搜不到 KaTeX／MathJax 的 `<script>` 或 `<link>`。所以你此刻在页面上看到的就是**原样的 TeX 文本**——定界符一个字符都没少。

实测（Hugo 0.167.0 extended，本站：站点构建（`hugo --ignoreCache`）后读 `public/render-hooks/passthrough/index.html`）这两段在产物里的形态是：

```html
<p>下面这一行里……勾股定理 \(a^2+b^2=c^2\) 就是这种形状。</p>
<p>再下面是<strong>真的写在正文里</strong>的块级公式，它单独成段：</p>
$$\int_0^1 x^2\,dx = \frac{1}{3}$$<p>本站 <code>hugo.toml</code> 开着……
```

三条结论要分开看：

- **这是「Passthrough 扩展生效」的证据**：`_` 在普通 Markdown 里是强调的定界符，`\` 是转义符——但被定界符包住之后，Goldmark 把整段当原始文本透传，下标 `_0`、`\,`、`\frac` 连同反斜杠一个字符都没被改写。
- **这也是「没有渲染器」的证据**：行内公式仍然躺在 `<p>` 里，块级公式是**裸的文本节点**——它外面没有 `<p>`，紧跟其后的才是下一段的段落标签。产物里找不到任何指向 KaTeX／MathJax 的 `<script src>` 或 `<link href …>`（本页出现的 `katex` 字样全部来自正文说明与代码示例本身）。要真正显示成公式，得由站点自己引入 MathJax／KaTeX：构建时渲染见上面的「示例」，客户端渲染则是在 `head` 里挂脚本。
- **别把「没被 Markdown 破坏」当成「已经渲染成公式」**：内容完好只是透传的功劳，页面上仍是 TeX 源码。要不要往前走一步（引入渲染器、承担依赖与构建时间），是站点自己的取舍，见本页「什么时候用，什么时候别用」。

## 什么时候用，什么时候别用

**该用**：

- 想在构建时把 LaTeX 公式渲染成纯 HTML／MathML，避免客户端闪烁；
- 站点已经有大量公式，希望搜索引擎与摘要能读到渲染结果；
- 想给行内公式与块级公式分别套不同的容器。

**别用**：

- 公式很少、又不想引入 KaTeX 依赖——直接在页面里挂 MathJax 客户端渲染更省事；
- 不是公式的场景（代码、图表）却想借透传元素「绕开 Markdown 处理」——那通常说明该用[代码块钩子](/render-hooks/code-blocks/)或短代码；
- 站点配置里还**没有**开启 Passthrough 扩展——`\[ … \]` 会被当成普通的转义方括号，钩子根本不会被触发。

## 验证与常见坑

**验证方法**：写一段含公式的内容（行内与块级各一个），构建后检查产出的 HTML 里公式是不是已经变成了 `katex` 结构。

```bash
hugo --ignoreCache --destination tmp-out
```

```bash
# Linux / macOS
grep -c 'katex' tmp-out/posts/example/index.html
```

```powershell
# Windows PowerShell
(Select-String -Path tmp-out\posts\example\index.html -Pattern 'katex' -AllMatches).Matches.Count
```

**你应当看到什么**：

- 页面里出现了 `katex` 相关的元素与类名，**看不到** `$$`、`\(` 这些定界符；
- 页面 `<head>` 里出现了 KaTeX 的 `<link rel="stylesheet" …>`（说明 `hasMath` 被正确读到）；
- 行内公式跟着文字、块级公式单独居中成行。

若公式渲染出来了但样式很丑（字形错位、字体很大），通常是 `head` 里那段样式表没被输出——回到第 4 点检查那句 noop 语句还在不在。

三类典型问题：

| 类别 | 现象 | 原因与修法 |
| --- | --- | --- |
| 钩子没生效 | 没有报错，页面上就是字面的 `$$E = mc^2$$` | ① 文件名或位置不对，看[简介的排查表](/render-hooks/introduction/#配错时的典型报错与常见坑)；② 站点没开 Passthrough 扩展，透传元素从未产生，钩子自然不会被调用 |
| 没报错但结果不对 | 公式渲染出来了，但没有样式 | `hasMath` 没被读到：noop 语句被删了，或判断写在了内容渲染之前 |
| 没报错但结果不对 | 行内公式变成了独立成行 | `displayMode` 的判断写反了，应为 `(eq .Type "block")` |
| 报错看不懂 | 一条很长的英文报错，前面是你自己写的那句，后面跟着 KaTeX 的错误 | 公式本身写错了。**只读最后那两段**：KaTeX 的原始错误说明哪里不对，`see <位置>` 指向源文件与行号 |
| 报错看不懂 | 报错指向 Hugo 内部，看不出和内容有关 | 忘了用 `try` 包裹 `transform.ToMath`，公式错误被直接抛了出来 |

更多相关问题见[故障排查](/troubleshooting/)，公式写法本身见[数学公式](/content-management/mathematics/)。

## PageInner details

`PageInner` 的主要用途是相对于被包含的页面来解析链接与页面资源。例如可以创建一个「包含」短代码，用多个内容文件拼装一个页面，同时为脚注与目录保留全局上下文：先用位置参数取出要包含的页面逻辑路径，再调用该页面的 [`RenderShortcodes`](/methods/page/rendershortcodes/) 方法，取不到页面时用 `errorf` 报错。

```go-html-template {file="layouts/_shortcodes/include.html"}
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

然后在 Markdown 中用 Markdown 记法调用这个短代码，被包含页面的路径写在位置参数里。

```md {file="content/posts/post-1.md"}
{{%/* include "/posts/post-2" */%}}
```

渲染 `/posts/post-2` 时触发的任何渲染钩子，调用 `Page` 会得到 `/posts/post-1`，调用 `PageInner` 则会得到 `/posts/post-2`。

`PageInner` 在不适用时会回退为 `Page` 的值，并且始终有返回值。它只对调用 `RenderShortcodes` 方法的短代码有意义，并且必须以 Markdown 记法调用该短代码。
