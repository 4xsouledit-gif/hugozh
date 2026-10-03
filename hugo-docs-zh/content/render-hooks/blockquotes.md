+++
title = "引用块"
linkTitle = "引用块"
description = "创建引用块渲染钩子，覆盖 Markdown 引用块的渲染，并把 NOTE 等警示块变成带样式的提示框。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/render-hooks/blockquotes/"

[params.teach]
difficulty = "进阶"
time = "20–30 分钟"
prereq = [
  "读过[简介](/render-hooks/introduction/)，知道钩子模板要放在 `layouts/_markup/`、文件名怎么取。",
  "站点里已经有用 `> [!NOTE]` 之类写法的地方，或者准备开始用。",
]
outcomes = [
  "写出一个把警示块渲染成提示框、把普通引用块按 CommonMark 渲染的 `render-blockquote.html`；",
  "分清警示块的「基本语法」与「扩展语法」，知道扩展写法在 GitHub、Typora 上会退化；",
  "说清 `Type`、`AlertType`、`AlertTitle`、`AlertSign` 四个字段各自在什么情况下才有值；",
  "知道怎么把提示框的标签文本改成中文。",
]
next = ["/render-hooks/tables/", "/render-hooks/code-blocks/", "/content-management/markdown-attributes/"]

+++

## 上下文

引用块**渲染钩子**模板接收以下上下文：

