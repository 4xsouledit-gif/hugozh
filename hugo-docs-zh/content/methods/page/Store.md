+++
title = "Store"
linkTitle = "Store"
description = "返回一个持久化的数据结构，用于存储和操作带 key 的值，作用域为当前页面。"
date = 2026-10-02
weight = 800
source = "https://gohugo.io/methods/page/store/"

[params.functions_and_methods]
signatures = ["PAGE.Store"]
returnType = "maps.Scratch"
+++

## 这一页解决什么问题

模板本身是「函数式」的：局部变量在模板结束就没了，partial 之间也没法直接传值。`.Store` 提供一个**页面作用域**的键值存储，让短代码、渲染钩子、partial 之间可以传递数据——例如短代码收集了一组条目，父模板再取出来渲染目录。

它是 [`.Scratch`](/methods/page/scratch/) 的**正式替代品**（v0.138.0 起 `Scratch` 成为 `Store` 的别名）。新代码写 `.Store`。

## 什么时候用，什么时候别用

**该用**：

- 短代码/渲染钩子里 `Set`，父模板里 `Get`；
- 用 `Add` 累加（数字求和、字符串拼接、切片追加）；
- 用 `SetInMap` + `GetSortedMapValues` 维护「有序映射」。

**别用**：

- 想跨页面共享 → 用 [`hugo.Store`](/functions/hugo/store/)（全局）或 [`SITE.Store`](/methods/site/store/)（站点级）；
- 短代码内部共享 → [`SHORTCODE.Store`](/methods/shortcode/store/)；
- 只是一次性的临时变量 → `{{ $x := ... }}` 就够；
- 想用页面参数（front matter）存配置 → 那是 `.Params` 的领域。

**作用域选择（上游）**：

| 作用域 | 方法或函数 |
| --- | --- |
| page | `PAGE.Store` |
| site | `SITE.Store` |
| global | `hugo.Store` |
| local | `collections.NewScratch` |
| shortcode | `SHORTCODE.Store` |

## 用法

