+++
title = "collections.Where"
linkTitle = "where"
description = "按指定的 key、运算符和值筛选给定切片，返回满足条件的元素。"
date = 2026-10-02
weight = 280
source = "https://gohugo.io/functions/collections/where/"

[params.functions_and_methods]
signatures = ["collections.Where SLICE KEY [OPERATOR] VALUE"]
returnType = "[]any"
aliases = ["where"]
+++

## 这一页解决什么问题

模板里最常见的一类需求是「从这个集合里挑出满足条件的那些」。Go 模板没有 `filter` 那样的语法糖，`where` 就是标准答案：传入一个切片、一个 key、一个运算符和一个值，它返回满足条件的元素（不满足的被丢掉，原集合不变）。

典型场景：从全部页面里挑出某个 section 的文章、从 `hugo.Data` 读入的数据里挑出某个类型的条目、按页面参数筛出「相关文章」。

**读懂本页的诀窍**：把 `KEY` 想成字段路径，`OPERATOR` 想成比较符，`VALUE` 想成比较对象。三者类型对不上时，`where` 通常**不报错，只是返回空结果**——所以「筛不出东西」几乎都能在类型上找到原因（见下文「完整示例」「返回值边界」「常见坑」）。

## 什么时候用，什么时候别用

**该用**：

- 条件能拆成「字段 · 运算符 · 值」三要素：`Section`、`Type`、`Params.*`、映射键都可以；
- 需要把结果继续交给 `range`、`len`、`first`、`sort` 处理——`where` 返回的就是切片；
- 想叠加多个条件：连续调用 `where`，或写成嵌套调用（见下文「嵌套比较」）。

**别用**：

- 条件算不出来（要比较两个字段的运算结果、先 `time.Format` 再比较、要看正则捕获组）→ 用 `range` 遍历加 `if` 筛选，下文「自定义日期」一节给出的正是这种写法；
- 目的是集合减法（从 A 中排除 B）→ 用 [`collections.Complement`](/functions/collections/complement/)；
- 想排序或限量 → `where` 只管筛选；排序用 [`collections.Sort`](/functions/collections/sort/)，取前几个用 [`collections.First`](/functions/collections/first/)；
- 想判断「字段存在与否」的布尔语义 → 直接用 `nil` 比较（见下文「nil 比较」与「布尔值/未定义值比较」），不要用 `"eq" true` 去猜。

## 用法

`where` 函数返回给定切片，并移除不满足比较条件的元素。比较条件由 `KEY`、`OPERATOR` 和 `VALUE` 三个参数构成：

```text
collections.Where SLICE KEY [OPERATOR] VALUE
                        --------------------
                        比较条件
```

如果不提供 `OPERATOR` 参数，Hugo 会按相等进行比较。例如：

```go-html-template
{{ $pages := where .Site.RegularPages "Section" "books" }}
{{ $books := where hugo.Data.books "genres" "suspense" }}
```

### 参数

where 函数接收三到四个参数。`OPERATOR` 参数是可选的。

`SLICE`
: （`[]any`）一个[页面集合](g)，或由[映射](g)构成的[切片](g)。

`KEY`
: （`string`）用于与 `VALUE` 比较的页面或映射值的 key。对于页面集合，常用的比较 key 有 `Section`、`Type` 和 `Params`。要与页面 `Params` 映射中的成员比较，请按下文所示[链式](g)书写子 key：

  ```go-html-template
  {{ $result := where .Site.RegularPages "Params.foo" "bar" }}
  ```

