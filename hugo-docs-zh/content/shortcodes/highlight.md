+++
title = "highlight"
linkTitle = "highlight"
description = "用 highlight 短代码插入带语法高亮的代码片段：LANG 与 OPTIONS 两个位置参数、全部选项、可复制示例与实测输出。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/shortcodes/highlight/"

[params.teach]
difficulty = "入门"
time = "10 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0）。",
  "知道围栏代码块的写法（三个反引号 + 语言名），本页大半内容都在与它对照。",
]
outcomes = [
  "说清什么时候该用围栏代码块、什么时候才需要 `highlight` 短代码；",
  "写出带选项的 `highlight` 调用（行号、强调行、内联高亮），并知道参数必须用位置参数；",
  "在 `public/` 里核对高亮的产物结构（`div.highlight` / `code.language-*`），判断语言是否真的生效。",
]
next = ["/content-management/syntax-highlighting/", "/shortcodes/figure/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `highlight` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

> [!NOTE]
> 使用 Markdown [内容格式][]时，很少需要 `highlight` 短代码，因为 Hugo 默认就会对围栏代码块应用语法高亮。
>
> 在 Markdown 中使用 `highlight` 短代码的主要场景，是对行内代码片段应用语法高亮。

## 这一页解决什么问题

Hugo 默认就会高亮围栏代码块，所以这一页要回答的不是「怎么让代码有颜色」，而是**三类围栏代码块解决不了的需求**：

1. **给行内代码加高亮**——反引号包起来的 `code` 默认没有高亮，`highlight` 短代码可以；
2. **让选项跟着数据走**——短代码是模板，选项可以由模板参数拼出来（围栏代码块的信息字符串是静态文本）；
3. **在自定义短代码里复用高亮**——调用 [`transform.Highlight`][] 函数，或在模板中包装 `highlight`。

`highlight` 短代码调用 [`transform.Highlight`][] 函数，根据传入的代码、[语言][]与[选项](#选项)生成带语法高亮的 HTML。

## 参数

`highlight` 短代码接受三个参数，其中**两个必须写成位置参数**（这一点上游文档没有明说，见下面的实测说明）。

```md
{{</* highlight LANG OPTIONS */>}}
CODE
{{</* /highlight */>}}
```

`CODE`
: （`string`）要高亮的代码。写成开闭标记之间的内部内容，不作为参数传入。

`LANG`
: （`string`）代码的[语言][]。取值大小写不敏感。**作为第一个位置参数传入**。

`OPTIONS`
: （`string`）零个或多个用空格分隔、包在引号中的键值对。**作为第二个位置参数传入**。可以为每个选项在[项目配置][]中设置默认值，键名大小写不敏感。

> [!WARNING]
> **实测（Hugo 0.167）**：`LANG` 与 `OPTIONS` 只能写成位置参数。若改写成命名参数，例如 `lang="go" options="linenos=inline"`，Hugo **不报错**，但会把它们当成未识别的参数丢掉，代码退化成无高亮的 `<pre><code>`。看到「高亮突然没了」，先检查有没有写成命名参数。

## 示例

```md {file="content/example.md"}
{{</* highlight go "linenos=inline, hl_lines=3 6-8, style=emacs" */>}}
package main

import "fmt"

func main() {
    for i := 0; i < 3; i++ {
        fmt.Println("Value of i:", i)
    }
}
{{</* /highlight */>}}
```

Hugo 据此渲染出高亮后的 HTML：`LANG` 决定使用哪个词法分析器（lexer），`OPTIONS` 决定行号、强调行与配色等外观。

**你应当看到什么**：产物里这一段变成 `<div class="highlight">`，里面是 `<pre><code class="language-go" data-lang="go">`，代码被切成大量 `<span style="…">`；`linenos=inline` 让每一行前面多出行号，`hl_lines=3 6-8` 让这些行带上背景色。

也可以把 `highlight` 短代码用于行内代码片段：

```md
This is some {{</* highlight go "hl_inline=true" */>}}fmt.Println("inline"){{</* /highlight */>}} code.
```

这一行渲染成：

```html
<p>This is some <code class="code-inline language-go">…</code> code.</p>
```

注意 `hl_inline=true` 换来的不是 `<div class="highlight">`，而是一个行内 `<code class="code-inline language-…">`——这正是它能嵌在句子中间的原因。

考虑到上例写法冗长，如果需要频繁高亮行内代码片段，可以用更短的名字和预设选项创建自己的短代码：

```go-html-template {file="layouts/_shortcodes/hl.html"}
{{ $code := .Inner | strings.TrimSpace }}
{{ $lang := or (.Get 0) "go" }}
{{ $opts := dict "hl_inline" true "noClasses" true }}
{{ transform.Highlight $code $lang $opts }}
```

```md
This is some {{</* hl */>}}fmt.Println("inline"){{</* /hl */>}} code.
```

### 本站实际渲染效果

下面两段是真的用 `highlight` 短代码渲染出来的，可以直接和上文「你应当看到什么」的描述对照：

{{< demo label="块级：linenos=inline、hl_lines=3" >}}
{{< highlight go "linenos=inline, hl_lines=3" >}}
package main

import "fmt"

func main() {
	fmt.Println("hello")
}
{{< /highlight >}}
{{< /demo >}}

同一个短代码加上 `hl_inline=true`，就变成能嵌在句子中间的行内高亮：

{{< demo label="行内：hl_inline=true" >}}
<p>This is some {{< highlight go "hl_inline=true" >}}fmt.Println("inline"){{< /highlight >}} code.</p>
{{< /demo >}}

对照点：上面是 `<div class="highlight">` 包着的块级代码，下面是 `<code class="code-inline language-go">`，只多了一个词法分析器的类名。配色与本站围栏代码块完全一致——`markup.highlight.noClasses = false`，样式来自 `assets/css/syntax.css`。

## 选项

短代码的 `OPTIONS` 参数与围栏代码块的选项一一对应：`anchorLineNos`、`codeFences`、`guessSyntax`、`hl_Lines`、`hl_inline`、`lineAnchors`、`lineNoStart`、`lineNos`、`lineNumbersInTable`、`noClasses`、`style`、`tabWidth`、`wrapperClass`。各选项的含义、类型与默认值见[语法高亮](/content-management/syntax-highlighting/)，那里同时给出了生成外部样式表的 `hugo gen chromastyles` 命令。

几个最常用的：

| 选项 | 作用 | 例 |
| --- | --- | --- |
| `linenos` | 显示行号（`inline` 或 `table`） | `"linenos=inline"` |
| `hl_lines` | 强调指定行 | `"hl_lines=3 6-8"` |
| `hl_inline` | 输出行内高亮 `<code>`，而不是块级 `<div>` | `"hl_inline=true"` |
| `style` | 配色方案名 | `"style=emacs"` |
| `noClasses` | 是否直接写内联样式（`false` 表示用 CSS 类，需要自己提供样式表） | `"noClasses=false"` |
| `lineNoStart` | 起始行号 | `"lineNoStart=10"` |

**实测（Hugo 0.167）**：

- `OPTIONS` 是**一个**字符串参数，多个键值对写在同一个引号里用空格或逗号分隔；写成两个独立参数不会生效。
- 语言名写错（例如 `nosuchlang`）**不报错**：输出 `<pre><code class="language-nosuchlang" data-lang="nosuchlang">`，内容原样、没有颜色。排查「高亮没生效」时先看 `class` 里的语言名是不是你想要的。
- 配合行内模式时，开闭标记之间不能为空——空内容会渲染出一个空的 `<code class="code-inline …">`。

## 什么时候用，什么时候别用

**该用**：

- 行内代码要高亮（围栏代码块做不到）；
- 需要同一段高亮逻辑放进自定义短代码或模板里复用；
- 选项需要由数据决定，例如按页面参数切换配色。

**别用**：

- 普通的块级代码 → **直接用围栏代码块**，写起来短得多，选项完全一样：

  | 需求 | 围栏代码块（信息字符串） | `highlight` 短代码 |
  | --- | --- | --- |
  | 显示行号 | `linenos=inline` | `LANG` + `OPTIONS` 两个位置参数 |
  | 强调某几行 | `hl_lines=[3,"6-8"]` | `"hl_lines=3 6-8"` |
  | 展示文件名 | `file="main.go"` | 不支持，要在外层自己写 |
  | 行内高亮 | 不支持 | `"hl_inline=true"` |

- 代码内容来自文件 → 用 [`os.ReadFile`](/functions/os/readfile/) 一类函数在模板里读取，不必把整段代码抄进正文；
- 只是想让代码里的语法被高亮成静态图或截图 → 与 Hugo 无关。

## 验证方法

1. 在内容里写一个最小调用：

   ```md {file="content/example.md"}
   {{</* highlight go "linenos=inline" */>}}
   fmt.Println("hello")
   {{</* /highlight */>}}
   ```

2. 构建并查看产物：

   ```bash
   hugo
   ```

3. 打开 `public/example/index.html`，搜索 `highlight`。

**你应当看到什么**：出现 `<div class="highlight">…<code class="language-go" data-lang="go">…`；行号来自 `linenos=inline`，应当能看到数字 1。

- 只看到 `<pre tabindex="0"><code>fmt.Println("hello")</code></pre>`（没有 `language-go`）→ 语言没传进去，通常是写成了 `lang=` 命名参数；
- 看到 `language-nosuchlang` → 语言名拼错，Hugo 不报错；
- 看到 `language-go` 但整段没有颜色 → 检查站点是否关掉了高亮，或 `noClasses` 与样式表是否对得上。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 代码没有颜色 | `LANG` 写成了命名参数 `lang="go"`，被当成未识别参数丢弃 | 改成位置参数：`{{</* highlight go "…" */>}}` |
| 没报错但结果不对 | 选项没生效 | `OPTIONS` 写成了多个参数，或没放进同一个引号 | 选项合并为一个字符串，放在语言名之后 |
| 没报错但结果不对 | 行内高亮输出为空 | 开闭标记之间没有内容 | 把要高亮的代码写在中间 |
| 没报错但结果不对 | 颜色变了或整段没样式 | `style` 指定的配色与站点样式表不一致；或 `noClasses=false` 却没有引入 Chroma 样式表 | 见[语法高亮](/content-management/syntax-highlighting/)与 `hugo gen chromastyles` |
| 没报错但结果不对 | 页面上直接显示了短代码的调用原文 | 把文档里的转义写法抄进了正文 | 删掉 `/*` 与 `*/` |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "highlight" not found` | `layouts/_shortcodes/` 下有同名文件但内容有误，或名字拼错 | 删掉自定义文件即恢复内置版本 |
| 报错看不懂 | `unrecognized character in shortcode action: U+0028 '('` 之类 | 在短代码参数里写了 `printf` 一类的函数调用——短代码参数只接受字面量 | 先用模板拼好值，或把选项直接写死在调用里 |

更多排查入口见[故障排查](/troubleshooting/)。

[`transform.Highlight`]: /content-management/syntax-highlighting/
[内容格式]: /content-management/content-formats/
[语言]: /content-management/syntax-highlighting/
[项目配置]: /configuration/
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/highlight.html
