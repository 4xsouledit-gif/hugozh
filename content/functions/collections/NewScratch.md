+++
title = "collections.NewScratch"
linkTitle = "newScratch"
description = "返回一个局部作用域的持久化数据结构，用于存储和操作带 key 的值。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/functions/collections/newscratch/"

[params.functions_and_methods]
signatures = ["collections.NewScratch"]
returnType = "maps.Scratch"
aliases = ["newScratch"]
+++

## 这一页解决什么问题

`newScratch` 造一个**可以反复读写的临时容器**（key → value），用来在模板内部跨步骤累积数据：先 `Set` 一个初值，再在 `range` 循环里不断 `Add`／`SetInMap`，最后 `Get` 出来渲染。

为什么不能直接用 `{{ $x := ... }}`？因为 Go 模板的变量在 `range`、`if` 等**作用域内赋值往往改不到外面**（赋值只在当前作用域生效），而 Scratch 是引用类型，跨作用域修改可靠——这就是它存在的核心理由。作用域由「用哪个方法/函数创建」决定，见下文[作用域](#作用域)一节。

## 什么时候用，什么时候别用

**该用**：

- 在 `range` 循环里累积结果（`$s.Add "tags" (slice .)`、`$s.Add "total" 1`）；
- 需要按 key 攒多个值，最后统一渲染；
- 需要页面级、站点级或全局的共享存储（分别用 `PAGE.Store`、`SITE.Store`、`hugo.Store`，见作用域表）。

**别用**：

- 只是想保存**一个值**、不跨作用域 → 普通变量 `{{ $x := ... }}` 就够了；
- 需要跨**页面**或跨模板共享 → 用 `site.Store`／`hugo.Store`（`newScratch` 只在当前模板/局部模板内有效）；
- 想拿底层映射做遍历 → 上游明确警告：**不要对 `Page` 对象的 `Store` 方法使用 `Values`**（并发问题）。

## 方法

用 `collections.NewScratch` 函数创建一个局部作用域的持久化数据结构，用于存储和操作带 key 的值。要创建其他[作用域](g)的数据结构，请参见下文的[作用域](#作用域)一节。

在该数据结构上使用以下方法。

`Set`
: 设置给定 key 的值。

  ```go-html-template
  {{ $s := newScratch }}
  {{ $s.Set "greeting" "Hello" }}
  ```

`Get`
: （`any`）获取给定 key 的值。

  ```go-html-template
  {{ $s := newScratch }}
  {{ $s.Set "greeting" "Hello" }}
  {{ $s.Get "greeting" }} → Hello
  ```

`Add`
: 把给定的值加到给定 key 的现有值上。

  对于单个值，`Add` 接受支持 Go `+` 运算符的值。如果某个 key 第一次 `Add` 的是数组或切片，那么后续的 `Add` 都会追加到该列表上。

  ```go-html-template
  {{ $s := newScratch }}
  {{ $s.Set "greeting" "Hello" }}
  {{ $s.Add "greeting" "Welcome" }}
  {{ $s.Get "greeting" }} → HelloWelcome
  ```

  ```go-html-template
  {{ $s := newScratch }}
  {{ $s.Set "total" 3 }}
  {{ $s.Add "total" 7 }}
  {{ $s.Get "total" }} → 10
  ```

  ```go-html-template
  {{ $s := newScratch }}
  {{ $s.Set "greetings" (slice "Hello") }}
  {{ $s.Add "greetings" (slice "Welcome" "Cheers") }}
  {{ $s.Get "greetings" }} → [Hello Welcome Cheers]
  ```

`SetInMap`
: 接收 `key`、`mapKey` 和 `value`，把 `mapKey` 与 `value` 组成的映射加到给定的 `key` 上。

  ```go-html-template
  {{ $s := newScratch }}
  {{ $s.SetInMap "greetings" "english" "Hello" }}
  {{ $s.SetInMap "greetings" "french" "Bonjour" }}
  {{ $s.Get "greetings" }} → map[english:Hello french:Bonjour]
  ```

`DeleteInMap`
: 接收 `key` 和 `mapKey`，从给定的 `key` 中移除 `mapKey` 对应的映射。

  ```go-html-template
  {{ $s := newScratch }}
  {{ $s.SetInMap "greetings" "english" "Hello" }}
  {{ $s.SetInMap "greetings" "french" "Bonjour" }}
  {{ $s.DeleteInMap "greetings" "english" }}
  {{ $s.Get "greetings" }} → map[french:Bonjour]
  ```

`GetSortedMapValues`
: （`[]any`）返回 `key` 中的值组成的数组，按 `mapKey` 排序。

  ```go-html-template
  {{ $s := newScratch }}
  {{ $s.SetInMap "greetings" "english" "Hello" }}
  {{ $s.SetInMap "greetings" "french" "Bonjour" }}
  {{ $s.GetSortedMapValues "greetings" }} → [Hello Bonjour]
  ```

`Delete`
: 移除给定的 key。

  ```go-html-template
  {{ $s := newScratch }}
  {{ $s.Set "greeting" "Hello" }}
  {{ $s.Delete "greeting" }}
  ```

`Values`
: （`map`）返回底层原始映射。由于存在并发问题，不要对 `Page` 对象上的 `Store` 方法使用它。

  ```go-html-template
  {{ $s := newScratch }}
  {{ $s.SetInMap "greetings" "english" "Hello" }}
  {{ $s.SetInMap "greetings" "french" "Bonjour" }}

  {{ $map := $s.Values }}
  ```

## 作用域

用哪个方法或函数创建该数据结构，就决定了它的作用域。例如，使用 `Page` 对象上的 `Store` 方法，会创建一个作用域为页面的数据结构。

作用域|方法或函数
:--|:--
页面|[`PAGE.Store`][]
站点|[`SITE.Store`][]
全局|[`hugo.Store`][]
局部|[`collections.NewScratch`][]
短代码|[`SHORTCODE.Store`][]

## 完整示例：在循环里累积标签

```go-html-template {file="layouts/_partials/tag-scratch.html"}
{{ $s := newScratch }}
{{ $s.Set "tags" (slice) }}
{{ range slice "Hugo" "Go" "Hugo" }}
  {{ $s.Add "tags" (slice .) }}
{{ end }}
<p>累积：{{ $s.Get "tags" }}</p>
<p>去重：{{ $s.Get "tags" | uniq }}</p>
<p>字符串键：{{ $s.Set "greeting" "Hello" }}{{ $s.Get "greeting" }}</p>
<p>不存在时 Get：[{{ $s.Get "missing" }}]</p>
<p>整表：{{ $s.Values }}</p>
```

Hugo 渲染为（`Set` 本身不输出内容；`range` 循环会留下空行，这里省略）：

```html
<p>累积：[Hugo Go Hugo]</p>
<p>去重：[Hugo Go]</p>
<p>字符串键：Hello</p>
<p>不存在时 Get：[]</p>
<p>整表：map[greeting:Hello tags:[Hugo Go Hugo]]</p>
```

**你应当看到什么**：循环里用 `Add` 把元素追加进切片（初值必须先 `Set "tags" (slice)`）；`Get` 取不存在的 key 返回空值而**不报错**，所以「有没有取到」要靠 `with` 或先 `Set` 初值来判断；`Values` 能一次看到全部数据。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `Get` 不存在的 key | 空值（输出为空） | 否 |
| 对不存在的 key 直接 `Add` 数字 | 以该值作为初值（实测 `Add "missing" 1` 后 `Get` 得 `1`） | 否 |
| `Add` 两侧类型不匹配（字符串 + 数字） | —— | 是：`error calling Add: can't apply the operator to the values` |
| 同一 key 反复 `Set` | 后者覆盖前者（实测 `1` → `2`） | 否 |
| `Delete` 不存在的 key | 无操作，不报错 | 否 |
| `SetInMap` 后 `DeleteInMap` | 该 mapKey 被移除（实测 `map[]`） | 否 |
| `GetSortedMapValues` | 按 mapKey 排序后的值列表（实测 `[Hello Bonjour]`） | 否 |
| `Values` | 返回底层映射（实测 `map[a:1]`）；上游警告不要用于 `Page` 的 `Store` | 否 |
| 给 `newScratch` 传参数 | —— | 是：`wrong number of args for newScratch: want 0 got 1` |
| 返回类型 | 实测 `printf "%T"` 得 `*hstore.Scratch`（签名写作 `maps.Scratch`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 循环里累积的结果出了循环就没了 | 用了普通变量，赋值只在循环作用域内生效 | 改用 `newScratch`（引用类型，跨作用域可改） |
| 没报错但结果不对 | 累积的列表只剩最后一项 | 循环里用了 `Set`（覆盖）而不是 `Add`（追加） | 初值用 `Set "tags" (slice)`，循环里用 `Add` |
| 报错看不懂 | `can't apply the operator to the values` | 初值与追加值类型不同（如字符串 + 数字） | 统一类型；不确定时先 `Set` 一个类型正确的初值 |
| 没报错但结果不对 | 在别的模板/局部模板里取不到值 | 作用域不对：`newScratch` 是**局部**的 | 跨模板共享改用 `site.Store`／`hugo.Store`／`PAGE.Store`（见作用域表） |
| 没报错但结果不对 | 取值为空却不报错 | `Get` 不存在的 key 返回空值（实测） | 用 `with` 判断，或先 `Set` 初值 |

更多排查入口见[故障排查](/troubleshooting/)。

[`PAGE.Store`]: /methods/page/store/
[`SHORTCODE.Store`]: /methods/shortcode/store/
[`SITE.Store`]: /methods/site/store/
[`collections.NewScratch`]: /functions/collections/newscratch/
[`hugo.Store`]: /functions/hugo/store/