`AlertType`
: （`string`）当 `Type` 为 `alert` 时适用，取警示块类型的小写形式。参见下文[警示块](#警示块)。

`AlertTitle`
: （`template.HTML`）当 `Type` 为 `alert` 时适用，取警示块标题。参见下文[警示块](#警示块)。

`AlertSign`
: （`string`）当 `Type` 为 `alert` 时适用，取警示块标记。通常用于表示警示块是否可在界面上折叠，取值为 `+`、`-` 或空字符串。参见下文[警示块](#警示块)。

`Attributes`
: （`map`）[Markdown 属性](/content-management/markdown-attributes/)，需要按下面的方式配置站点后才可用：

  ```toml
  [markup.goldmark.parser.attribute]
  block = true
  ```

`Ordinal`
: （`int`）引用块在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`Position`
: （`string`）引用块在页面内容中的位置。

`Text`
: （`template.HTML`）引用块的文本；当 `Type` 为 `alert` 时不含第一行。参见下文[警示块](#警示块)。

`Type`
: （`string`）引用块类型。带警示块标记时返回 `alert`，否则返回 `regular`。参见下文[警示块](#警示块)。

三个 `Alert*` 字段都只在 `Type` 为 `alert` 时才有意义：普通引用块上它们是空值。判断顺序因此是固定的——**先用 `.Type` 分流，再在 `alert` 分支里用 `AlertType`、`AlertTitle`、`AlertSign`**。

实测（Hugo 0.167，本站）：本站 `hugo.toml` 里 `[markup.goldmark.parser.attribute] block = true`，所以引用块下方的 `{cite="…"}` 这类块级属性在本站可用。

## 示例

默认配置下，Hugo 按 [CommonMark](https://spec.commonmark.org/current/) 规范渲染 Markdown 引用块。要写出行为一致的渲染钩子：

```go-html-template {file="layouts/_markup/render-blockquote.html"}
<blockquote>
  {{ .Text }}
</blockquote>
```

要把引用块渲染为 HTML 的 `figure` 元素，并附上可选的出处与题注：

```go-html-template {file="layouts/_markup/render-blockquote.html"}
<figure>
  <blockquote {{ with .Attributes.cite }}cite="{{ . }}"{{ end }}>
    {{ .Text }}
  </blockquote>
  {{ with .Attributes.caption }}
    <figcaption class="blockquote-caption">
      {{ . | safeHTML }}
    </figcaption>
  {{ end }}
</figure>
```

对应的 Markdown 写法是：在引用块下方另起一行，用花括号给出 `cite` 与 `caption` 两个属性：

```md
> Some text
{cite="https://gohugo.io" caption="Some caption"}
```

注意 `caption` 用了 `safeHTML`，`cite` 没有：`caption` 的位置是正文内容（可以含标记），而 `cite` 是属性值（只能是文本）。这正是[简介里三种值类型](/render-hooks/introduction/#钩子模板输出的三种值类型)的实际应用。

> [!NOTE]
> 属性那一行必须**顶格**写在引用块下方，不能带 `>`；缩进或写成 `> {cite=…}` 都不会被解析成块级属性。

## 警示块

警示块（alert）又称 callout 或 admonition，是用于强调关键信息的引用块。

### 基本语法

使用基本 Markdown 语法时，每个警示块的第一行是警示块标记：一个感叹号加警示块类型，整体包在方括号中。类型可以是 `NOTE`、`TIP`、`IMPORTANT`、`WARNING` 与 `CAUTION`：

```md {file="content/example.md"}
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```

基本语法与 [GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)、[Obsidian](https://help.obsidian.md/Editing+and+formatting/Callouts) 和 [Typora](https://support.typora.io/Markdown-Reference/#callouts--github-style-alerts) 兼容。

**这一段的重点不在语法，而在「第一行去哪了」**：渲染钩子拿到的 `.Text` **不含**这一行。所以钩子必须自己把类型转换成标题（例如把 `note` 变成「说明」），否则提示框会没有标题——而 Hugo 同样不会为这种「少了一行标题」报错。

### 扩展语法

使用扩展 Markdown 语法时，可以额外给出警示块标记和/或警示块标题。警示块标记是 `+` 或 `-`，通常用于表示警示块是否可在界面上折叠：

```md {file="content/example.md"}
> [!WARNING]+ Radiation hazard
> Do not approach or handle without protective gear.
```

扩展语法与 [Obsidian](https://help.obsidian.md/Editing+and+formatting/Callouts) 兼容。

> [!NOTE]
> 扩展语法与 GitHub、Typora 不兼容。如果加了警示块标记或警示块标题，这两个应用会把该 Markdown 当作普通引用块渲染。

写成 `+` 或 `-` 只表示「可折叠 / 已折叠」，**折叠行为本身要靠前端脚本实现**；钩子能做的只是把 `.AlertSign` 的值输出到 HTML（例如作为 `class` 或 `data-` 属性），供 CSS 或 JavaScript 使用。

### 示例

下面这个引用块渲染钩子在存在警示块标记时渲染多语言警示块，否则按 CommonMark 规范渲染普通引用块：

```go-html-template {file="layouts/_markup/render-blockquote.html"}
{{ $emojis := dict
  "caution" ":exclamation:"
  "important" ":information_source:"
  "note" ":information_source:"
  "tip" ":bulb:"
  "warning" ":information_source:"
}}

{{ if eq .Type "alert" }}
  <blockquote class="alert alert-{{ .AlertType }}">
    <p class="alert-heading">
      {{ transform.Emojify (index $emojis .AlertType) }}
      {{ with .AlertTitle }}
        {{ . }}
      {{ else }}
        {{ or (i18n .AlertType) (title .AlertType) }}
      {{ end }}
    </p>
    {{ .Text }}
  </blockquote>
{{ else }}
  <blockquote>
    {{ .Text }}
  </blockquote>
{{ end }}
```

标题的取值顺序值得注意，它按「从具体到通用」依次回退：

1. 内容里写了标题（扩展语法）→ 用 `.AlertTitle`；
2. 没写 → 查 i18n 翻译文件，键名就是 `.AlertType`（`note`、`tip`…）；
3. i18n 里也没有 → `title` 函数把 `.AlertType` 首字母大写当兜底。

要覆盖标签文本，在 i18n 文件中加入如下条目：

```toml {file="i18n/en.toml"}
caution = 'Caution'
important = 'Important'
note = 'Note'
tip = 'Tip'
warning = 'Warning'
```

虽然可以像上面那样用一个模板加条件逻辑处理，也可以为每种引用块 `Type` 创建单独的模板：

```tree
layouts/
  └── _markup/
      ├── render-blockquote-alert.html
      └── render-blockquote-regular.html
```

### 本站主题的实际实现

本站主题 `hugo-docs-theme` 没有用 i18n 文件，而是直接用一个映射表把类型译成中文，顺带把警示块包成了 `<aside class="callout">` 结构（与本站 `note` 短代码共用同一套样式）：

```go-html-template {file="themes/hugo-docs-theme/layouts/_markup/render-blockquote.html"}
{{- $labels := dict "note" "说明" "tip" "提示" "important" "重要" "warning" "注意" "caution" "警告" -}}
{{- if eq .Type "alert" -}}
<aside class="callout callout-{{ .AlertType }}">
  <p class="callout-title">{{ with .AlertTitle }}{{ . }}{{ else }}{{ or (index $labels .AlertType) (.AlertType | title) }}{{ end }}</p>
  <div class="callout-body">{{ .Text }}</div>
</aside>
{{- else -}}
<blockquote>{{ .Text }}</blockquote>
{{- end -}}
```

对照官方示例可以看到两处本地化取舍：**标签文本用映射表而不是 i18n**（单语言站点更省事），**输出结构用 `<aside>` 而不是 `<blockquote>`**（提示框在语义上不是引用）。要做成多语言站点时，仍建议回到 i18n 方案。

### 本站实际渲染效果

**先声明一句：下面这几个提示块是「演示用」的**——它们是拿来让你看渲染效果的样本，**不是本页对读者的提示**，里面的文字也不构成任何操作建议。

下面几个引用块是**在本页正文里真实渲染出来的**，走的就是**本站自己的**钩子 `themes/hugo-docs-theme/layouts/_markup/render-blockquote.html`（本文前面「本站主题的实际实现」一节贴出的那份模板）：

> [!NOTE]
> 演示用提示块：这里是说明（note）的内容。

> [!TIP]
> 演示用提示块：这里是提示（tip）的内容。

> [!WARNING]
> 演示用提示块：这里是注意（warning）的内容。

> [!CAUTION]
> 演示用提示块：这里是警告（caution）的内容。

> [!IMPORTANT]
> 演示用提示块：这里是重要（important）的内容。

作为对照，下面是一个**普通引用块**（不带 `[!…]` 标记）：

> 这是一个普通引用块。它没有 `[!…]` 标记，钩子把它当 `regular` 处理。

**逐条对账**（实测：Hugo 0.167.0，站点构建（`hugo --ignoreCache`）后读 `public/render-hooks/blockquotes/index.html`）：

1. **上面五个提示块都是黄色／彩色边框的 `.callout`，不是引用块的样子。** 因为五个都带 `[!…]` 标记，钩子上下文里的 `.Type` 是 `alert`，模板里那句 `{{ if eq .Type "alert" }}` 成立，于是走它下面那条分支，输出 `<aside class="callout callout-…">` 而不是 `<blockquote>`。
2. **标签文字（「说明」「提示」「注意」「警告」「重要」）由模板里的标题表达式生成：** `{{ with .AlertTitle }}{{ . }}{{ else }}{{ or (index $labels .AlertType) (.AlertType | title) }}{{ end }}`。其中 `$labels` 是模板顶部那张映射表（`dict "note" "说明" "tip" "提示" …`），键是 `.AlertType` 的小写形式，值是中文标签。本例五个提示块都没写扩展标题，所以 `.AlertTitle` 为空，落进 `else`，由映射表给出中文——**中文标签就是「类型 → 中文」这一步查出来的**。
3. **`.callout-…` 上的类名是英文小写类型**，例如第一个是 `callout-note`、第四个是 `callout-caution`（模板里写成 `class="callout callout-{{ .AlertType }}"`）。所以配色由 CSS 按 `.callout-*` 决定，而不是由标签文字决定。
4. **每个提示块的正文来自 `.Text`，且不含第一行。** `[!NOTE]` 那一行不在 `.Text` 里（这正是上文「基本语法」一节的要点），模板用 `<div class="callout-body">{{ .Text }}</div>` 把剩下的内容放进去——所以这里既需要映射表补标题，也不会出现「`[!NOTE]` 原样显示在框里」的情况。
5. **五个类型本站全都支持，没有缺项。** `$labels`（模板顶部那张映射表）里 `note`、`tip`、`important`、`warning`、`caution` 五个键齐全，因此五个演示块都有中文标签，不会退化成 `title` 函数兜底的首字母大写英文（`Note`、`Tip`……）。**实测**：这五个提示块的 `<p class="callout-title">` 里依次是「说明」「提示」「注意」「警告」「重要」。
6. **最后那个普通引用块走的是另一条分支。** 它没有 `[!…]` 标记，`.Type` 是 `regular`，`{{ if eq .Type "alert" }}` 不成立，落到 `else` 分支的 `<blockquote>{{ .Text }}</blockquote>`——所以你看到的是浏览器默认的引用块样式，而不是 `.callout` 的彩色框。

对照上游那份官方示例模板（本文「示例」一节）可以看出差异：官方示例查 i18n 文件（`{{ or (i18n .AlertType) (title .AlertType) }}`），本站直接查模板里的映射表；官方示例输出 `<blockquote class="alert alert-…">`，本站输出 `<aside class="callout callout-…">`。两种写法的**判定顺序是一样的**：先看 `.Type` 是不是 `alert`，再看 `.AlertTitle` 有没有值，最后才回退到标签表。

## 什么时候用，什么时候别用

**该用**：

- 想让 `> [!NOTE]` 这类写法变成带样式、带图标的提示框；
- 想统一把引用块渲染成 `figure` + `figcaption`（出处、题注）；
- 想给警示块加可折叠交互所需的 `data-` 属性；
- 想为不同分区提供不同的引用块样式。

**别用**：

- 只想让引用块换个颜色——CSS 就够了；
- 只想在某一处强调信息——直接用本站的 `note` 短代码或写 HTML 更省事；
- 想用钩子去做**折叠交互本身**——钩子只输出 HTML，交互要靠 CSS 或脚本。

## 验证与常见坑

**验证方法**：写一个带唯一 `class` 的钩子，然后在一篇内容里同时放一个普通引用块和一个警示块，构建后确认**两条分支都被走到**。

```bash
hugo --ignoreCache --destination tmp-out
```

```bash
# Linux / macOS
grep -n 'callout\|blockquote' tmp-out/posts/example/index.html | head
```

```powershell
# Windows PowerShell
Select-String -Path tmp-out\posts\example\index.html -Pattern 'callout|blockquote' | Select-Object -First 10
```

**你应当看到什么**：`> [!NOTE]` 那一段变成提示框结构，且**有标题文字**（说明、提示等）；普通 `> 引用` 那一段变成 `<blockquote>`。两者都在，才说明 `if`／`else` 两条分支都对。

三类典型问题：

| 类别 | 现象 | 原因与修法 |
| --- | --- | --- |
| 钩子没生效 | 没有报错，`[!NOTE]` 还是原样显示 | 文件名或位置不对；到[简介的排查表](/render-hooks/introduction/#配错时的典型报错与常见坑)逐条核对 |
| 没报错但结果不对 | 提示框出现了，但没有标题 | 警示块的第一行不在 `.Text` 里，标题必须自己用 `.AlertType`／`.AlertTitle` 拼；见「基本语法」一节 |
| 没报错但结果不对 | 普通引用块也被渲染成了提示框 | 忘了先判断 `.Type`；`.Type` 只有 `alert` 与 `regular` 两个取值 |
| 没报错但结果不对 | 只有警示块正常，翻页到最后一段普通引用块样式很怪 | 只写了 `alert` 分支，普通引用块落到了模板外；确保 `else` 分支也输出完整结构 |
| 没报错但结果不对 | 提示框没有图标，或标题变成了英文原词 | `$emojis` 映射表少了某个类型，或 i18n 文件里没有对应键。`index` 取不到键时返回空字符串而**不会报错**，只会少内容；五个类型（`note`／`tip`／`important`／`warning`／`caution`）都要有对应项 |
| 报错看不懂 | 报错带模板文件名与行号 | `if`／`else`／`end` 少配对，或用了本钩子没有的字段（引用块钩子没有 `.Anchor`、`.Inner`、`.Destination`） |

更多相关问题见[故障排查](/troubleshooting/)；`> [!NOTE]` 与短代码两种提示写法怎么选，见[常见问题](/troubleshooting/faq/)。

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
