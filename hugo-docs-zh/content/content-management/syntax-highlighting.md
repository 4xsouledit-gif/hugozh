+++
title = "语法高亮"
linkTitle = "语法高亮"
description = "介绍 Hugo 基于 Chroma 的代码块高亮、常用配置项与自定义样式表。"
date = 2026-10-01
weight = 170
source = "https://gohugo.io/content-management/syntax-highlighting/"
+++

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

## 支持的语言

语言标识用于 `transform.Highlight` 函数、`highlight` 短代码与围栏代码块，写标识而不是语言名称：

- `go`、`bash`、`toml`、`yaml`、`json`、`html`、`css`、`md`、`text` 等常用标识；
- 完整清单由 Chroma 提供，可用 `hugo gen chromastyles --help` 或 Chroma 官方仓库查询当前版本收录的语言与别名。

## 相关主题

- [内容管理](/content-management/)
- [短代码](/shortcodes/)
- [配置 Hugo](/configuration/)
