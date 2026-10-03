+++
title = "partials.Include"
linkTitle = "Include"
description = "执行给定模板，可选择性地传入上下文。若局部模板包含 return 语句，则返回该语句的值，否则返回渲染输出。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/partials/include/"

[params.functions_and_methods]
signatures = ["partials.Include NAME [CONTEXT]"]
returnType = "any"
aliases = ["partial"]
+++

## 这一页解决什么问题

一个页头、一张卡片、一段商品价格，会在很多模板里重复出现。复制粘贴的后果是：改一处就要改十处，而且改漏了构建不会报错。`partial` 函数把这段 HTML 挪进 `layouts/_partials/` 下的独立文件，用一行调用代替一份拷贝——这是 Hugo 模板里最基本的复用手段。

它同时解决第二个问题：**从一个模板里取值**。给局部模板加上 `return` 语句，`partial` 就不再返回 HTML 字符串，而是返回你指定的任何数据类型（数字、切片、映射），于是「算出一个数再拿去用」也可以封装成局部模板。

## 什么时候用，什么时候别用

**该用**：

- 结构重复的 HTML 片段：`<head>`、导航、页脚、卡片、分页器；
- 片段需要访问当前页面或其它数据 → 通过 `CONTEXT` 传进去（页面、集合、标量、切片、映射都可以）；
- 想把一段计算（求平均、拼字符串、挑元素）封装起来复用 → 用 `return` 语句返回结果；
- 片段内部还要调用同目录或上级目录的局部模板 → 用 `./`、`../` 相对路径。

**别用**：

- 想复用的是**内容**（Markdown 正文片段）而不是模板 → 用[短代码（shortcode）](/shortcodes/)；`partial` 是模板函数，只能写在模板里；
- 片段在一批页面里输出完全相同且渲染很贵 → 用 [`partials.IncludeCached`](/functions/partials/includecached/)；
- 想让 Hugo 按页面类型自动选模板文件 → 那是[模板查找顺序](/templates/lookup-order/)，不属于本函数。

没有 [`return`][] 语句时，`partial` 函数返回 `template.HTML` 类型的字符串。有 `return` 语句时，`partial` 函数可以返回任意数据类型。

下例中有三个*局部模板*：

```tree
layouts/
└── _partials/
    ├── average.html
    ├── breadcrumbs.html
    └── footer.html
```

“average” *局部模板*返回一个或多个数字的平均值。我们通过上下文传入这些数字：

```go-html-template
{{ $numbers := slice 1 6 7 42 }}
{{ $average := partial "average.html" $numbers }}
```

“breadcrumbs” *局部模板*渲染[面包屑导航][breadcrumb navigation]，需要接收当前页面作为上下文：

```go-html-template
{{ partial "breadcrumbs.html" . }}
```

“footer” *局部模板*渲染站点页脚。在这个刻意构造的例子中，页脚无需访问当前页面，因此可以省略上下文：

```go-html-template
{{ partial "footer.html" }}
```

上下文可以传任何内容：页面、页面集合、标量值、切片或 map。下例传入当前页面与三个标量值：

```go-html-template
{{ $ctx := dict
  "page" .
  "name" "John Doe"
  "major" "Finance"
  "gpa" 4.0
}}
{{ partial "render-student-info.html" $ctx }}
```

然后在*局部模板*中：

```go-html-template
<p>{{ .name }} is majoring in {{ .major }}.</p>
<p>Their grade point average is {{ .gpa }}.</p>
<p>See <a href="{{ .page.RelPermalink }}">details.</a></p>
```

要从*局部模板*返回值，请使用 `return` 语句：

```go-html-template
{{ if math.ModBool . 2 }}
  {{ return "even" }}
{{ end }}
{{ return "odd" }}
```

## 相对路径

**（0.167.0 新增）**

在*局部模板*中，以 `./` 或 `../` 开头的路径相对于调用方*局部模板*所在目录解析。例如，给定以下结构：

```tree
layouts/
└── _partials/
    ├── cards/
    │   ├── card.html
    │   └── image.html
    └── footer.html
```

“card” *局部模板*可以这样调用它的同级模板与“footer” *局部模板*：

```go-html-template
{{ partial "./image.html" . }}
{{ partial "../footer.html" . }}
```

仅支持在*局部模板*内部使用相对路径。从其它任何模板调用 `partial "./foo.html"`，或路径解析后落在 `_partials` 目录之外，都会报错。

## 完整示例：传上下文、调用同级模板、取回返回值

五个文件都放在 `layouts/` 下，复制到任意站点即可运行（无需内容文件）：

```go-html-template {file="layouts/_partials/average.html"}
{{ $sum := 0 }}
{{ range . }}{{ $sum = math.Add $sum . }}{{ end }}
{{ return math.Div $sum (len .) }}
```

```go-html-template {file="layouts/_partials/render-student-info.html"}
<p>{{ .name }} is majoring in {{ .major }}.</p>
<p>Their grade point average is {{ .gpa }}.</p>
<p>See <a href="{{ .page.RelPermalink }}">details.</a></p>
```

