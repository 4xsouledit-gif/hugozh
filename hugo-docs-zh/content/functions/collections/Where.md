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

[`MainSections`]: /methods/site/mainsections/
[`collections.Complement`]: /functions/collections/complement/
[`date`]: /methods/page/date/
[`expiryDate`]: /methods/page/expirydate/
[`lastmod`]: /methods/page/lastmod/
[`publishDate`]: /methods/page/publishdate/
[`time.Time`]: https://pkg.go.dev/time#Time
