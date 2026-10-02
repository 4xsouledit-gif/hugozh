+++
title = "标题"
linkTitle = "标题"
description = "创建标题渲染钩子，覆盖 Markdown 标题到 HTML 的转换，并为标题追加锚点链接；含 Anchor 的风险与验证方法。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/render-hooks/headings/"

[params.teach]
difficulty = "参考"
time = "10–15 分钟"
prereq = [
  "读过[简介](/render-hooks/introduction/)，知道钩子模板要放在 `layouts/_markup/`、文件名怎么取。",
  "站点已经能生成目录（TOC），改完标题钩子后能立刻看到锚点是否还有效。",
]
outcomes = [
  "写出一个给每个标题追加锚点链接的 `render-heading.html`；",
  "说清 `Anchor` 是怎么来的、改标题文字为什么会弄坏旧链接；",
  "知道标题钩子漏掉哪个字段会让目录与锚点导航整体失效。",
]
next = ["/render-hooks/code-blocks/", "/render-hooks/introduction/", "/troubleshooting/"]

+++

## 上下文

标题**渲染钩子**模板接收以下上下文：

`Anchor`
: （`string`）标题元素的 `id` 属性。

`Attributes`
: （`map`）[Markdown 属性](/content-management/markdown-attributes/)，需要按下面的方式配置站点后才可用：

  ```toml
  [markup.goldmark.parser.attribute]
  title = true
  ```

`Level`
: （`int`）标题层级，取值为 1 到 6。

`Ordinal`
: **（0.160.0 新增）**
: （`int`）标题在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`PlainText`
: （`string`）标题文本的纯文本形式。

`Position`
: **（0.160.0 新增）**
: （`string`）标题在页面内容中的位置。

`Text`
: （`template.HTML`）标题文本。

实测（Hugo 0.167，本站）：本站 `hugo.toml` 里 `[markup.goldmark.parser.attribute]` 同时设了 `block = true` 与 `title = true`，所以标题上的 `{.class}` 之类属性在本站是能拿到的。若你的站点只开了 `block`，标题钩子里的 `.Attributes` 会是空的。

## 示例

默认配置下，Hugo 按 [CommonMark](https://spec.commonmark.org/current/) 规范渲染 Markdown 标题，并额外加入自动生成的 `id` 属性。要写出行为一致的渲染钩子：

```go-html-template {file="layouts/_markup/render-heading.html"}
<h{{ .Level }} id="{{ .Anchor }}" {{- with .Attributes.class }} class="{{ . }}" {{- end }}>
  {{- .Text -}}
</h{{ .Level }}>
```

要为每个标题右侧追加一个锚点链接：

```go-html-template {file="layouts/_markup/render-heading.html"}
<h{{ .Level }} id="{{ .Anchor }}" {{- with .Attributes.class }} class="{{ . }}" {{- end }}>
  {{ .Text }}
  <a href="#{{ .Anchor }}">#</a>
</h{{ .Level }}>
```

### 边界情况

- `.Level` 的取值范围是 1 到 6。正文里写 `#######`（七个井号）不会被当作标题，钩子也就不会触发——它是普通段落。
- `.Attributes.class` 没写时是空字符串，`{{ with }}` 判假，不会输出空的 `class=""`。这是期望行为。
- `.Anchor` 是普通字符串，直接放进 `id="{{ .Anchor }}"` 即可；CJK 标题的锚点会保留汉字本身，实测本站 `## 警示块` 生成的 `id` 就是 `警示块`，`## 使用要点` 生成 `使用要点`。
- `.Text` 是已经渲染过的 `template.HTML`，直接输出；**不要**对它做转义。

## 使用要点

`Anchor` 通常由标题文本推导而来，因此标题文本一改动，旧锚点就会失效，指向旧链接的读者会落到错误的位置。示例用 `id="{{ .Anchor }}"` 把锚点原样输出到标题元素上，标题钩子因此也是统一改写锚点命名规则的地方。

`Attributes` 中的 `class` 是标题钩子最常用的字段，上面的示例已经把它传递到输出的 `<h*>` 元素；其他属性可以按同样方式取用。只要提供了标题钩子，标题的整个 HTML 输出就由模板决定，因此 `Level`、`Anchor` 与 `Text` 都应保留在输出中，否则目录与锚点导航会失效。

标题钩子还可以按页面类型（type）、语言与输出格式分别提供，例如只为某个内容分区或 RSS 输出使用不同的标题结构，具体查找方式见[简介](/render-hooks/introduction/)。

> [!CAUTION]
> **「目录与锚点导航会失效」不是吓唬人。** 站点生成目录的方式是收集页面上各级标题的 `id`，再把目录项链接到 `#那个id`。标题钩子只要漏掉 `id="{{ .Anchor }}"`，目录里所有链接就都指向不存在的锚点——而 Hugo 不会为此报任何错，构建照样成功。

## 什么时候用，什么时候别用

**该用**：

- 给每个标题右侧加一个可点击的锚点链接（`#`），方便读者复制链接；
- 统一锚点的命名规则，例如把中文标题的 `id` 改成拼音或英文，便于分享；
- 给标题补 `class`，供 CSS 或页内脚本使用；
- 为 RSS 等输出格式准备不同结构的标题（`render-heading.rss.xml`）。

**别用**：

- 只想改变标题的字号、字体、颜色——那是 CSS 的事；
- 只想给**某一篇**文章的某个标题加锚点——直接在 Markdown 里写 HTML 标题更直接；
- 想用标题钩子来插入目录本身——目录是布局模板（如 `partials/toc.html`）的职责，标题钩子只负责输出标题元素。

## 验证与常见坑

**验证方法**：构建后到产出的 HTML 里确认两点——标题上有 `id`，且页面目录里的链接与这些 `id` 一一对应。

```bash
hugo --ignoreCache --destination tmp-out
```

```bash
# Linux / macOS：看某个页面里所有 h2/h3 的 id
grep -o '<h[23] id="[^"]*"' tmp-out/posts/example/index.html | head
```

```powershell
# Windows PowerShell：同样的检查
Select-String -Path tmp-out\posts\example\index.html -Pattern '<h[23] id="[^"]*"' -AllMatches |
  ForEach-Object { $_.Matches.Value } | Select-Object -First 10
```

**你应当看到什么**：每个正文标题都带 `id`，`id` 的值与目录链接里 `#` 后面的片段完全一致。如果目录里有链接、页面上却没有对应的 `id`，就是钩子漏输出了 `Anchor`。

三类典型问题：

| 类别 | 现象 | 原因与修法 |
| --- | --- | --- |
| 钩子没生效 | 没有报错，标题和以前一模一样 | 文件名或位置不对；到[简介的排查表](/render-hooks/introduction/#配错时的典型报错与常见坑)逐条核对 |
| 没报错但结果不对 | 目录点进去不跳转，或跳到文章开头 | 钩子漏了 `id="{{ .Anchor }}"`；见上面的警示框 |
| 没报错但结果不对 | 标题里出现了 `{.class}` 这样的字面文本 | 站点没开 `[markup.goldmark.parser.attribute] title = true`，属性没被解析成 `Attributes` |
| 报错看不懂 | 报错带模板文件名与行号 | 模板里少写 `{{ end }}`；注意 `<h{{ .Level }}>` 与 `</h{{ .Level }}>` 要成对，且 `{{ .Level }}` 不能写错大小写 |

更多相关问题见[故障排查](/troubleshooting/)。

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