`OPERATOR`
: （`string`）逻辑比较[运算符](#运算符)。

`VALUE`
: （`any`）用于比较的值。参与比较的值必须具有可比较的数据类型。例如：

比较|结果
:--|:--
`"123" "eq" "123"`|`true`
`"123" "eq" 123`|`false`
`false "eq" "false"`|`false`
`false "eq" false`|`true`

当参与比较的值之一是切片（或两者都是）时，请按下文所述使用 `in`、`not in` 或 `intersect` 运算符。

### 运算符

可使用以下任一逻辑运算符：

`=`, `==`, `eq`
: （`bool`）判断给定字段值是否等于 `VALUE`。

`!=`, `<>`, `ne`
: （`bool`）判断给定字段值是否不等于 `VALUE`。

`>=`, `ge`
: （`bool`）判断给定字段值是否大于或等于 `VALUE`。

`>`, `gt`
: `true` 判断给定字段值是否大于 `VALUE`。

`<=`, `le`
: （`bool`）判断给定字段值是否小于或等于 `VALUE`。

`<`, `lt`
: （`bool`）判断给定字段值是否小于 `VALUE`。

`in`
: （`bool`）判断给定字段值是否为 `VALUE` 的成员。比较字符串与切片，或字符串与字符串。

`not in`
: （`bool`）判断给定字段值是否不是 `VALUE` 的成员。比较字符串与切片，或字符串与字符串。

`intersect`
: （`bool`）判断给定字段值（一个切片）是否与 `VALUE` 有一个或多个共同元素。

`like`
: （`bool`）判断给定字段值是否匹配 `VALUE` 中指定的[正则表达式](g)。用 `like` 运算符比较 `string` 值。用其他数据类型与正则表达式比较时，`like` 运算符返回 `false`。

## 示例

以下示例演示了使用各种运算符和数据类型的比较。

> [!NOTE]
> 下面的示例是在页面集合内进行比较，但同样的比较也适用于映射切片。

### 字符串比较

将给定字段的值与 [`string`](g) 比较：

```go-html-template
{{ $pages := where .Site.RegularPages "Section" "eq" "books" }}
{{ $pages := where .Site.RegularPages "Section" "ne" "books" }}
```

### 数值比较

将给定字段的值与 [`int`](g) 或 [`float`](g) 比较：

```go-html-template
{{ $books := where site.RegularPages "Section" "eq" "books" }}

{{ $pages := where $books "Params.price" "eq" 42 }}
{{ $pages := where $books "Params.price" "ne" 42.67 }}
{{ $pages := where $books "Params.price" "ge" 42 }}
{{ $pages := where $books "Params.price" "gt" 42.67 }}
{{ $pages := where $books "Params.price" "le" 42 }}
{{ $pages := where $books "Params.price" "lt" 42.67 }}
```

### 布尔比较

将给定字段的值与 [`bool`](g) 比较：

```go-html-template
{{ $books := where site.RegularPages "Section" "eq" "books" }}

{{ $pages := where $books "Params.fiction" "eq" true }}
{{ $pages := where $books "Params.fiction" "eq" false }}
{{ $pages := where $books "Params.fiction" "ne" true }}
{{ $pages := where $books "Params.fiction" "ne" false }}
```

### 成员比较

将 [`scalar`](g) 与 [`slice`](g) 比较。

例如，要返回 `color` 页面参数为 "red" 或 "yellow" 的页面切片：

```go-html-template
{{ $fruit := where site.RegularPages "Section" "eq" "fruit" }}

{{ $colors := slice "red" "yellow" }}
{{ $pages := where $fruit "Params.color" "in" $colors }}
```

要返回 `color` 页面参数既不是 `red` 也不是 `yellow` 的页面切片：

```go-html-template
{{ $fruit := where site.RegularPages "Section" "eq" "fruit" }}

{{ $colors := slice "red" "yellow" }}
{{ $pages := where $fruit "Params.color" "not in" $colors }}
```

### 交集比较

将 `slice` 与 `slice` 比较，返回具有共同值的元素。这在比较分类法（taxonomy）术语时经常用到。

例如，要返回 `genres` 分类法中的任一术语为 "suspense" 或 "romance" 的页面切片：

```go-html-template
{{ $books := where site.RegularPages "Section" "eq" "books" }}

{{ $genres := slice "suspense" "romance" }}
{{ $pages := where $books "Params.genres" "intersect" $genres }}
```

### 正则表达式比较

要返回 `author` 页面参数以 "victor" 或 "Victor" 开头的页面切片：

```go-html-template
{{ $pages := where .Site.RegularPages "Params.author" "like" `(?i)^victor` }}
```

指定正则表达式时，请使用原始[字符串字面量][string literal]（反引号）而不是解释型字符串字面量（双引号），以简化语法。使用解释型字符串字面量时，必须转义反斜杠。

Go 的正则表达式包实现了 [RE2 语法][RE2 syntax]。大致来说，RE2 语法是 [PCRE][] 所接受语法的一个子集，并且有若干[注意事项][caveats]。注意不支持 RE2 的 `\C` 转义序列。

[PCRE]: https://www.pcre.org/
[RE2 syntax]: https://github.com/google/re2/wiki/Syntax/
[caveats]: https://swtch.com/~rsc/regexp/regexp3.html#caveats
[string literal]: https://go.dev/ref/spec#String_literals

> [!NOTE]
> 用 `like` 运算符比较字符串值。比较其他数据类型会得到空切片。

### 日期比较

比较预定义的前置元数据（front matter）日期，或自定义的前置元数据日期。

#### 预定义日期

有四个预定义的前置元数据日期：[`date`][]、[`publishDate`][]、[`lastmod`][] 和 [`expiryDate`][]。无论前置元数据采用哪种数据格式（TOML、YAML 还是 JSON），它们都是 [`time.Time`][] 值，因此可以精确比较。

例如，要返回在当前年份之前创建的页面切片：

```go-html-template
{{ $startOfYear := time.AsTime (printf "%d-01-01" now.Year) }}
{{ $pages := where .Site.RegularPages "Date" "lt" $startOfYear }}
```

#### 自定义日期

对于自定义的前置元数据日期，比较方式取决于前置元数据的数据格式（TOML、YAML 或 JSON）。

> [!NOTE]
> 让含自定义前置元数据日期的页面使用 TOML，就能实现精确的日期比较。

使用 TOML 时，日期值是一等公民。TOML 有日期数据类型，而 JSON 和 YAML 没有。如果给 TOML 日期加上引号，它就是字符串；如果不加引号，它就是 [`time.Time`][] 值，可以精确比较。

在下面的 TOML 示例中，注意事件日期没有加引号。

```md {file="content/events/2024-user-conference.md"}
+++
title = '2024 User Conference"
eventDate = 2024-04-01
+++
```

要返回未来事件的切片：

```go-html-template
{{ $events := where .Site.RegularPages "Type" "events" }}
{{ $futureEvents := where $events "Params.eventDate" "gt" now }}
```

使用 YAML 或 JSON，或者使用加了引号的 TOML 值时，自定义日期是字符串，无法与 `time.Time` 值比较。如果自定义日期的格式在各页面之间保持一致，也许可以用字符串比较。稳妥的做法是遍历切片来筛选页面：

```go-html-template
{{ $events := where .Site.RegularPages "Type" "events" }}
{{ $futureEvents := slice }}
{{ range $events }}
  {{ if gt (time.AsTime .Params.eventDate) now }}
    {{ $futureEvents = $futureEvents | append . }}
  {{ end }}
{{ end }}
```

### nil 比较

要返回前置元数据中存在 "color" 参数的页面切片，可与 `nil` 比较：

```go-html-template
{{ $pages := where .Site.RegularPages "Params.color" "ne" nil }}
```

要返回前置元数据中不存在 "color" 参数的页面切片，可与 `nil` 比较：

```go-html-template
{{ $pages := where .Site.RegularPages "Params.color" "eq" nil }}
```

上面两个示例中，注意 `nil` 都没有加引号。

### 嵌套比较

下面两种写法等价：

```go-html-template
{{ $pages := where .Site.RegularPages "Type" "tutorials" }}
{{ $pages = where $pages "Params.level" "eq" "beginner" }}
```

```go-html-template
{{ $pages := where (where .Site.RegularPages "Type" "tutorials") "Params.level" "eq" "beginner" }}
```

### 可移植的 section 比较

这一点对主题作者很有用：使用 `where` 函数配合 `Site` 对象上的 [`MainSections`][] 方法，可以避免硬编码 section 名称。

```go-html-template
{{ $pages := where .Site.RegularPages "Section" "in" .Site.MainSections }}
```

用这种写法，主题作者可以要求用户在自己的项目配置中指定主要 section：

```toml
mainSections = ['blog','galleries']
```

如果项目配置中没有定义 `mainSections`，`MainSections` 方法会返回只含一个元素的切片——即页面最多的顶级 section。

### 布尔值/未定义值比较

考虑下面这样的项目结构：

```tree
content/
├── posts/
│   ├── _index.md
│   ├── post-1.md  <-- 前置元数据：exclude = false
│   ├── post-2.md  <-- 前置元数据：exclude = true
│   └── post-3.md  <-- 前置元数据：未定义 exclude
└── _index.md
```

前两个页面的前置元数据中有 "exclude" 字段，最后一个页面没有。测试_相等_时，第三个页面会被_排除_在结果之外；测试_不等_时，第三个页面会被_包含_在结果之中。

#### 相等测试

该模板：

```go-html-template
<ul>
  {{ range where .Site.RegularPages "Params.exclude" "eq" false }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

渲染为：

```html
<ul>
  <li><a href="/posts/post-1/">Post 1</a></li>
</ul>
```

该模板：

```go-html-template
<ul>
  {{ range where .Site.RegularPages "Params.exclude" "eq" true }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

渲染为：

```html
<ul>
  <li><a href="/posts/post-2/">Post 2</a></li>
</ul>
```

#### 不等测试

该模板：

```go-html-template
<ul>
  {{ range where .Site.RegularPages "Params.exclude" "ne" false }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

渲染为：

```html
<ul>
  <li><a href="/posts/post-2/">Post 2</a></li>
  <li><a href="/posts/post-3/">Post 3</a></li>
</ul>
```

该模板：

```go-html-template
<ul>
  {{ range where .Site.RegularPages "Params.exclude" "ne" true }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

渲染为：

```html
<ul>
  <li><a href="/posts/post-1/">Post 1</a></li>
  <li><a href="/posts/post-3/">Post 3</a></li>
</ul>
```

要把字段未定义的页面从布尔_不等_测试中排除：

1. 用布尔比较创建一个切片
1. 用 `nil` 比较创建一个切片
1. 用 [`collections.Complement`][] 函数从第一个切片中减去第二个切片。

该模板：

```go-html-template
{{ $p1 := where .Site.RegularPages "Params.exclude" "ne" true }}
{{ $p2 := where .Site.RegularPages "Params.exclude" "eq" nil }}
<ul>
  {{ range $p1 | complement $p2 }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

渲染为：

```html
<ul>
  <li><a href="/posts/post-1/">Post 1</a></li>
</ul>
```

该模板：

```go-html-template
{{ $p1 := where .Site.RegularPages "Params.exclude" "ne" false }}
{{ $p2 := where .Site.RegularPages "Params.exclude" "eq" nil }}
<ul>
  {{ range $p1 | complement $p2 }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

渲染为：

```html
<ul>
  <li><a href="/posts/post-1/">Post 2</a></li>
</ul>
```

## 完整示例：用 dict 切片跑通 where

这个例子不依赖任何内容文件，复制进任意会渲染 HTML 的模板就能跑：

```go-html-template {file="layouts/_partials/price-list.html"}
{{ $books := slice
     (dict "title" "A 书" "price" 42)
     (dict "title" "B 书" "price" 42.67)
     (dict "title" "C 书") }}
<ul>
  {{ range where $books "price" "ge" 40 }}
    <li>{{ .title }}</li>
  {{ end }}
</ul>
<p>匹配到 {{ len (where $books "price" "ge" 40) }} 本</p>
<p>有 price 的：{{ len (where $books "price" "ne" nil) }} 本</p>
<p>没有 price 的：{{ len (where $books "price" "eq" nil) }} 本</p>
```

Hugo 渲染为（`range` 循环本身会留下空行，这里省略）：

```html
<ul>
  <li>A 书</li>
  <li>B 书</li>
</ul>
<p>匹配到 2 本</p>
<p>有 price 的：2 本</p>
<p>没有 price 的：1 本</p>
```

**你应当看到什么**：列表里只有 A 书与 B 书两行。第三本书**没有** `price` 字段，`ge` 比较不会把它算进来；只有与 `nil` 比较时它才会被选中——这就是「字段不存在」在 `where` 里的语义。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 没有任何元素满足条件 | 空切片（`len` 为 0），在 `if`/`with` 里判为假 | 否 |
| 输入是空切片 `slice` | 空切片 | 否 |
| 比较双方类型不同（`"42"` 与 `42`） | 空结果 | 否 |
| key 不存在，且与具体值比较 | 空结果（该元素被跳过） | 否 |
| `like` 用在非字符串字段上 | 空结果（上游已说明） | 否 |
| 输入不是切片（字符串、数字、`nil`） | —— | 是：`can't iterate over string`、`can't iterate over int`、`can't iterate over <nil>` |
| 运算符拼错 | —— | 是：`error calling where: no such operator` |
| 返回类型 | 页面集合得到 `page.Pages`；`dict` 切片得到 `[]map[string]interface {}`（签名里统一写作 `[]any`） | 否 |

两栏对照着记：`"ne" nil` 选出「字段有值」的元素，`"eq" nil` 选出「字段没有定义」的元素。因此「字段未定义」的元素在用 `"ne" true` 这类布尔不等比较时**会**被带上，需要时按上游「布尔值/未定义值比较」一节的写法用 `complement` 减掉。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面明明有这个参数，筛选结果却是空的 | `KEY` 写错：页面集合上除 `Section`、`Type`、`Date` 这些字段外，自定义参数要写 `Params.xxx`，且要与 front matter 里的键名一致 | 先打印一个元素的参数确认键名，例如 `{{ debug.Dump (index site.RegularPages 0).Params }}` |
| 没报错但结果不对 | 数字比较筛不出任何页面 | 值类型不同：`42` 与 `"42"` 不相等（实测返回空结果） | 检查 front matter 里的数字是否被引号包成了字符串 |
| 没报错但结果不对 | 明明有匹配的页面，`like` 却筛不出来 | 字段不是字符串（数字、布尔）时 `like` 返回空结果 | 字符串用 `like`，数字用 `ge`/`le`，布尔用 `eq` |
| 没报错但结果不对 | 布尔不等比较把没定义该字段的页面也带进来了 | `"ne" true` 对「字段不存在」也成立 | 用 `"eq" nil` 单独取一次，再用 [`collections.Complement`](/functions/collections/complement/) 减掉 |
| 没报错但结果不对 | 日期比较结果不对 | YAML/JSON，或加了引号的 TOML 日期都是字符串，无法与 `time.Time` 比较 | 日期用 TOML 且不加引号；否则用 `range` 加 `time.AsTime` 手动筛 |
| 没报错但结果不对 | 按数组字段筛选时结果为空 | 与切片比较却用了 `eq`：上游要求值里有切片时改用成员或交集运算符 | 改用 `in`、`not in` 或 `intersect`（见本页「成员比较」「交集比较」） |
| 报错看不懂 | `can't iterate over string` | `SLICE` 传了字符串（例如把 `.Params.tags` 当字符串用） | 用 `slice` 包一层，或改成 `in` 比较字符串 |
| 报错看不懂 | `error calling where: no such operator` | 运算符拼错（例如写成了别的语言的写法） | 照抄本页「运算符」一节列出的十个运算符之一 |

更多排查入口见[故障排查](/troubleshooting/)。

[`MainSections`]: /methods/site/mainsections/
[`collections.Complement`]: /functions/collections/complement/
[`date`]: /methods/page/date/
[`expiryDate`]: /methods/page/expirydate/
[`lastmod`]: /methods/page/lastmod/
[`publishDate`]: /methods/page/publishdate/
[`time.Time`]: https://pkg.go.dev/time#Time
