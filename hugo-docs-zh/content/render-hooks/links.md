+++
title = "链接"
linkTitle = "链接"
description = "创建链接渲染钩子，覆盖 Markdown 链接到 HTML 的转换；含上下文变量、内建钩子的取舍，以及验证方法。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/render-hooks/links/"

[params.teach]
difficulty = "参考"
time = "10–15 分钟"
prereq = [
  "读过[简介](/render-hooks/introduction/)，知道钩子模板要放在 `layouts/_markup/`、文件名怎么取。",
  "能看懂 Go 模板里最基础的 `{{ with }}` 与管道写法。",
]
outcomes = [
  "写出一个可用的 `layouts/_markup/render-link.html`，并判断该不该自己写这个钩子；",
  "说清内建链接渲染钩子与自定义钩子的取舍关系，知道自定义钩子会顶掉什么；",
  "遇到「链接没加 `rel`」「站内链接失效」「属性被转义」时能立刻定位原因。",
]
next = ["/render-hooks/images/", "/render-hooks/introduction/", "/troubleshooting/"]

+++

## Markdown 中的链接

一个 Markdown 链接由三部分组成：链接文本、链接目标地址，以及可选的链接标题。

```text
[Post 1](/posts/post-1 "My first post")
 ------  -------------  -------------
  文本      目标地址        标题
```

这三部分会按下文所列的字段传入渲染钩子的上下文。

## 上下文

链接**渲染钩子**模板接收以下上下文：

`Destination`
: （`string`）链接的目标地址。

`Ordinal`
: **（0.160.0 新增）**
: （`int`）链接在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`PlainText`
: （`string`）链接描述内容的纯文本形式。

`Position`
: **（0.160.0 新增）**
: （`string`）链接在页面内容中的位置。

`Text`
: （`template.HTML`）链接的描述内容。

`Title`
: （`string`）链接标题。