```go-html-template {file="layouts/_partials/footer.html"}
<footer>Teach demo footer</footer>
```

```go-html-template {file="layouts/_partials/cards/card.html"}
<div class="card">{{ partial "./image.html" . }}{{ partial "../footer.html" . }}</div>
```

```go-html-template {file="layouts/_partials/cards/image.html"}
<img src="x.png" alt="img">
```

在首页模板里调用：

```go-html-template {file="layouts/index.html"}
{{ $numbers := slice 1 6 7 42 }}
<p>平均值：{{ partial "average.html" $numbers }}（类型 {{ printf "%T" (partial "average.html" $numbers) }}）</p>
{{ partial "render-student-info.html" (dict "page" . "name" "John Doe" "major" "Finance" "gpa" 4.0) }}
{{ partial "cards/card.html" . }}
```

Hugo 0.167.0 实测渲染为（空行来自模板自身的换行与局部模板文件末尾的换行，这里原样保留）：

```html

<p>平均值：14（类型 int64）</p>
<p>John Doe is majoring in Finance.</p>
<p>Their grade point average is 4.</p>
<p>See <a href="/">details.</a></p>

<div class="card"><img src="x.png" alt="img">
<footer>Teach demo footer</footer>
</div>

```

**你应当看到什么**：

- 第一行打印 `14`，类型是 `int64` 而不是 `template.HTML`：因为 `average.html` 用了 `return`，返回类型由 `return` 的表达式决定（签名里的 `returnType` 因此写的是 `any`）；
- `gpa` 传的是 `4.0`，输出是 `4`——Go 模板打印浮点数时会去掉多余的 `.0`，需要固定小数位请用 [`fmt.Printf`](/functions/fmt/printf/) 或 `printf "%.1f"`；
- `card.html` 里 `{{ partial "./image.html" . }}` 与 `{{ partial "../footer.html" . }}` 都渲染成功，说明相对路径以**调用方局部模板所在目录**为基准。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 局部模板里没有 `return` | `template.HTML`（可安全嵌入 HTML 的字符串），文件末尾换行会一起进入结果 | 否 |
| 局部模板里有 `return` | 返回该表达式本身的类型（实测 `math.Div` 得到 `int64`，`printf` 得到 `string`） | 否 |
| 省略 `CONTEXT`（只写 `NAME`） | 正常执行，模板里 `.` 为 nil；只用局部变量与全局函数的片段不受影响 | 否 |
| `CONTEXT` 是 `dict` / 切片 / 标量 | 都按原值传入，模板里用 `.` 访问 | 否 |
| `NAME` 指向不存在的模板 | 构建失败：`error calling partial: partial "missing.html" not found` | 是 |
| 从非局部模板调用 `partial "./foo.html"` | 构建失败：`relative partial path "./foo.html" can only be used from within a partial, called from "index.html"` | 是 |
| 相对路径解析到 `_partials` 之外 | 构建失败：`relative partial path "../../evil.html" in "_partials/sub/escape.html" resolves outside the partials directory` | 是 |
| 上下文类型与模板期望不符 | 由局部模板内部的动作决定（例如对非切片做 `range`），错误信息指向局部模板那一行 | 视情况 |
| 不传任何参数（`{{ partial }}`） | 构建失败：`wrong number of args for partial: want at least 2 got 0`（上游未给出，实测；报错里的参数个数比实际写法多算一个，是 Hugo 内部计数方式所致） | 是 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `partial "footer.html" not found` | 文件名或目录写错；`layoutDir` 改过；文件不在 `layouts/_partials/` 下 | 核对路径（partial 的 `NAME` 是相对 `_partials/` 的路径），注意 0.146 之前的老站点可能把 partial 放在 `layouts/partials/` |
| 报错看不懂 | `relative partial path "./x.html" can only be used from within a partial` | `./` 写法只能出现在局部模板里，不能在 `index.html`、`baseof.html` 等模板中使用 | 改成从 `_partials` 起算的普通路径，或把这段逻辑挪进一个局部模板 |
| 报错看不懂 | `can't evaluate field name in type interface {}` | 省略了 `CONTEXT`，但模板里访问了 `.name` 之类的字段（此时 `.` 为 nil） | 调用时补上上下文，例如 `{{ partial "x.html" . }}` 或传 `dict` |
| 没报错但结果不对 | 输出比预期多了空行 | 局部模板文件末尾有换行，`partial` 会原样返回 | 把 `<footer>` 之类的内容压到文件最后一行且不留换行，或接受这点空白 |
| 没报错但结果不对 | 期望拿到数字，结果拿到 HTML 字符串 | 忘了在局部模板里用 `return`，于是返回渲染输出 | 在局部模板中加 `{{ return ... }}`（注意 `return` 之后的内容不会渲染） |
| 没报错但结果不对 | 改了局部模板但页面没变 | 用了 `partialCached` 或页面命中了 Hugo 缓存 | 换用 `partial`，或清理缓存后重跑（`hugo --ignoreCache`） |

更多排查入口见[故障排查](/troubleshooting/)。

[`return`]: /functions/go-template/return/
[breadcrumb navigation]: /content-management/sections/#祖先与后代
