+++
title = "图片"
linkTitle = "图片"
description = "创建图片渲染钩子，覆盖 Markdown 图片到 HTML 的转换；含上下文变量、figure 版式、内建钩子与 IsBlock 的坑。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/render-hooks/images/"

[params.teach]
difficulty = "参考"
time = "10–15 分钟"
prereq = [
  "读过[简介](/render-hooks/introduction/)，知道钩子模板要放在 `layouts/_markup/`、文件名怎么取。",
  "站点里至少有一张 Markdown 插图，改完能立刻在页面上比对效果。",
]
outcomes = [
  "写出一个把独立图片渲染成 `figure` + `figcaption` 的 `render-image.html`；",
  "说清 `IsBlock` 为什么会是假，以及它依赖哪一项站点配置；",
  "分清「解析图片地址」与「处理图片」是两件事，知道该去哪一类页面找答案。",
]
next = ["/render-hooks/links/", "/render-hooks/code-blocks/", "/content-management/image-processing/"]

+++

## Markdown 中的图片

一个 Markdown 图片由三部分组成：图片描述、图片目标地址，以及可选的图片标题。

```text
![white kitten](/images/kitten.jpg "A kitten!")
  ------------  ------------------  ---------
      描述            目标地址          标题
```

这三部分会按下文所列的字段传入渲染钩子的上下文。

## 上下文

图片**渲染钩子**模板接收以下上下文：

`Attributes`
: （`map`）[Markdown 属性](/content-management/markdown-attributes/)，需要按下面的方式配置站点后才可用：

  ```toml
  [markup.goldmark.parser]
  wrapStandAloneImageWithinParagraph = false
  [markup.goldmark.parser.attribute]
  block = true
  ```

`Destination`
: （`string`）图片的目标地址。

`IsBlock`
: （`bool`）报告独立图片是否未被包裹在段落元素中。

`Ordinal`
: **（0.160.0 新增）**
: （`int`）图片在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`PlainText`
: （`string`）图片描述的纯文本形式。

`Position`
: **（0.160.0 新增）**
: （`string`）图片在页面内容中的位置。

`Text`
: （`template.HTML`）图片的描述内容。

`Title`
: （`string`）图片标题。

## 示例

> [!NOTE]
> 对于图片、链接这类行内元素，应使用 `{{-` 与 `-}}` 定界写法去掉首尾空白，避免在相邻的行内元素与文本之间产生空格。

