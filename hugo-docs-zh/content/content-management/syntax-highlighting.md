+++
title = "语法高亮"
linkTitle = "语法高亮"
description = "Hugo 基于 Chroma 的代码块高亮、常用配置项与自定义样式表；含配置位置、构建验证方法与转义陷阱。"
date = 2026-10-01
weight = 170
source = "https://gohugo.io/content-management/syntax-highlighting/"

[params.teach]
difficulty = "进阶"
time = "15–25 分钟"
prereq = [
  "会写围栏代码块，知道项目配置 `hugo.toml` 在哪。",
  "有一个能查看产物 HTML 或页面源码的环境，改完能立刻比对。",
]
outcomes = [
  "在围栏代码块上使用行号、强调行与配色等选项，并知道默认值写在哪里；",
  "把高亮从内联样式切换成 class + 自建样式表，并生成对应的 CSS；",
  "正确转义短代码示例，避免整站构建失败；",
  "解释「代码块没有颜色」「行号不显示」这两类现象。",
]
next = ["/configuration/markup/", "/shortcodes/", "/functions/transform/highlight/"]

+++

## 这一页解决什么问题

Hugo 用 Chroma 完成语法高亮（syntax highlighting），提供三条途径：在模板中调用 `transform.Highlight` 函数、在任何内容格式中使用 `highlight` 短代码（shortcode），以及在 Markdown 内容格式中使用围栏代码块（code fence）。日常写作以第三种为主。

高亮本身不需要配置就能用；会踩坑的是它的两个「开关」和一条「铁律」：

