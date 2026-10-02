+++
title = "代码块"
linkTitle = "代码块"
description = "创建代码块渲染钩子，覆盖围栏代码块的默认高亮输出、按语言定制渲染方式，并让信息字符串里的属性可控。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/render-hooks/code-blocks/"

[params.teach]
difficulty = "进阶"
time = "20–30 分钟"
prereq = [
  "读过[简介](/render-hooks/introduction/)，知道钩子模板要放在 `layouts/_markup/`、文件名怎么取。",
  "能看懂 Go 模板里的 `with`、`merge`、管道与变量赋值（`:=`）。",
  "站点里至少有一个围栏代码块，改完能立刻比对输出。",
]
outcomes = [
  "写出一个与 Hugo 默认行为一致的 `render-codeblock.html`，并知道它和「不写钩子」的差别；",
  "按语言拆分模板（例如只给 `mermaid` 单独渲染），并说清信息字符串里通用属性与高亮选项的区别；",
  "把「这段代码来自哪个文件」显示在代码块上方；",
  "在构建时渲染 Mermaid 图表，并知道为什么脚本要放在基础模板末尾。",
]
next = ["/content-management/diagrams/", "/render-hooks/blockquotes/", "/functions/transform/highlightcodeblock/"]

+++

## Markdown 中的代码块

下面这段 Markdown 含有一个围栏代码块：

````md {file="content/example.md"}
```sh {class="my-class" id="my-codeblock" lineNos=inline tabWidth=2}
declare a=1
echo "$a"
exit
```
````

一个围栏代码块由以下部分组成：

