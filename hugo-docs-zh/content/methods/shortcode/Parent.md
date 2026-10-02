+++
title = "Parent"
linkTitle = "Parent"
description = "在嵌套短代码中返回父短代码的上下文。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/shortcode/parent/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Parent"]
returnType = "hugolib.ShortcodeWithPage"
+++

## 这一页解决什么问题

短代码可以嵌套调用（父短代码的内容里又写了子短代码）。子短代码往往需要**父级才有的参数**——例如父级定义了统一的日期格式、语言、主题色，子短代码不想让调用方重复写一遍。

`Parent` 返回父短代码的上下文，于是子短代码可以读 `.Parent.Params`、`.Parent.Name`、`.Parent.Ordinal`，实现「参数从根级继承」。

## 什么时候用，什么时候别用

**该用**：

- 嵌套短代码里要复用父级参数（格式、样式、前缀）；
- 需要在子短代码里区分「我的参数没给」和「父级给了什么」（先看 `.Params`，为空再回退到 `.Parent.Params`）；
- 调试嵌套结构：打印 `.Parent.Name` / `.Parent.Ordinal`。

**别用**：

- 短代码不嵌套 → **`.Parent` 是 `nil`**，直接访问 `.Parent.Params` 会让构建失败（见边界表）；需要兼容顶层调用时先判断；
- 只是想读页面数据 → 用 [`Page`](/methods/shortcode/page/)；
- 想让参数在**多次独立调用**之间共享 → 用 [`Store`](/methods/shortcode/store/)。

这对于从根级继承公共的短代码参数很有用。

在这个刻意构造的示例中，「greeting」短代码是父级，「now」短代码是子级。

```md {file="content/welcome.md"}
{{</* greeting dateFormat="Jan 2, 2006" */>}}
Welcome. Today is {{</* now */>}}.
{{</* /greeting */>}}
```

```go-html-template {file="layouts/_shortcodes/greeting.html"}
<div class="greeting">
  {{ .Inner | strings.TrimSpace | .Page.RenderString }}
</div>
```

```go-html-template {file="layouts/_shortcodes/now.html"}
{{- $dateFormat := "January 2, 2006 15:04:05" }}

{{- with .Params }}
  {{- with .dateFormat }}
    {{- $dateFormat = . }}
  {{- end }}
{{- else }}
  {{- with .Parent.Params }}
    {{- with .dateFormat }}
      {{- $dateFormat = . }}
    {{- end }}
  {{- end }}
{{- end }}

{{- now | time.Format $dateFormat -}}
```

「now」短代码按下面的顺序格式化当前时间：

1. 传给「now」短代码的 `dateFormat` 参数（如果存在）
1. 传给「greeting」短代码的 `dateFormat` 参数（如果存在）
1. 短代码顶部定义的默认布局字符串

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。为了让子短代码的输出保持行内（父级不再包一层 `RenderString`），父级模板写成：

```go-html-template {file="layouts/_shortcodes/greeting.html"}
<div class="greeting">{{ .Inner | strings.TrimSpace }}</div>
```

子短代码 `layouts/_shortcodes/now.html` 与上游一致，只是把结果直接输出：

```go-html-template {file="layouts/_shortcodes/now.html"}
{{- $dateFormat := "January 2, 2006 15:04:05" }}
{{- with .Params }}
  {{- with .dateFormat }}{{- $dateFormat = . }}{{- end }}
{{- else }}
  {{- with .Parent.Params }}
    {{- with .dateFormat }}{{- $dateFormat = . }}{{- end }}
  {{- end }}
{{- end }}
{{- now | time.Format $dateFormat -}}
```

内容里三种调用放在一起对比：

```md {file="content/welcome.md"}
{{</* greeting dateFormat="Jan 2, 2006" */>}}
Welcome. Today is {{</* now */>}}.
{{</* /greeting */>}}

{{</* greeting dateFormat="Jan 2, 2006" */>}}
Welcome. Today is {{</* now dateFormat="2006/01/02" */>}}.
{{</* /greeting */>}}

{{</* greeting */>}}
Welcome. Today is {{</* now */>}}.
{{</* /greeting */>}}
```

Hugo 渲染为（实测；日期是**运行当天**，下面以本机实测结果为例）：

```html
<div class="greeting">Welcome. Today is Oct 3, 2026.</div>
<div class="greeting">Welcome. Today is 2026/10/03.</div>
<div class="greeting">Welcome. Today is October 3, 2026 02:38:39.</div>
```

**你应当看到什么**：三行分别对应继承链的三级——

1. 子短代码没给参数、父级给了 `Jan 2, 2006` → 用父级的格式，输出 `Oct 3, 2026`；
2. 子短代码自己给了 `2006/01/02` → **自己的参数优先**，覆盖父级；
3. 两级都没给 → 用模板顶部的默认格式。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 子短代码里读 `.Parent.Params` | 父短代码的参数（实测能取到父级的 `dateFormat`） | 否 |
| 子短代码里读 `.Parent.Name` / `.Parent.Ordinal` | 父级的模板名与序号（实测 `greeting`、外层序号） | 否 |
| **顶层**调用时读 `.Parent` | `nil`（实测 `not .Parent` 为 `true`） | 否 |
| 顶层调用时读 `.Parent.Params` | —— | 是：`nil pointer evaluating *hugolib.ShortcodeWithPage.Params` |
| 父短代码的内容里含子短代码的输出，父级再做 `RenderString` | 子短代码输出的 HTML 会被再次当 Markdown 处理（上游示例的写法容易在这里出现多余 `<p>`） | 否（但结果可能不是预期） |
| 返回类型 | `hugolib.ShortcodeWithPage` | 否 |

要在顶层也能安全取参数，用 `with` 兜底：

```go-html-template
{{ $dateFormat := "January 2, 2006 15:04:05" }}
{{ with .Params.dateFormat }}
  {{ $dateFormat = . }}
{{ else }}
  {{ with .Parent }}
    {{ with .Params.dateFormat }}{{ $dateFormat = . }}{{ end }}
  {{ end }}
{{ end }}
```

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建失败 | `nil pointer evaluating *hugolib.ShortcodeWithPage.Params` | 短代码在顶层被调用，`.Parent` 是 `nil` | 先 `{{ with .Parent }}` 再读 `.Params` |
| 没报错但结果不对 | 父级参数没被子级继承 | 子短代码的 `.Params` 非空（哪怕只有一个别的参数），`with .Params` 就走了真分支 | 判断具体键：`with .Params.dateFormat`，而不是 `with .Params` |
| 没报错但结果不对 | 父级输出里多出 `<p>` 标签 | 父级把含子短代码输出的 `.Inner` 又交给了 `RenderString` | 父级直接输出 `.Inner`，或子短代码输出行内内容 |
| 没报错但结果不对 | 想做「全局默认值」却不知道该读哪一层 | 继承链只有「自己 → 父级 → 模板里的写死值」三级 | 按上游「用法」一节的顺序写回退 |

更多排查入口见[故障排查](/troubleshooting/)。