默认配置下，Hugo 按 [CommonMark](https://spec.commonmark.org/current/) 规范渲染 Markdown 图片。要写出行为一致的渲染钩子：

```go-html-template {file="layouts/_markup/render-image.html"}
<img src="{{ .Destination | safeURL }}"
  {{- with .PlainText }} alt="{{ . }}"{{ end -}}
  {{- with .Title }} title="{{ . }}"{{ end -}}
>
{{- /* chomp trailing newline */ -}}
```

要把独立图片渲染进 `figure` 元素：

```go-html-template {file="layouts/_markup/render-image.html"}
{{- if .IsBlock -}}
  <figure>
    <img src="{{ .Destination | safeURL }}"
      {{- with .PlainText }} alt="{{ . }}"{{ end -}}
    >
    {{- with .Title }}<figcaption>{{ . }}</figcaption>{{ end -}}
  </figure>
{{- else -}}
  <img src="{{ .Destination | safeURL }}"
    {{- with .PlainText }} alt="{{ . }}"{{ end -}}
    {{- with .Title }} title="{{ . }}"{{ end -}}
  >
{{- end -}}
```

注意上面的写法要求项目配置如下，否则独立图片会被包裹在段落元素中，`IsBlock` 不会为真：

```toml
[markup.goldmark.parser]
wrapStandAloneImageWithinParagraph = false
```

### 为什么 `IsBlock` 会是假

这是本页最容易踩的坑：**复制了模板，却没改配置**。`wrapStandAloneImageWithinParagraph` 描述的是 Goldmark 的默认行为——把四周没有相邻内容的图片也用 `<p>` 包起来，默认值是 `true`。图片一旦被包进 `<p>`，钩子里拿到的就不是「独立图片」，`IsBlock` 为假，`figure` 那个分支永远走不到。

后果是**没有任何报错**：构建成功，页面上图片也在，只是没有 `figure`、没有 `figcaption`，题注干脆不显示。遇到「模板明明写了却看不到效果」，先检查这行配置。

实测（Hugo 0.167，本站）：本站 `hugo.toml` 只开了 `[markup.goldmark.parser.attribute] block = true`，没有设置 `wrapStandAloneImageWithinParagraph`（即保持默认 `true`）。因此在本站上，上面那个 `figure` 版本需要先补上这行配置才会生效。

> [!NOTE]
> `alt` 用的是 `.PlainText` 而不是 `.Text`：`alt` 属性里只能是纯文本，而 `.Text` 是已经渲染过的 `template.HTML`，可能含标签。

### 边界情况

- `.PlainText` 为空（例如 `![](/images/kitten.jpg)`）时 `{{ with }}` 判假，不会输出 `alt`。**这对可访问性不利，但模板不该替内容做决定**；需要在站内强制时，应先修内容。
- `.Title` 为空时同理，`title` 与 `figcaption` 都不会输出。这正是 `.Title` 可选的正确定义。
- `.Destination` 是 `string`，必须套 `safeURL` 才能安全地放进 `src`；漏掉它在多数地址上看不出差别，但地址里带 `&` 等字符时会出问题。

### 本站实际渲染效果

下面这张图是**真的用 Markdown 图片语法写在正文里**的，不是代码块里的示意——它就是这一页上渲染出来的那张图（鼠标停在图上，浏览器会弹出 `title` 的提示文字）：

![示例图标](/images/examples/hugo-icon.png "这是 title")

本站主题没有图片渲染钩子（`themes/hugo-docs-theme/layouts/_markup/` 下只有 `render-link.html`、`render-codeblock.html`、`render-blockquote.html`，那也是本站唯一的 `_markup` 目录），所以上面这行走的是 Goldmark 默认渲染。实测（Hugo 0.167.0 extended，本站：站点构建（`hugo --ignoreCache`）后读 `public/render-hooks/images/index.html`）产物里这段的 HTML 是：

```html
<p><img src="/images/examples/hugo-icon.png" alt="示例图标" title="这是 title"></p>
```

逐条对照：

- **`<img>` 上的三个属性正好来自 Markdown 的三部分**：`src` ← 目标地址、`alt` ← 描述、`title` ← `"这是 title"`。本站没有钩子，谁也不会再来改这三个值；本页「示例」里的模板正是要替这段输出负责。
- **图片被包在 `<p>` 里**，这一点最能说明配置与钩子的关系：本站 `hugo.toml` **没有**设置 `wrapStandAloneImageWithinParagraph`，即保持默认 `true`。所以这张四周没有相邻文字的图片依然被 `<p>` 包着——如果本站真写了钩子，它拿到的 `IsBlock` 会是**假**，`figure` 分支根本走不到（见上面的「为什么 `IsBlock` 会是假」）。
- **本站要 `figure` 结构时走的是短代码**：[`figure` 短代码](/shortcodes/figure/) 直接输出 `<figure>` + `<figcaption>`，不用图片渲染钩子，也就绕开了 `IsBlock` 这个坑。

## 什么时候用，什么时候别用

**该用**：

- 把独立图片统一包成 `figure`，让题注（`.Title`）有地方显示；
- 给全站图片统一补 `loading="lazy"`、`decoding="async"` 这类属性；
- 按页面资源解析图片地址（多语言站点、页面包里的图片）；
- 让主题接管图片渲染，把规则集中到一处。

**别用**：

- **想要缩放、裁剪、转格式**——那是[图像处理](/content-management/image-processing/)的事。文档明确写着：内建图片渲染钩子**不执行图片处理**，它唯一的用途是解析 Markdown 图片的目标地址。图片钩子能做到的是把 `src` 指向一个已经处理好的资源地址，处理本身要在别处完成；
- 只想让某一张图变大变小——用 `figure` 短代码或直接写 HTML 更直接；
- 只想让图片适应容器宽度——那是 CSS（`max-width: 100%`）的事。

## 内建钩子

Hugo 自带一个内建图片渲染钩子，用于解析 Markdown 图片的目标地址，你可以在项目配置中调整它的行为。默认配置为：

```toml
[markup.goldmark.renderHooks.image]
useEmbedded = 'auto'
```

如上取值为 `auto` 时，Hugo 会自动为多语言单主机项目使用内建图片渲染钩子，具体条件是「共享页面资源复制」功能处于关闭状态；这也是这类项目的默认行为。如果项目、模块或主题定义了自定义图片渲染钩子，则改用自定义钩子。

还可以把该选项配置为 `always`（始终使用内建钩子）、`fallback`（仅作为回退）或 `never`（从不使用）。四个取值的完整语义见[配置 Markup](/configuration/markup/#goldmark)；通俗地说，**只要自己写了图片钩子，通常就是自己在负责解析地址**（唯一的例外是 `always`，它会让内建钩子压过你的钩子）。

实测（Hugo 0.167，本站）：本站不是多语言站点，主题也没有提供 `render-image.html`，因此按 `auto` 的规则，内建图片钩子与自定义钩子都没有参与，本站的 Markdown 图片走的是 Goldmark 默认渲染。

内建图片渲染钩子解析站内 Markdown 目标地址时，先查找匹配的页面资源，再回退到匹配的全局资源；远程目标直接透传，无法解析时不会抛出错误或警告。

全局资源必须放在 `assets` 目录中。如果资源放在 `static` 目录且无法或不便迁移，就必须把 `static` 目录挂载到 `assets` 目录，即在项目配置中同时加入下面两项：

```toml
[[module.mounts]]
source = 'assets'
target = 'assets'

[[module.mounts]]
source = 'static'
target = 'assets'
```

需要注意，内建图片渲染钩子不执行图片处理，它唯一的用途是解析 Markdown 图片的目标地址。

## 验证与常见坑

验证方法与链接钩子相同：给输出的 `<figure>` 或 `<img>` 加一个独一无二的 `class`，构建后到产出的 HTML 里搜它。

**你应当看到什么**：独立图片的 HTML 变成 `<figure>` 包 `<img>`，有 `.Title` 时多出 `<figcaption>`；行内图片（与文字同处一行）仍然只输出 `<img>`。

三类典型问题：

| 类别 | 现象 | 原因与修法 |
| --- | --- | --- |
| 钩子没生效 | 没有报错，图片和以前一模一样 | 文件名或位置不对；到[简介的排查表](/render-hooks/introduction/#配错时的典型报错与常见坑)逐条核对 |
| 没报错但结果不对 | 写了 `figure` 分支，页面上却还是普通的 `<img>` 被 `<p>` 包着 | `wrapStandAloneImageWithinParagraph` 没有设为 `false`，`IsBlock` 恒为假；见本页「为什么 `IsBlock` 会是假」 |
| 没报错但结果不对 | `alt` 里出现了 HTML 标签的尖括号 | 用了 `.Text` 而不是 `.PlainText` |
| 报错看不懂 | 报错带模板文件名与行号 | 模板里 `{{ if }}`／`{{ with }}` 少了 `{{ end }}`；注意 `if`／`else`／`end` 三个分支都要配平 |

更多图片相关问题，见[故障排查](/troubleshooting/)与[常见问题](/troubleshooting/faq/)。

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

`PageInner` 在不适用时会回退为 `Page` 的值，并且始终有返回值。它只对调用 `RenderShortcodes` 方法的短代码有意义，并且必须以 Markdown 记法调用该短代码。Hugo 的内建链接渲染钩子与内建图片渲染钩子都用 `PageInner` 来解析 Markdown 中链接与图片的目标地址。