- 起始[代码围栏](https://spec.commonmark.org/current/#code-fence)
- 可选的信息字符串
- 代码样例
- 结束代码围栏

在上面的例子中，信息字符串包含：

- 代码样例的语言（第一个词）
- 可选的属性列表，用空格或逗号分隔，写在花括号内

信息字符串中的属性可以是通用属性，也可以是高亮选项。

上例中的**通用属性**是 `class` 与 `id`。如果代码块渲染钩子没有做特殊处理，Hugo 会把每个通用属性加到包裹代码块输出的 HTML 元素上。按照自身的内容安全模型，Hugo 会移除 `onclick`、`onmouseover` 这类 HTML 事件属性。通用属性通常是全局 HTML 属性，也可以包含自定义属性。

上例中的**高亮选项**是 `lineNos` 与 `tabWidth`。Hugo 使用内建语法高亮器渲染代码样例，可以通过指定一个或多个[高亮选项](/functions/transform/highlight/#选项)来控制渲染结果的外观。

> [!NOTE]
> `style` 虽然是全局 HTML 属性，但出现在信息字符串中时会被当作高亮选项。

**两者的区别值得记牢**：通用属性最终会出现在输出 HTML 的**外层元素**上（由钩子决定加到哪个元素），高亮选项则交给语法高亮器去影响**代码本身的渲染**。在钩子的上下文里，它们分别对应 `Attributes` 与 `Options` 两个映射——这是本页最容易混淆的一对字段。

实测（Hugo 0.167，本站）：本站 `hugo.toml` 设了 `[markup.highlight] noClasses = false`，因此高亮输出使用 CSS 类名而不是内联样式，配色由主题的 `assets/css/syntax.css` 提供（由主题的 `partials/head.html` 引入）。这属于高亮配置，与钩子无关；但如果你看到代码块「没有颜色」，先分清是高亮配置问题（样式表没加载）还是钩子把输出弄丢了。

## 上下文

代码块**渲染钩子**模板接收以下上下文：

`Attributes`
: （`map`）信息字符串中的通用属性。

`Inner`
: （`string`）起始与结束代码围栏之间的内容，不含信息字符串。

`Options`
: （`map`）信息字符串中的高亮选项。

`Ordinal`
: （`int`）代码块在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`Position`
: （`text.Position`）代码块在页面内容中的位置。

`Type`
: （`string`）信息字符串的第一个词，通常是代码语言。

注意 `.Position` 的类型是 `text.Position`，与其他钩子里的 `string` 不同；直接当字符串输出会得到可读的位置信息，用于错误消息最合适（下面的 Mermaid 与公式示例都这么用）。

`.Inner` 是**未经处理的原始字符串**：它不会被自动转义，也不会被自动当成 HTML。要输出到页面时必须自己决定怎么处理——如果内容是纯文本（多数情况），要先 `htmlEscape`；如果确实是 HTML，才用 `safeHTML`。

## 示例

默认情况下，Hugo 使用内建语法高亮器渲染围栏代码块，并包裹渲染结果。要写出行为一致的渲染钩子：

```go-html-template {file="layouts/_markup/render-codeblock.html"}
{{ $result := transform.HighlightCodeBlock . }}
{{ $result.Wrapped }}
```

当语言未指定或高亮器不支持该语言时回退为纯文本：

```go-html-template {file="layouts/_markup/render-codeblock.html"}
{{- $opts := dict }}
{{- if not (transform.CanHighlight .Type) }}
  {{- $opts = dict "type" "text" }}
{{- end }}
{{- $result := transform.HighlightCodeBlock . $opts }}
{{- $result.Wrapped }}
```

`transform.HighlightCodeBlock` 返回一个结果对象，它有两个方法：`.Wrapped` 输出带 `<div>`／`<pre>`／`<code>` 包裹的高亮代码，`.Inner` 输出不带包裹元素的高亮代码（便于你自行包裹）。上面的例子用 `.Wrapped`，因此与默认输出一致。

想覆盖信息字符串里的某个高亮选项，用 `merge` 把新的取值并进 `.Options` 再传进去：

```go-html-template {file="layouts/_markup/render-codeblock.html"}
{{ $opts := merge .Options (dict "lineNos" true) }}
{{ $result := transform.HighlightCodeBlock . $opts }}
{{ $result.Wrapped }}
```

尽管可以用一个模板加条件逻辑来按语言区分行为，也可以为不同语言创建单独的模板：

```tree
layouts/
  └── _markup/
      ├── render-codeblock-mermaid.html
      ├── render-codeblock-python.html
      └── render-codeblock.html
```

例如，创建一个渲染 [Mermaid](https://mermaid.js.org/) 图表的代码块渲染钩子：

```go-html-template {file="layouts/_markup/render-codeblock-mermaid.html"}
<pre class="mermaid">
  {{ .Inner | htmlEscape | safeHTML }}
</pre>
{{ .Page.Store.Set "hasMermaid" true }}
```

然后在**基础**模板的**末尾**、`body` 结束标签之前加入这段代码：

```go-html-template {file="layouts/baseof.html"}
{{ if .Store.Get "hasMermaid" }}
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
  </script>
{{ end }}
```

这段示例里有三处值得停下来想清楚的地方：

1. **为什么要 `Store` 中转。** 钩子在渲染页面内容的过程中执行，而基础模板运行在更外层，那时还不知道页面里有没有 mermaid 代码块。所以钩子先用 `.Page.Store.Set` 记一个标记，基础模板再用 `.Store.Get` 读它——这正是[「页面的 Store 里为什么缺少某个值」](/troubleshooting/faq/#页面的-store-里为什么缺少某个值)那一节讲的问题。
2. **为什么要放在 `body` 结束标签之前。** 脚本需要页面里的 `<pre class="mermaid">` 已经存在。放在 `head` 里虽然也能跑，但依赖模块加载时机，放在末尾更稳。
3. **`htmlEscape | safeHTML` 是成对的。** `.Inner` 是原始字符串，先用 `htmlEscape` 把尖括号转义掉，再用 `safeHTML` 告诉 Hugo「这段已经处理好了，别二次转义」。只写 `safeHTML` 会把用户写的 `<` 当成标签注入页面。

图表页面的完整做法见[图表](/content-management/diagrams/#mermaid-图)。

### 本站主题的实际实现

本站每个代码块顶部的文件名（例如本文里那些 `layouts/_markup/render-codeblock.html`）就是钩子渲染出来的。主题 `hugo-docs-theme` 的实现如下，它同时演示了「高亮选项透传」「不支持的语言回退纯文本」「信息字符串里的自定义属性 `file` 变成题注」三件事：

```go-html-template {file="themes/hugo-docs-theme/layouts/_markup/render-codeblock.html"}
{{- $opts := .Options -}}
{{- if not (transform.CanHighlight .Type) -}}
  {{- $opts = merge $opts (dict "type" "text") -}}
{{- end -}}
{{- $result := transform.HighlightCodeBlock . $opts -}}
{{- with .Attributes.file -}}
<figure class="code-block" data-file="{{ . }}">
  <figcaption class="code-block-file">{{ . }}</figcaption>
  {{ $result.Wrapped }}
</figure>
{{- else -}}
{{ $result.Wrapped }}
{{- end -}}
```

对照默认实现可以看出：**钩子的自由度就在于「谁来包裹、包裹成什么」**。默认是 `<div>`，这里换成了 `<figure>` 加一个 `<figcaption>`，代码本身仍然交给同一个高亮器渲染。

## 什么时候用，什么时候别用

**该用**：

- 给代码块加文件名标题、行号开关、复制按钮等统一的包装；
- 为特定语言（Mermaid、PlantUML、Python 运行演示等）提供专门的渲染方式；
- 不支持的语言想回退成纯文本，避免出现半截高亮的乱码；
- 想自己包裹高亮结果（用 `.Inner` 而不是 `.Wrapped`）。

**别用**：

- 只想换代码配色——那是 `markup.highlight` 配置与 Chroma 样式表的事，见[语法高亮](/content-management/syntax-highlighting/)；
- 只想给某一个代码块特殊处理——直接在 Markdown 的信息字符串里加属性更简单；
- 想用钩子去**执行**代码或做语法检查——钩子只负责输出 HTML。

## 内建钩子

Hugo 自带一个内建代码块渲染钩子，用于渲染 GoAT 图表（ASCII 图），详见[图表](/content-management/diagrams/#goat-图ascii)与 [`diagrams.Goat`](/functions/diagrams/goat/)。

与链接、图片不同，代码块没有 `useEmbedded` 这类开关：Hugo 只有 GoAT 这一个内建代码块钩子。

## 验证与常见坑

**验证方法**：先只放一个「与默认行为一致」的钩子（就是 `{{ $result := transform.HighlightCodeBlock . }}` 两行），构建后对比改动前后的 HTML——**两者应该完全一致**。这是最省事的基线检查：如果连基线都不一致，问题出在钩子本身，而不是你后面加的逻辑。

```bash
hugo --ignoreCache --destination tmp-out
```

**你应当看到什么**：

- 代码块仍有高亮颜色（说明没把 `$result.Wrapped` 丢掉）；
- 信息字符串里的 `class`、`id` 出现在输出的外层元素上；
- 信息字符串里的 `lineNos`、`tabWidth` 只影响代码内部，不会变成 HTML 属性。

三类典型问题：

| 类别 | 现象 | 原因与修法 |
| --- | --- | --- |
| 钩子没生效 | 没有报错，代码块与以前一样 | 文件名或位置不对；限定名拼错（`render-codeblock-mermiad.html`）会静默回退到通用模板 |
| 没报错但结果不对 | 代码块变成空白，或只剩一个空框 | 忘了输出 `$result.Wrapped`／`$result.Inner`；高亮结果算出来了却没写出来 |
| 没报错但结果不对 | 代码里的 `<` 变成可见的 `&lt;`，或者标签被当成 HTML 执行了 | `.Inner` 的转义处理写反了：纯文本要 `htmlEscape`，确实是 HTML 才用 `safeHTML` |
| 没报错但结果不对 | Mermaid 代码块显示成一大段文字，图没出来 | 语言限定模板没被匹配到，或基础模板末尾那段脚本没加 |
| 报错看不懂 | 报错带模板文件名与行号，或出现 `can't evaluate field Anchor` 之类 | 用了非代码块钩子的字段；代码块钩子没有 `.Anchor`、`.Text`、`.Destination`，请对照本页「上下文」 |

更多相关问题见[故障排查](/troubleshooting/)与[常见问题](/troubleshooting/faq/)。

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
