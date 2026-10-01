+++
title = "highlight"
linkTitle = "highlight"
description = "用 highlight 短代码插入带语法高亮的代码片段，并给出全部选项。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/shortcodes/highlight/"
+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `highlight` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

> [!NOTE]
> 使用 Markdown [内容格式][]时，很少需要 `highlight` 短代码，因为 Hugo 默认就会对围栏代码块应用语法高亮。
>
> 在 Markdown 中使用 `highlight` 短代码的主要场景，是对行内代码片段应用语法高亮。

`highlight` 短代码调用 [`transform.Highlight`][] 函数，根据传入的代码、[语言][]与[选项](#选项)生成带语法高亮的 HTML。

## 参数

`highlight` 短代码接受三个参数。

```md
{{</* highlight LANG OPTIONS */>}}
CODE
{{</* /highlight */>}}
```

`CODE`
: （`string`）要高亮的代码。

`LANG`
: （`string`）代码的[语言][]。取值大小写不敏感。

`OPTIONS`
: （`string`）零个或多个用空格分隔、包在引号中的键值对。可以为每个选项在[项目配置][]中设置默认值，键名大小写不敏感。

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

也可以把 `highlight` 短代码用于行内代码片段：

```md
This is some {{</* highlight go "hl_inline=true" */>}}fmt.Println("inline"){{</* /highlight */>}} code.
```

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

## 选项

短代码的 `OPTIONS` 参数与围栏代码块的选项一一对应：`anchorLineNos`、`codeFences`、`guessSyntax`、`hl_Lines`、`hl_inline`、`lineAnchors`、`lineNoStart`、`lineNos`、`lineNumbersInTable`、`noClasses`、`style`、`tabWidth`、`wrapperClass`。各选项的含义、类型与默认值见[语法高亮](/content-management/syntax-highlighting/)，那里同时给出了生成外部样式表的 `hugo gen chromastyles` 命令。

[`transform.Highlight`]: /content-management/syntax-highlighting/
[内容格式]: /content-management/content-formats/
[语言]: /content-management/syntax-highlighting/
[项目配置]: /configuration/
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/highlight.html
