+++
title = "简介"
linkTitle = "简介"
description = "Hugo 模板语法入门：上下文、动作、变量、函数与方法，附可直接运行的最小模板与常见报错对照。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/templates/introduction/"

[params.teach]
difficulty = "进阶"
time = "40–60 分钟"
prereq = [
  "站点能正常构建（`hugo --renderToMemory` 退出码为 0）。",
  "写过一个带前置元数据（front matter）的页面，知道 `content/` 与 `layouts/` 的关系。",
]
outcomes = [
  "解释「上下文」是什么，并在 `range` / `with` 块里用 `$` 取回最外层上下文；",
  "读懂 `{{ … }}` 动作里的字面量、变量、函数、方法与管道，知道管道值会变成最后一个参数；",
  "写出条件、循环、重绑上下文三类常见控制结构，并预判它们的输出；",
  "遇到 `can't evaluate field … in type …` 一类报错时，知道先怀疑上下文而不是语法。",
]
next = ["/templates/types/", "/templates/lookup-order/", "/functions/", "/methods/"]

+++

> [!NOTE]
> Hugo 在 v0.146.0 中彻底重写了模板系统。相关文档正在陆续更新，你可以先阅读[新版模板系统概览](/templates/new-templatesystem-overview/)。

## 这一页解决什么问题

模板用变量、函数与方法把内容、资源与数据转换为发布出去的页面。这一页讲的是**语法底座**：读懂它之后，你在[函数](/functions/)、[方法](/methods/)或任何主题源码里看到一段模板，都能逐行说出它做了什么。

新手在模板上翻车，绝大多数不是「不会写」，而是三件事没理清：

1. **上下文**（`.` 到底代表谁）——`range`、`with` 会把点换掉；
2. **数据形状**——拿到的是标量、切片、映射还是对象，决定你能用 `index`、链式取值还是只能比较；
3. **求值时机**——`if`、`with` 会跳过为假的分支，所以「写错了」往往表现为「什么都不输出」而不是报错。