1. **配置写在哪**——所有高亮默认值都在项目配置的 `[markup.highlight]` 区段里，围栏选项与配置键同名；
2. **`noClasses` 决定样式的来源**——默认 `true` 时 Hugo 把颜色内联进 HTML，开箱即用；改成 `false` 后只输出 class，**站点必须自己提供 CSS**，否则代码块会变成一片没有颜色的文本；
3. **短代码示例必须转义**——Hugo 在 Markdown 解析之前就提取短代码，未转义的示例会让**整个站点**构建失败（见[转义短代码定界符](#转义短代码定界符)）。

**验证高亮是否生效**：在任意页面写一个围栏代码块，构建后查看产物 HTML。

```bash
hugo
```

**你应当看到什么**：产物 HTML 里代码被包在 `<div class="highlight">` 之类的最外层元素里（类名由 `wrapperClass` 决定，默认 `highlight`），代码的每个记号带 `<span>` 与颜色或 `class`。如果产物里只有 `<pre><code>`、没有任何 `span`，说明这块代码没有走 Chroma——通常是语言标识缺失或不受支持（默认按纯文本输出，见 [LANG](#围栏代码块) 的说明）。

用 `hugo config` 可以确认高亮的最终生效配置：

```bash
hugo config | findstr /C:"highlight"      # Windows
hugo config | grep -A20 highlight        # macOS / Linux
```

**实测（Hugo 0.167，本站）**：本站 `hugo.toml` 里设的是 `markup.highlight.noClasses = false`（即使用 class 而非内联样式），主题自带 `assets/css/syntax.css` 提供对应的配色样式表，并被打包进产物（产物里能看到 `css/syntax.min.<哈希>.css`）。也就是说，本页[生成样式表](#生成样式表)一节描述的正是**本站已经在用的模式**——本站不需要再额外生成 CSS；你自己新建站点并改成 class 模式时，才需要补这一步。

## 三种高亮方式

Hugo 用 Chroma 完成语法高亮（syntax highlighting），提供三条途径：在模板中调用 `transform.Highlight` 函数、在任何内容格式中使用 `highlight` 短代码（shortcode），以及在 Markdown 内容格式中使用围栏代码块（code fence）。日常写作以第三种为主。

`highlight` 短代码内部调用的正是这个函数，它根据传入的代码、语言与选项生成高亮后的 HTML。

Markdown 内容格式下，围栏代码块默认就会高亮，因此 `highlight` 短代码很少用到，它主要用来给行内代码片段着色。

## 围栏代码块

默认配置下，Hugo 会高亮如下形式的代码块：

````markdown
```LANG [OPTIONS]
CODE
```
````

- `CODE`：要高亮的代码。
- `LANG`：语言标识，取自[支持的语言](#支持的语言)，大小写不敏感。省略或不受支持时按纯文本输出，不做高亮——与 CommonMark 规范一致，只有已知的语言标识才会触发语义层面的高亮。
- `OPTIONS`：零个或多个键值对，用空格或逗号分隔并包在花括号中，键名大小写不敏感；默认值写在项目配置里。

例如：

````markdown
```go {linenos=inline hl_lines=[3,"6-8"] style=emacs}
package main

import "fmt"

func main() {
    for i := 0; i < 3; i++ {
        fmt.Println("Value of i:", i)
    }
}
```
````

**你应当看到什么**：行号 3（`import "fmt"`）与 6–8 行会带上强调样式，行号显示在代码左侧（`linenos=inline`），配色是 `emacs`。**选项值有两种写法**：`hl_lines` 在项目配置里是空格分隔的字符串（`hl_Lines = "2-4 7"`），在围栏里既可以写 `[3,"6-8"]` 数组，也可以写 `"3 6-8"` 字符串，两者等价。

## 配置项

高亮行为由配置文件的 `[markup.highlight]` 区段控制，键名即围栏选项名，可参考[配置 Hugo](/configuration/)：

| 配置键 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `anchorLineNos` | 布尔 | `false` | 行号是否渲染为锚点元素，即把所在 `span` 的 `id` 设为行号；`lineNos` 为 `false` 时无意义 |
| `codeFences` | 布尔 | `true` | 是否高亮围栏代码块 |
| `guessSyntax` | 布尔 | `false` | 语言标识留空或对应词法分析器（lexer）不存在时是否自动识别语言，识别失败则回退为纯文本 |
| `hl_Lines` | 字符串 | 空 | 需要强调的行号，空格分隔，例如 `2-4 7` 表示强调第 2、3、4、7 行，与 `lineNoStart` 无关 |
| `hl_inline` | 布尔 | `false` | 是否渲染不带外层容器的行内高亮代码 |
| `lineAnchors` | 字符串 | 空 | 行号作锚点时附加在 `id` 前的前缀，用于同一页面存在多个代码块时区分；`lineNos` 或 `anchorLineNos` 为 `false` 时无意义 |
| `lineNoStart` | 整数 | `1` | 第一行显示的行号 |
| `lineNos` | 任意 | `false` | 行号显示方式：`true` 按 `lineNumbersInTable` 决定，`false` 关闭，`inline` 行内显示，`table` 表格列显示 |
| `lineNumbersInTable` | 布尔 | `true` | 是否用两列表格渲染，左列行号、右列代码 |
| `noClasses` | 布尔 | `true` | `true` 输出内联样式，`false` 输出 class 并需自行提供样式表 |
| `style` | 字符串 | `monokai` | 配色方案名称，大小写不敏感 |
| `tabWidth` | 整数 | `4` | 每个制表符替换为多少个空格；`noClasses` 为 `false` 时无意义 |
| `wrapperClass` | 字符串 | `highlight` | 最外层元素使用的类名 |

注意 `guessSyntax` 的适用范围：Chroma 收录约 300 种语言的词法分析器，其中只有 5 种实现了自动语言识别。

## 生成样式表

把 `noClasses` 设为 `false` 后，Hugo 不再内联样式，而是为每个记号输出 class，站点必须自己提供 CSS，否则代码块会失去配色。样式表可用内置命令生成：

```bash
hugo gen chromastyles --style=github > assets/css/highlight.css
```

部分配色方案同时提供浅色与深色两套调色板，可以用 `--mode` 指定其中之一，并用 `--modeSelector` 把选择器统一收在顶层模式类（例如 `.dark .chroma`）之下：

```bash
hugo gen chromastyles --style=monokai --mode=light > assets/css/highlight.css
hugo gen chromastyles --style=monokai --mode=dark --modeSelector > assets/css/highlight-dark.css
```

之后只需在根元素上增删 `dark` 类即可切换深色模式；省略 `--mode` 时按方案自身的默认模式生成。也可以在模板中改用 `css.ChromaStyles` 函数生成样式表。生成的 CSS 既可以作为普通样式表引入，也可以交给资源管道（asset pipeline）与主样式表一起打包。

## 转义短代码定界符

在正文中书写短代码示例时，必须用 Hugo 的转义写法，否则短代码会在 Markdown 解析之前被提取，直接导致构建失败。转义的做法是把注释标记 `/*` 与 `*/` 插进定界符之间：

````markdown
```text {linenos=inline}
{{</*/* shortcode-1 */*/>}}

{{%/*/* shortcode-2 */*/%}}
```
````

上例渲染出的正是形如 `{{</* shortcode-1 */>}}` 与 `{{%/* shortcode-2 */%}}` 的转义文本——它们展示的是短代码的长相，而不会在构建时真的执行。注意这段示例本身就写在围栏代码块里，而其中的嵌套转义仍然被解析：**围栏代码块并不豁免短代码提取**，正文里凡是出现短代码写法的地方（包括行内代码与围栏代码块中的示例）都必须转义。`highlight` 短代码的调用形式是 `{{</* highlight go "linenos=inline, hl_lines=3 6-8, style=emacs" */>}}` … `{{</* /highlight */>}}`，参数与围栏选项一一对应，用法见[短代码](/shortcodes/)。

{{< note type="warning" title="未转义不是单页问题" >}}
Hugo 在 Markdown 解析**之前**就提取短代码。一旦定界符未转义，Hugo 会去找同名短代码模板；找不到就报 `failed to extract shortcode`，**整个站点构建失败**，而不只是这一页。
{{< /note >}}

## 支持的语言

语言标识用于 `transform.Highlight` 函数、`highlight` 短代码与围栏代码块，写标识而不是语言名称：

- `go`、`bash`、`toml`、`yaml`、`json`、`html`、`css`、`md`、`text` 等常用标识；
- 完整清单由 Chroma 提供，可用 `hugo gen chromastyles --help` 或 Chroma 官方仓库查询当前版本收录的语言与别名。

## 什么时候用哪种高亮方式

| 情形 | 该用 | 理由 |
| --- | --- | --- |
| Markdown 正文里的代码示例（绝大多数情况） | 围栏代码块 | 零配置，写作时就地生效 |
| 行内的一句代码需要着色 | `highlight` 短代码 | 围栏代码块只能整块用；短代码可以嵌在句子中间 |
| 高亮结果来自变量、数据或循环 | `transform.Highlight` 函数 | 只有函数能处理运行时才知道的代码文本 |
| 站点需要跟随主题切换深浅配色 | `noClasses = false` + 自建样式表 | 样式表可以按模式切换，内联样式做不到 |
| **别用**：`noClasses = false` 却不引入样式表 | —— | 代码块会失去全部配色，看起来像高亮坏了，实际是少了 CSS |
| **别用**：把语言标识留空又指望有颜色 | —— | 与 CommonMark 一致，只有已知语言标识才触发高亮；留空按纯文本输出 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建失败 | `failed to extract shortcode: template for shortcode "…" not found`，且报错位置像在别处 | 正文里写了**未转义**的短代码示例；Hugo 在 Markdown 之前提取短代码，找不到模板就中止整站构建 | 把示例改写成 `{{</* name */>}}` 形式；要展示转义写法本身时用 `{{</*/* name */*/>}}`，见[转义短代码定界符](#转义短代码定界符) |
| 没报错但结果不对 | 代码块完全没有颜色 | 语言标识缺失或拼错（按纯文本输出）；或 `noClasses = false` 而没有引入生成的样式表 | 补上正确标识；生成并引入 CSS，见[生成样式表](#生成样式表) |
| 没报错但结果不对 | 设了 `lineNos` 却看不到行号 | 行号需要代码块本身有内容行；`lineNos = true` 还受 `lineNumbersInTable` 影响（默认用两列表格渲染） | 显式写 `lineNos = "inline"` 或 `"table"`；用产物 HTML 确认 `<table>` 是否生成 |
| 没报错但结果不对 | 同一页多个代码块的行号锚点互相冲突 | 没有给 `lineAnchors` 设前缀，`id` 重复 | 设 `lineAnchors` 与 `anchorLineNos = true`，让每个块的锚点带独立前缀 |
| 没报错但结果不对 | 制表符缩进的代码对齐错乱 | `tabWidth` 与编辑器制表符宽度不一致 | 调整 `tabWidth`（默认 4），或统一用空格缩进 |
| 没报错但结果不对 | 改了 `style` 但配色没变 | 实际生效的是 `[markup.highlight]` 里的值，内容里的围栏选项没写；或 `noClasses = false` 时配色由样式表决定，与 `style` 无关 | 用 `hugo config` 核对；改 class 模式后要重新生成样式表 |

更多排查入口见[故障排查](/troubleshooting/)。

## 相关主题

- [内容管理](/content-management/)
- [短代码](/shortcodes/)
- [配置 Hugo](/configuration/)