用 `Page` 对象上的 `Store` 方法可以创建一个持久化的数据结构，用于存储和操作带 key 的值，作用域为当前页面。要创建其他[作用域](g)的数据结构，请参见下面的[作用域](#作用域)一节。

### 方法

在数据结构上使用这些方法。

`Set`
: 设置给定 key 的值。

  ```go-html-template
  {{ .Store.Set "greeting" "Hello" }}
  ```

`Get`
: （`any`）获取给定 key 的值。

  ```go-html-template
  {{ .Store.Set "greeting" "Hello" }}
  {{ .Store.Get "greeting" }} → Hello
  ```

`Add`
: 把给定值加到给定 key 的现有值上。

  对于单个值，`Add` 接受支持 Go 的 `+` 运算符的值。如果对某个 key 的第一次 `Add` 操作是数组或切片，后续的 add 会追加到该列表中。

  ```go-html-template
  {{ .Store.Set "greeting" "Hello" }}
  {{ .Store.Add "greeting" "Welcome" }}
  {{ .Store.Get "greeting" }} → HelloWelcome
  ```

  ```go-html-template
  {{ .Store.Set "total" 3 }}
  {{ .Store.Add "total" 7 }}
  {{ .Store.Get "total" }} → 10
  ```

  ```go-html-template
  {{ .Store.Set "greetings" (slice "Hello") }}
  {{ .Store.Add "greetings" (slice "Welcome" "Cheers") }}
  {{ .Store.Get "greetings" }} → [Hello Welcome Cheers]
  ```

`SetInMap`
: 接受 `key`、`mapKey` 和 `value`，并把由 `mapKey` 和 `value` 构成的映射加入给定的 `key`。

  ```go-html-template
  {{ .Store.SetInMap "greetings" "english" "Hello" }}
  {{ .Store.SetInMap "greetings" "french" "Bonjour" }}
  {{ .Store.Get "greetings" }} → map[english:Hello french:Bonjour]
  ```

`DeleteInMap`
: 接受 `key` 和 `mapKey`，并从给定的 `key` 中移除 `mapKey` 对应的映射。

  ```go-html-template
  {{ .Store.SetInMap "greetings" "english" "Hello" }}
  {{ .Store.SetInMap "greetings" "french" "Bonjour" }}
  {{ .Store.DeleteInMap "greetings" "english" }}
  {{ .Store.Get "greetings" }} → map[french:Bonjour]
  ```

`GetSortedMapValues`
: （`[]any`）返回 `key` 中的值数组，按 `mapKey` 排序。

  ```go-html-template
  {{ .Store.SetInMap "greetings" "english" "Hello" }}
  {{ .Store.SetInMap "greetings" "french" "Bonjour" }}
  {{ .Store.GetSortedMapValues "greetings" }} → [Hello Bonjour]
  ```

`Delete`
: 移除给定的 key。

  ```go-html-template
  {{ .Store.Set "greeting" "Hello" }}
  {{ .Store.Delete "greeting" }}
  ```

### 作用域

用于创建该数据结构的方法或函数决定了它的作用域。例如，用 `Page` 对象上的 `Store` 方法创建的数据结构，其作用域就是该页面。

作用域|方法或函数
:--|:--
page|[`PAGE.Store`][]
site|[`SITE.Store`][]
global|[`hugo.Store`][]
local|[`collections.NewScratch`][]
shortcode|[`SHORTCODE.Store`][]

### 确定值

`Store` 方法常用于在_短代码_模板、由_短代码_模板调用的_局部模板_，或_渲染钩子_模板中设置值。在这三种情况下，存储的值在 Hugo 渲染页面内容之前都是不确定的。

如果你需要从父模板访问某个已存储的值，而该父模板尚未渲染页面内容，可以通过把返回值赋给一个 [noop](g) 变量来触发内容渲染：

```go-html-template
{{ $noop := .Content }}
{{ .Store.Get "mykey" }}
```

你也可以用 `ContentWithoutSummary`、`FuzzyWordCount`、`Len`、`Plain`、`PlainWords`、`ReadingTime`、`Summary`、`Truncated` 和 `WordCount` 方法触发内容渲染。例如：

```go-html-template
{{ $noop := .WordCount }}
{{ .Store.Get "mykey" }}
```

## 完整示例：写入、累加、映射与删除

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
{{ .Store.Set "total" 1 }}
{{ .Store.Add "total" 2 }}
<p>累加结果：{{ .Store.Get "total" }}</p>

{{ .Store.SetInMap "m" "b" 2 }}
{{ .Store.SetInMap "m" "a" 1 }}
<p>映射：{{ .Store.Get "m" }}</p>
<p>按 key 排序的值：{{ .Store.GetSortedMapValues "m" }}</p>

{{ .Store.Set "temp" 1 }}
{{ .Store.Delete "temp" }}
<p>删除后：{{ printf "%v" (.Store.Get "temp") }}</p>
```

实测（Hugo 0.167.0）：

```html
<p>累加结果：3</p>
<p>映射：map[a:1 b:2]</p>
<p>按 key 排序的值：[1 2]</p>
<p>删除后：&lt;nil&gt;</p>
```

**你应当看到什么**：`Set` 之后再 `Add` 得到 `3`（不是 `12`，`Add` 是数值相加）；`SetInMap` 建立的映射打印出来按 key 升序（`map[a:1 b:2]`）；`GetSortedMapValues` 拿到按 mapKey 排序的**值**数组；`Delete` 之后 `Get` 返回 `nil`（打印为 `<nil>`）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `Get` 一个从未设置的 key | `nil`（实测 `.Store.Get "missing"` → `<nil>`） | 否 |
| `Add` 到不存在的 key | 以上一次为基准创建；数值相加、字符串拼接、切片追加（上游说明 + 实测整数相加） | 否 |
| `Add` 到已删除的 key | 从零值重新开始 | 否 |
| `Delete` 后 `Get` | `nil`（实测） | 否 |
| `SetInMap` / `GetSortedMapValues` | 映射按 mapKey 升序（实测 `map[a:1 b:2]`、`[1 2]`） | 否 |
| `.Scratch` 与 `.Store` | 同一份存储，可互相读写（实测） | 否 |
| 作用域 | 仅当前页面；跨页面不可见 | 否 |
| 返回类型 | `maps.Scratch` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`PAGE.Store`]: /methods/page/store/
[`SHORTCODE.Store`]: /methods/shortcode/store/
[`SITE.Store`]: /methods/site/store/
[`collections.NewScratch`]: /functions/collections/newscratch/
[`hugo.Store`]: /functions/hugo/store/