字段类型决定了输出时要不要额外处理：`.Text` 是可信 HTML，直接输出即可；`.Destination` 与 `.Title` 是普通字符串，放进 `href` 时要套 `safeURL`（详见[简介](/render-hooks/introduction/#钩子模板输出的三种值类型)）。

## 示例

> [!NOTE]
> 对于图片、链接这类行内元素，应使用 `{{-` 与 `-}}` 定界写法去掉首尾空白，避免在相邻的行内元素与文本之间产生空格。

默认配置下，Hugo 按 [CommonMark](https://spec.commonmark.org/current/) 规范渲染 Markdown 链接。要写出行为一致的渲染钩子：

```go-html-template {file="layouts/_markup/render-link.html"}
<a href="{{ .Destination | safeURL }}"
  {{- with .Title }} title="{{ . }}"{{ end -}}
>
  {{- with .Text }}{{ . }}{{ end -}}
</a>
{{- /* chomp trailing newline */ -}}
```

要为站外链接加上取值为 `external` 的 `rel` 属性：

```go-html-template {file="layouts/_markup/render-link.html"}
{{- $u := urls.Parse .Destination -}}
<a href="{{ .Destination | safeURL }}"
  {{- with .Title }} title="{{ . }}"{{ end -}}
  {{- if $u.IsAbs }} rel="external"{{ end -}}
>
  {{- with .Text }}{{ . }}{{ end -}}
</a>
{{- /* chomp trailing newline */ -}}
```

`urls.Parse` 把目标地址解析成一个 URL 对象，`.IsAbs` 为真表示它是绝对地址（带协议，例如 `https://`）——这正是「站外链接」的判据。相对地址（`/posts/post-1`、`kitten.jpg`）的 `.IsAbs` 为假，不会被加上 `rel="external"`。

### 边界情况

- `.Title` 没写时是空字符串，`{{ with .Title }}` 判假，**不会**输出 `title` 属性——这是期望行为，不要改成 `title="{{ .Title }}"`，否则每个链接都会多出一个空的 `title`；
- `.Text` 也可以为空（例如 `[](/posts/post-1)`），此时 `{{ with .Text }}` 不输出内容，`<a>` 内为空——链接仍然可点，但可访问性很差，属于内容问题而非模板问题；
- `template.HTML` 类型的 `.Text` 里已经包含 Markdown 渲染后的标签（例如 `<em>`），所以**不要**再套 `htmlEscape`，否则页面上会显示出标签本身。

### 本站实际渲染效果

下面这三条链接是**本站页面上真实渲染出来的**，就在这一段正文里，不是代码块里的示意，也不是从构建产物里截下来的字符串：

[看看 figure 那一页](/shortcodes/figure/)——站内链接。

[Hugo 官网](https://gohugo.io/)——站外链接。

[带 title 的链接](/shortcodes/figure/ "图注文字")——站内链接 + 链接标题。

这三条走的是**本站自己的**钩子，也就是上文「示例」里那份模板的**真身**：`themes/hugo-docs-theme/layouts/_markup/render-link.html`。

逐条对账（实测：Hugo 0.167.0，站点构建（`hugo --ignoreCache`）后读 `public/render-hooks/links/index.html`）：

1. **第一条是站内链接，`.Title` 为空。** 页面里它的 `<a>` 只有 `href="/shortcodes/figure/"`，没有 `title`，也没有 `target`、`rel`——因为钩子里那个站外判断（`{{ if or (hasPrefix $dest "http://") (hasPrefix $dest "https://") }}`）不成立：根相对地址不以 `http://` 或 `https://` 开头。
2. **第二条是站外链接，多出两个属性。** 构建产物里它是 `<a href="https://gohugo.io/" target="_blank" rel="noopener">Hugo 官网</a>`：`target="_blank"` 与 `rel="noopener"` 就来自上面那个判断——判据是**目标地址是否以 `http://` 或 `https://` 开头**，与域名、与是不是本站都无关。
3. **第三条带链接标题，仍然没有 `target`、`rel`。** Markdown 里双引号写的 `"图注文字"` 会被解析成链接标题，也就是钩子上下文里的 `.Title`，于是钩子里那句 `{{ with .Title }} title="{{ . }}"{{ end }}` 输出了 `title="图注文字"`。它同样是站内链接，所以后面那个站外判断不成立。**这正好说明「有 title」和「是站外链接」是两件独立的事**：`.Title` 只决定要不要 `title` 属性，站外判断只决定要不要 `target`、`rel`。
4. **站内链接为什么没有那两个属性。** 一句话：本站钩子把「站外」定义为「带 `http://` 或 `https://` 协议前缀」，根相对的 `/shortcodes/figure/` 不在其中。所以判断不成立、两段都不输出。反过来说，本站的钩子**不做解析、不加尾斜杠、也不补语言前缀**——站内地址怎么写，输出就怎么写；地址对不对要在产物里核对（见下文「验证与常见坑」）。

还要分清两件事：**「示例」一节里的两份模板是「怎么写钩子」的示范**（上游给的简化写法，其中一份把站外链接的 `rel` 写成 `external`），而上面这三条链接用的是本站主题自带的那份钩子——它除了给站外链接补 `target` / `rel`，还负责把上游文档里的 `[术语](g)` 写法指到本站术语表（见模板顶部注释与 `partials/glossary-index.html`）。**本站生效的是自定义钩子，内建链接渲染钩子没有参与**，这一点下一节「内建钩子」里有更完整的说明。

## 什么时候用，什么时候别用

**该用**：

- 站外链接统一加 `rel="external"`、`target="_blank"` 等属性；
- 站内链接改写成统一形式（例如补上语言前缀、统一加尾斜杠）；
- 配合页面的 `Fragments` 方法检查锚点是否存在，把坏锚点标记出来；
- 主题需要接管链接渲染，把规则集中到一处。

**别用**：

- 只想改**某几个页面**里的链接——用短代码或直接写 HTML，钩子是全站生效的；
- 只想让链接变个颜色或加下划线——那是 CSS 的事，用钩子反而把简单问题复杂化；
- 站点资源还放在 `static/` 目录里，却想在钩子里硬拼资源路径——正确做法是把资源移到 `assets/`，或按下一节把 `static` 挂载到 `assets`。

**这一条最要紧：只要项目、模块或主题定义了自定义链接渲染钩子，Hugo 就会改用自定义钩子，而不再使用内建链接渲染钩子**（见下一节的规则）。这意味着自定义钩子要自己负责目标地址的解析；「只想加个 `rel` 属性」却顺手把内建的解析能力关掉了，是这一页最常见的翻车方式。

## 内建钩子

Hugo 自带一个内建链接渲染钩子，用于解析 Markdown 链接的目标地址，你可以在项目配置中调整它的行为。默认配置为：

```toml
[markup.goldmark.renderHooks.link]
useEmbedded = 'auto'
```

如上取值为 `auto` 时，Hugo 会自动为多语言单主机项目使用内建链接渲染钩子，具体条件是「共享页面资源复制」功能处于关闭状态；这也是这类项目的默认行为。如果项目、模块或主题定义了自定义链接渲染钩子，则改用自定义钩子。

还可以把该选项配置为 `always`（始终使用内建钩子）、`fallback`（仅作为回退）或 `never`（从不使用）。这四个取值的完整语义见[配置 Markup](/configuration/markup/#goldmark)，要点是：

| 取值 | 何时使用内建钩子 | 有自定义钩子时 |
| --- | --- | --- |
| `auto` | 仅限「多语言单主机 + 关闭共享页面资源复制」的项目 | 用自定义钩子 |
| `fallback` | 仅当没有任何自定义钩子时 | 用自定义钩子 |
| `always` | 总是使用，**即使**已有自定义钩子 | 内建钩子赢 |
| `never` | 从不使用 | 用自定义钩子，没有自定义钩子时链接按原样输出 |

实测（Hugo 0.167，本站）：本站没有多语言，`useEmbedded` 取默认的 `auto`，但主题 `hugo-docs-theme` 提供了 `themes/hugo-docs-theme/layouts/_markup/render-link.html`——按上表 `auto` 一行，实际生效的是**主题的自定义钩子**（它负责把 `[术语](g)` 这种写法指到本站术语表，其余链接补上 `target` 与 `rel`），内建链接钩子并未参与。

内建链接渲染钩子解析站内 Markdown 目标地址时，先查找匹配的页面，再回退到匹配的页面资源，最后回退到匹配的全局资源；远程目标直接透传，无法解析时不会抛出错误或警告。

全局资源必须放在 `assets` 目录中。如果资源放在 `static` 目录且无法或不便迁移，就必须把 `static` 目录挂载到 `assets` 目录，即在项目配置中同时加入下面两项：

```toml
[[module.mounts]]
source = 'assets'
target = 'assets'

[[module.mounts]]
source = 'static'
target = 'assets'
```

> [!NOTE]
> 「无法解析时不会抛出错误或警告」是一句容易被忽略的话：钩子不报错，只代表**构建没失败**，不代表链接是对的。链接是否可用要在产出的 HTML 里核对。

## 验证与常见坑

写完钩子，用[简介里的记号法](/render-hooks/introduction/#怎么确认钩子真的生效)确认它真的被使用：输出里加一个独一无二的 `class`，构建后搜索产出的 HTML。

**你应当看到什么**：站外链接的 `<a>` 上出现了你指定的 `rel` 属性；站内链接与相对地址**没有**被加上该属性；Markdown 原文没有任何改动。

三类典型问题：

| 类别 | 现象 | 原因与修法 |
| --- | --- | --- |
| 钩子没生效 | 没有报错，链接和以前一模一样 | 文件名或位置不对；到[简介的排查表](/render-hooks/introduction/#配错时的典型报错与常见坑)逐条核对 |
| 没报错但结果不对 | 站外链接没加上 `rel`，或者站内链接也被一起加上了 | 判断条件写错：`.IsAbs` 判的是「带协议的绝对地址」，用 `hasPrefix .Destination "http"` 会漏掉 `//example.org` 这类协议相对地址 |
| 没报错但结果不对 | 属性值在页面上显示成 `&#34;` 包围的字面文本 | 用 `printf` 拼属性片段时没套 `safeHTMLAttr`，见[简介的三种值类型](/render-hooks/introduction/#钩子模板输出的三种值类型) |
| 报错看不懂 | 报错带模板文件名与行号 | 模板里的 `{{ if }}`／`{{ with }}` 少了 `{{ end }}`，或用了本钩子没有的字段（链接钩子没有 `.Inner`、`.Anchor`） |

链接相关的其他问题，见[故障排查](/troubleshooting/)与[常见问题](/troubleshooting/faq/)。

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

```md
{{%/* include "/posts/post-2" */%}}
```

渲染 `/posts/post-2` 时触发的任何渲染钩子都会得到：

- 调用 `Page` 时返回 `/posts/post-1`
- 调用 `PageInner` 时返回 `/posts/post-2`

`PageInner` 在不适用时会回退为 `Page` 的值，并且始终有返回值。

> [!NOTE]
> `PageInner` 只对调用 `RenderShortcodes` 方法的短代码有意义，并且必须以 Markdown 记法调用该短代码。

作为实际例子，Hugo 的内建链接渲染钩子与内建图片渲染钩子都使用 `PageInner` 来解析 Markdown 中链接与图片的目标地址。