本页每一段语法都给出可运行的片段与预期输出；文末[常见坑](#常见坑)把三类失败现象集中对照。

## 模板是什么

模板用变量、函数与方法把内容、资源与数据转换为发布出去的页面。Hugo 使用 Go 的 `text/template` 与 `html/template` 包：前者生成文本输出，后者生成对代码注入安全的 HTML 输出。渲染 HTML 文件时，Hugo 默认使用 `html/template`。下面这个模板初始化两个变量，并在段落中显示它们的乘积：

```go-html-template
{{ $v1 := 6 }}
{{ $v2 := 7 }}
<p>The product of {{ $v1 }} and {{ $v2 }} is {{ mul $v1 $v2 }}.</p>
```

HTML 模板最常见，但你可以为任意输出格式创建模板，包括 CSV、JSON、RSS 与纯文本。

## 动手跑一遍：最小可运行模板

先建立一个能立刻看到输出的最小场景。在项目里创建 `layouts/all.html`（`all` 是兜底布局，只要没有更具体的模板命中，所有 HTML 页面都用它渲染）：

```go-html-template {file="layouts/all.html"}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>{{ .Title }}</title>
</head>
<body>
  <h1>{{ .Title }}</h1>
  <p>本站标题：{{ site.Title }}</p>
</body>
</html>
```

构建并查看产物：

```bash
hugo --renderToMemory   # 只渲染，不写 public/：快速确认没有语法错误
hugo                    # 真正构建，产物在 public/ 下
```

### 结果长什么样

`hugo` 之后打开 `public/index.html`（首页），你应当看到标题被替换成了真实的页面标题，而**不是** `{{ .Title }}` 这串字面文本：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>我的站点</title>
</head>
<body>
  <h1>我的站点</h1>
  <p>本站标题：我的站点</p>
</body>
</html>
```

这就是**验证标准**：模板里的动作一定会在产物里消失。如果你在 `public/` 里还能搜到 `{{ .Title }}`，说明这个文件没有被当作模板渲染（多半是放在 `content/` 或 `static/` 里了）。

## 上下文

创建模板之前最需要理解的概念是**上下文**（context），也就是传入每个模板的数据。数据可能是一个简单值，但更常见的是对象及其方法。例如页面模板收到的是 `Page` 对象，它提供返回取值或执行动作的方法。

模板中的点（`.`）表示当前上下文。下例中的点就是 `Page` 对象，调用它的 `Title` 方法返回 front matter 中定义的标题：

```go-html-template {file="layouts/page.html"}
<h2>{{ .Title }}</h2>
```

上下文在模板内部会发生变化，`range` 与 `with` 块会把上下文重新绑定到其他值或对象上：

```go-html-template {file="layouts/page.html"}
<h2>{{ .Title }}</h2>

{{ range slice "foo" "bar" }}
  <p>{{ . }}</p>
{{ end }}

{{ with "baz" }}
  <p>{{ . }}</p>
{{ end }}
```

在 `range` 中，第一次迭代的上下文是 "foo"，第二次是 "bar"；`with` 块内的上下文是 "baz"。Hugo 把它渲染为：

```html
<h2>My Page Title</h2>
<p>foo</p>
<p>bar</p>
<p>baz</p>
```

在 `range` 或 `with` 块内，给点加上美元符号（`$`）即可访问传入模板的那个上下文：

```go-html-template {file="layouts/page.html"}
{{ with "foo" }}
  <p>{{ $.Title }} - {{ . }}</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>My Page Title - foo</p>
```

这里的 `$` 是**模板最外层上下文**的别名，可以理解成「一开始传进来的那个点」。写成 `$.Title` 时取的是页面标题，写成 `.` 时取的是 `with` 绑定进去的 `"foo"`——两者的差别正是新手最容易写错的地方。

> [!NOTE]
> 请务必彻底理解上下文的概念。新手最常犯的模板错误都与上下文有关。

## 动作

成对的花括号表示模板动作的开始与结束，也就是模板内的数据求值或控制结构。动作中可以包含字面量（布尔值、字符串、整数、浮点数）、当前上下文、变量、函数、方法与 `nil` 关键字：

```go-html-template {file="layouts/page.html"}
{{ $convertToLower := true }}
{{ if $convertToLower }}
  <h2>{{ strings.ToLower .Title }}</h2>
{{ end }}
```

上例中，`$convertToLower` 是变量，`true` 是布尔字面量，`if` 是控制结构的开始，`strings.ToLower` 是把字符转为小写的函数，`Title` 是 `Page` 对象上的方法，`end` 是控制结构的结束。

Hugo 渲染上面的例子为（注意动作本身占用的那些行会留下空行）：

```html {trim=false}

    <h2>my page title</h2>

```

### 空白处理

上例的输出带有空行与缩进。生产环境通常会把输出压缩，所以这些空白无关紧要；若要消除相邻空白，可以在动作定界符中加上连字符：

```go-html-template {file="layouts/page.html"}
{{- $convertToLower := true -}}
{{- if $convertToLower -}}
  <h2>{{ strings.ToLower .Title }}</h2>
{{- end -}}
```

Hugo 渲染为：

```html
<h2>my page title</h2>
```

空白包括空格、水平制表符、回车与换行。

`{{-` 表示「吃掉左侧的空白」，`-}}` 表示「吃掉右侧的空白」。这个写法在行内使用模板时尤其重要：短代码模板若可能被写在句子中间，两侧的空白会直接变成正文里的怪空格。

### 引号字符

双引号用于解释型字符串字面量，其中的反斜杠会被当作特殊指令；反引号用于原始字符串字面量，其中的反斜杠与所有字符都按字面处理；单引号用于字符字面量，表示单个字符的 Unicode 数值。实际写模板时几乎用不到字符字面量，需要的基本都是字符串。

```go-html-template
{{ print "Hello world\u0021" }} → Hello world!
{{ print `Hello world\u0021` }} → Hello world\u0021
{{ print '!' }} → 33
```

把这条规则用在文件名与正则上很实用：Windows 路径、正则表达式里的反斜杠很多，用反引号可以少一层转义。

### 管道

在动作中可以把一个值管道传给函数或方法，被管道传入的值会成为该函数或方法的最后一个参数。因此下面两种写法等价：

```go-html-template
{{ strings.ToLower "Hugo" }} → hugo
{{ "Hugo" | strings.ToLower }} → hugo
```

也可以把一个函数或方法的结果继续传给下一个。下面两组写法各自等价：

```go-html-template
{{ strings.TrimSuffix "o" (strings.ToLower "Hugo") }} → hug
{{ "Hugo" | strings.ToLower | strings.TrimSuffix "o" }} → hug
```

```go-html-template
{{ mul 6 (add 2 5) }} → 42
{{ 5 | add 2 | mul 6 }} → 42
```

> [!NOTE]
> 记住：被管道传入的值会成为目标函数或方法的最后一个参数。

### 换行与 nil

一个动作可以拆成多行书写，原始字符串字面量也可以跨行，两者都与写在一行的写法等价：

```go-html-template
{{ $v := or $arg1 $arg2 }}

{{ $v := or
  $arg1
  $arg2
}}
```

```go-html-template
{{ $msg := "This is line one.\nThis is line two." }}

{{ $msg := `This is line one.
This is line two.`
}}
```

`nil` 关键字只能用于比较，不能作为任何函数或方法的参数，也不能赋给变量。下面这些用法是合法的：

```go-html-template
{{ if gt 42 nil }}
  <p>42 is greater than nil</p>
{{ end }}

{{ $pages := where .Site.RegularPages "Params.color" "ne" nil }}
```

而下面这些用法会抛出错误：

```go-html-template
{{ $a := nil }}
{{ add 3 nil }}
{{ nil | print}}
```

第二条与第三条会直接报错，报错信息里会出现 `nil` 字样；看到它时先检查是不是把 `nil` 当参数传了，或者给变量赋了 `nil`。

## 变量

变量是用户定义、以美元符号（`$`）开头的标识符，可以在动作中初始化或赋值，其值可以是标量、切片、映射或对象。用 `:=` 初始化变量，用 `=` 给已初始化的变量赋新值：

```go-html-template
{{ $total := 3 }}
{{ range slice 7 11 21 }}
  {{ $total = add $total . }}
{{ end }}
{{ $total }} → 42
```

在 `if`、`range`、`with` 块内初始化的变量作用域限于该块，在这些块之外初始化的变量作用域是整个模板。变量是切片或映射时，用 `index` 函数取值，注意切片下标从 0 开始：

```go-html-template
{{ $slice := slice "foo" "bar" "baz" }}
{{ index $slice 2 }} → baz

{{ $map := dict "a" "foo" "b" "bar" "c" "baz" }}
{{ index $map "c" }} → baz
{{ $map.c }} → baz
```

变量是映射或对象时，用点依次连接标识符即可取值或访问方法。对象与方法的名称首字母大写；为避免混淆，建议变量名与映射键名以小写字母或下划线开头。

```go-html-template
{{ $homePage := .Site.Home }}
{{ $homePage.Title }} → My Homepage
```

作用域可以用一句话记住：**块内声明的变量出了块就没了**。因此循环里 `:=` 新建的变量不会影响循环外，而循环外声明的变量在循环里要用 `=` 才能改到原值——上面 `$total` 的例子正是靠这一点累加出 42。

## 函数与方法

函数在动作中调用，接收一个或多个参数并返回一个值，不与对象关联。Go 的模板包只提供少量通用函数，Hugo 则按命名空间提供了大量自定义函数，例如 `strings` 命名空间下的这些函数：

| 函数 | 别名 |
| --- | --- |
| `strings.ToLower` | `lower` |
| `strings.ToUpper` | `upper` |
| `strings.Replace` | `replace` |

常用函数有别名，别名与全名完全等价，用它可以让模板更短：

```go-html-template
{{ strings.ToLower "Hugo" }} → hugo
{{ lower "Hugo" }} → hugo
{{ $total := add 1 2 3 4 }}
```

调用函数时，函数名与各参数之间用空格分隔。

方法在动作中调用并与某个对象关联，接收零个或多个参数，返回一个值或执行一个动作。最常用的对象是 `Page` 与 `Site`，下面是一小部分方法：

| 对象 | 方法 | 说明 |
| --- | --- | --- |
| `Page` | `Date` | 返回页面日期 |
| `Page` | `Params` | 返回页面 front matter 中的自定义参数映射 |
| `Page` | `Title` | 返回页面标题 |
| `Site` | `Data` | 返回由 `data` 目录中的文件构成的数据结构 |
| `Site` | `Params` | 返回项目配置中的自定义参数映射 |
| `Site` | `Title` | 返回站点标题 |

用点把方法连接到对象上，开头的点表示当前上下文：

```go-html-template {file="layouts/page.html"}
{{ .Site.Title }} → My Site Title
{{ .Page.Title }} → My Page Title
```

多数模板的上下文就是 `Page` 对象，所以上面的 `.Page.Title` 可以简写为 `.Title`：

```go-html-template {file="layouts/page.html"}
{{ .Site.Title }} → My Site Title
{{ .Title }} → My Page Title
```

有些方法带参数，参数与方法之间同样用空格分隔：

```go-html-template {file="layouts/page.html"}
{{ $page := .Page.GetPage "/books/les-miserables" }}
{{ $page.Title }} → Les Misérables
```

**什么时候用哪个**：只取当前页面的数据就用 `.Title`、`.Params` 这类简写；要跨页面取值（例如在首页列出所有文章）才需要 `.Site.RegularPages`、`.GetPage`。判断依据是「这个数据属于谁」，而不是哪个写法更短。

## 注释

模板注释与动作写法相似，由成对的花括号构成，注释中的代码不会被解析、执行或显示：

```go-html-template
{{/* This is an inline comment. */}}
{{- /* This is an inline comment with adjacent whitespace removed. */ -}}
```

注释可以写成行内形式，也可以写成块形式：

```go-html-template
{{/*
This is a block comment.
*/}}

{{- /*
This is a block comment with
adjacent whitespace removed.
*/ -}}
```

注释不能嵌套。注意不要用 HTML 注释定界符来注释模板代码：Hugo 虽然会在渲染页面时去掉 HTML 注释，但会先求值其中的模板代码，这可能产生意外结果甚至导致构建失败。要输出真正的 HTML 注释，把字符串交给 `safeHTML` 函数：

```go-html-template
{{ "<!-- I am an HTML comment. -->" | safeHTML }}
{{ printf "<!-- This is the %s site. -->" .Site.Title | safeHTML }}
```

**什么时候别用**：临时「注释掉」一段模板调试时，不要用 HTML 注释包裹——里面的 `range`、变量赋值仍会执行。用 `{{/* … */}}` 注释块，或者干脆删掉。

## 引入其他模板

用 `partial` 或 `partialCached` 引入局部模板，用 `template` 引入 Hugo 内置模板。局部模板创建在 `layouts/_partials` 目录中：

```go-html-template
{{ partial "google_analytics.html" . }}
{{ partial "pagination.html" . }}
{{ partial "breadcrumbs.html" . }}
{{ partialCached "css.html" . }}
```

注意这些调用都把当前上下文（点）作为参数传给了被引入的模板。内建（embedded）模板同样通过 `partial` 调用：

```go-html-template
{{ partial "google_analytics.html" . }}
{{ partial "opengraph.html" . }}
{{ partial "pagination.html" . }}
{{ partial "schema.html" . }}
{{ partial "twitter_cards.html" . }}
```

区别只有一点：内建模板不用你自己创建文件，需要在 `layouts/_partials` 下建同名文件才会覆盖它。详见[内建模板](/templates/embedded/)。

## 示例

### 条件块

用 `if`、`else if`、`else` 与 `end` 构成条件分支：

```go-html-template
{{ $var := 42 }}
{{ if eq $var 6 }}
  {{ print "var is 6" }}
{{ else if eq $var 7 }}
  {{ print "var is 7" }}
{{ else if eq $var 42 }}
  {{ print "var is 42" }}
{{ else }}
  {{ print "var is something else" }}
{{ end }}
```

对照着看结果：`$var` 是 42，所以只有第三个分支会执行，输出是 `var is 42`。**分支是按顺序求值的，第一个为真的分支生效**；如果两个条件同时成立，写在前面那个会赢。

### 逻辑运算

`and` 在所有参数都为真时返回真，`or` 在任一参数为真时返回真：

```go-html-template
{{ $v1 := true }}
{{ $v2 := false }}
{{ $v3 := false }}
{{ $result := false }}

{{ if and $v1 $v2 $v3 }}
  {{ $result = true }}
{{ end }}
{{ $result }} → false

{{ if or $v1 $v2 $v3 }}
  {{ $result = true }}
{{ end }}
{{ $result }} → true
```

> [!NOTE]
> `and` 与 `or` 也是函数，**它们的每个参数都会被求值**。因此 `and $page $page.Title` 这样看似安全的写法，在 `$page` 为 `nil` 时仍会报错。要先判空，用 `with $page` 包一层，或者提前算好一个安全的字符串。

### 循环

用 `range` 遍历集合，集合为空时可以用 `else` 分支处理；也可以直接对一个数字循环指定次数：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  <p>{{ . }}</p>
{{ else }}
  <p>The collection is empty</p>
{{ end }}

{{ $s = slice }}
{{ range 3 }}
  {{ $s = $s | append . }}
{{ end }}
{{ $s }} → [0 1 2]
```

第一段输出三个 `<p>`；第二段说明 `range` 的数字形式会依次给出 `0 1 2`，常用来「重复 N 次」。`range` 的 `else` 分支只在集合为空时执行，这是它区别于一般语言 `else` 的地方。

### 重新绑定上下文

`with` 在值为真时把上下文重新绑定到该值，否则执行 `else` 分支：

```go-html-template
{{ $var := "foo" }}
{{ with $var }}
  {{ . }} → foo
{{ else }}
  {{ print "var is falsy" }}
{{ end }}
```

`else with` 可以连续测试多个条件：

```go-html-template
{{ $v1 := 0 }}
{{ $v2 := 42 }}
{{ with $v1 }}
  {{ . }}
{{ else with $v2 }}
  {{ . }} → 42
{{ else }}
  {{ print "v1 and v2 are falsy" }}
{{ end }}
```

`$v1` 是 0，属于假值，所以跳到 `else with $v2`；`$v2` 是 42，进入第二个块，输出 42。这个结构在处理「优先取 A，没有就取 B」的可选字段时非常常用。

### 访问站点参数与页面参数

站点参数通过 `Site` 对象的 `Params` 方法取得。以下面这段项目配置为例：

```toml
title = 'ABC Widgets'
baseURL = 'https://example.org/'
[params]
  subtitle = 'The Best Widgets on Earth'
  copyright-year = '2023'
  [params.author]
    email = 'jsmith@example.org'
    name = 'John Smith'
  [params.layouts]
    rfc_1123 = 'Mon, 02 Jan 2006 15:04:05 MST'
    rfc_3339 = '2006-01-02T15:04:05-07:00'
```

逐级连接标识符即可访问这些自定义站点参数：

```go-html-template
{{ .Site.Params.subtitle }} → The Best Widgets on Earth
{{ .Site.Params.author.name }} → John Smith

{{ $layout := .Site.Params.layouts.rfc_1123 }}
{{ .Site.Lastmod.Format $layout }} → Tue, 17 Oct 2023 13:21:02 PDT
```

页面参数通过 `Page` 对象的 `Params` 方法取得。`title`、`date` 等是标准的 front matter 字段，其余为用户自定义字段。以下面这段页面前置元数据为例：

```toml
title = 'Annual conference'
date = 2023-10-17T15:11:37-07:00
[params]
display_related = true
key-with-hyphens = 'must use index function'
[params.author]
  email = 'jsmith@example.org'
  name = 'John Smith'
```

在模板里取值：

```go-html-template
{{ .Params.display_related }} → true
{{ .Params.author.email }} → jsmith@example.org
{{ .Params.author.name }} → John Smith
```

键名必须是合法标识符（例如不能含连字符）才能这样连接取值；否则要用 `index` 函数：

```go-html-template
{{ index .Params "key-with-hyphens" }} → must use index function
```

### 结果的边界：取不到值会怎样

这是判断「写错了」还是「本来就没有」的关键，可以自己动手验证：

| 写法 | 数据不存在时的结果 | 是否报错 |
| --- | --- | --- |
| `{{ .Params.missing }}` | 输出空字符串 | 否 |
| `{{ with .Params.missing }}…{{ end }}` | 整块跳过 | 否 |
| `{{ .Params.missing.deeper }}` | `nil` 上继续取字段 | **是**（形如 `nil pointer evaluating`） |
| `{{ index .Params "missing" }}` | 输出空字符串 | 否 |
| `{{ .Params | len }}`（对 `nil` 求长度） | 视函数而定，多数返回 0 | 否 |

所以「页面某块内容消失了」通常不是错误，而是某个 `if` / `with` 判空后跳过了；而「报错看不懂」里出现 `nil pointer` 字样，几乎一定是链式取值走到了一个空值上。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` → [安装 Hugo](/installation/) |
| 没报错但结果不对 | `range` 里写 `{{ .Title }}`，输出全是空白 | `range` 把上下文换成了元素，页面对象要用 `$.Title` 取回 → 见本页[上下文](#上下文) |
| 没报错但结果不对 | 模板文件里的 `{{ … }}` 原样出现在页面上 | 文件没放在 `layouts/` 下（放进了 `content/`、`static/`），或没被查找规则命中 → [模板查找顺序](/templates/lookup-order/) |
| 没报错但结果不对 | 某个字段在页面上是空的 | 数据本来就不存在（`Params` 里没有这个键，或 front matter 缩进写错被当成正文）→ 见「结果的边界」 |
| 报错看不懂 | `can't evaluate field Title in type string` | 用错了上下文类型：当前的点是字符串，不是页面 → 用 `$` 回到外层 |
| 报错看不懂 | 报错里出现 `nil pointer evaluating` | 在一串链式取值中间遇到了 `nil` → 用 `with` 逐层判空 |
| 报错看不懂 | `unexpected EOF` / `missing end` | 动作或控制结构没闭合（少了 `end`、少了 `}}`）→ 用 `hugo --renderToMemory` 定位到具体文件 |

更多排查入口见[故障排查](/troubleshooting/)。
