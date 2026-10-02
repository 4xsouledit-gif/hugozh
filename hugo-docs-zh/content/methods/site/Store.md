+++
title = "Store"
linkTitle = "Store"
description = "返回一个持久化的数据结构，用于存储和操作带 key 的值，作用域为当前站点。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/methods/site/store/"

[params.functions_and_methods]
signatures = ["site.Store"]
returnType = "maps.Scratch"
+++

## 这一页解决什么问题

**（0.139.0 新增）**

模板之间要传递数据时，Go 模板的变量作用域常常不够用：partial、shortcode、渲染钩子各自渲染，局部变量传不出来。`Store` 就是一个**带 key 的共享存储**，作用域为当前站点，任意模板都能读写同一个 `site.Store`。

生命周期是**一次构建**：Hugo 每次运行都从空开始，它不写入磁盘、也不是缓存。

## 什么时候用，什么时候别用

**该用**：

- 在 shortcode 或渲染钩子里算出值，交给外层模板使用（上游「确定值」一节讲的就是这个场景）；
- 统计/累加：遍历页面时把结果累加到同一个 key；
- 在 partial 之间传递「只算一次」的结果。

**别用**：

- 想持久化数据 → `Store` 只活在本次构建里，需要落盘请写资源文件（[hugo-pipes](/hugo-pipes/)）；
- 需要页面级作用域 → 用 `PAGE.Store`（[methods/page/store](/methods/page/store/)）；全局作用域 → `hugo.Store`；局部 → `collections.NewScratch`，见下文「作用域」；
- 在并行渲染的父子模板之间依赖「先写后读」的顺序 → 上游在「确定值」一节给出解法（先用 noop 变量触发内容渲染）。

## 方法

在数据结构上使用这些方法。

`Set`
: 设置给定 key 的值。

  ```go-html-template
  {{ site.Store.Set "greeting" "Hello" }}
  ```

`Get`
: （`any`）获取给定 key 的值。

  ```go-html-template
  {{ site.Store.Set "greeting" "Hello" }}
  {{ site.Store.Get "greeting" }} → Hello
  ```

`Add`
: 把给定值加到给定 key 的现有值上。

  对于单个值，`Add` 接受支持 Go 的 `+` 运算符的值。如果对某个 key 的第一次 `Add` 操作是数组或切片，后续的 add 会追加到该列表中。

  ```go-html-template
  {{ site.Store.Set "greeting" "Hello" }}
  {{ site.Store.Add "greeting" "Welcome" }}
  {{ site.Store.Get "greeting" }} → HelloWelcome
  ```

  ```go-html-template
  {{ site.Store.Set "total" 3 }}
  {{ site.Store.Add "total" 7 }}
  {{ site.Store.Get "total" }} → 10
  ```

  ```go-html-template
  {{ site.Store.Set "greetings" (slice "Hello") }}
  {{ site.Store.Add "greetings" (slice "Welcome" "Cheers") }}
  {{ site.Store.Get "greetings" }} → [Hello Welcome Cheers]
  ```

`SetInMap`
: 接受 `key`、`mapKey` 和 `value`，并把由 `mapKey` 和 `value` 构成的映射加入给定的 `key`。

  ```go-html-template
  {{ site.Store.SetInMap "greetings" "english" "Hello" }}
  {{ site.Store.SetInMap "greetings" "french" "Bonjour" }}
  {{ site.Store.Get "greetings" }} → map[english:Hello french:Bonjour]
  ```

`DeleteInMap`
: 接受 `key` 和 `mapKey`，并从给定的 `key` 中移除 `mapKey` 对应的映射。

  ```go-html-template
  {{ site.Store.SetInMap "greetings" "english" "Hello" }}
  {{ site.Store.SetInMap "greetings" "french" "Bonjour" }}
  {{ site.Store.DeleteInMap "greetings" "english" }}
  {{ site.Store.Get "greetings" }} → map[french:Bonjour]
  ```

`GetSortedMapValues`
: （`[]any`）返回 `key` 中的值数组，按 `mapKey` 排序。

  ```go-html-template
  {{ site.Store.SetInMap "greetings" "english" "Hello" }}
  {{ site.Store.SetInMap "greetings" "french" "Bonjour" }}
  {{ site.Store.GetSortedMapValues "greetings" }} → [Hello Bonjour]
  ```

`Delete`
: 移除给定的 key。

  ```go-html-template
  {{ site.Store.Set "greeting" "Hello" }}
  {{ site.Store.Delete "greeting" }}
  ```

## 作用域

用于创建该数据结构的方法或函数决定了它的作用域。例如，用 `Page` 对象上的 `Store` 方法创建的数据结构，其作用域就是该页面。

作用域|方法或函数
:--|:--
page|[`PAGE.Store`][]
site|[`SITE.Store`][]
global|[`hugo.Store`][]
local|[`collections.NewScratch`][]
shortcode|[`SHORTCODE.Store`][]

## 确定值

`Store` 方法常用于在_短代码_模板、由_短代码_模板调用的_局部模板_，或_渲染钩子_模板中设置值。在这三种情况下，存储的值在 Hugo 渲染页面内容之前都是不确定的。

如果你需要从父模板访问某个已存储的值，而该父模板尚未渲染页面内容，可以通过把返回值赋给一个 [noop](g) 变量来触发内容渲染：

```go-html-template
{{ $noop := .Content }}
{{ site.Store.Get "mykey" }}
```

你也可以用 `ContentWithoutSummary`、`FuzzyWordCount`、`Len`、`Plain`、`PlainWords`、`ReadingTime`、`Summary`、`Truncated` 和 `WordCount` 方法触发内容渲染。例如：

```go-html-template
{{ $noop := .WordCount }}
{{ site.Store.Get "mykey" }}
```

## 完整示例（实测）

把下面这段放进任意会渲染 HTML 的模板（如 home 模板 `layouts/index.html`），它覆盖了增、加、映射与删除四类操作：

```go-html-template {file="layouts/index.html"}
{{ site.Store.Set "greeting" "Hello" }}
{{ site.Store.Add "greeting" "Welcome" }}
<p>{{ site.Store.Get "greeting" }}</p>

{{ site.Store.Set "total" 3 }}
{{ site.Store.Add "total" 7 }}
<p>合计 {{ site.Store.Get "total" }}</p>

{{ site.Store.SetInMap "greetings" "english" "Hello" }}
{{ site.Store.SetInMap "greetings" "french" "Bonjour" }}
<p>{{ site.Store.Get "greetings" }}</p>
<p>{{ site.Store.GetSortedMapValues "greetings" }}</p>

{{ site.Store.Set "scoped" "x" }}
{{ site.Store.Delete "scoped" }}
<p>删除后：[{{ site.Store.Get "scoped" }}]</p>
<p>从未设置：[{{ site.Store.Get "never-set" }}]</p>
```

Hugo 渲染为（`Set`/`Add` 本身不输出内容，故只剩空白行，已省略）：

```html
<p>HelloWelcome</p>

<p>合计 10</p>

<p>map[english:Hello french:Bonjour]</p>
<p>[Hello Bonjour]</p>

<p>删除后：[]</p>
<p>从未设置：[]</p>
```

**你应当看到什么**：字符串 `Add` 是拼接（`HelloWelcome`），数字 `Add` 是相加（`10`）；`GetSortedMapValues` 按 `mapKey` 的字母序输出 `[Hello Bonjour]`（english 在 french 前）；**删除后与从未设置的 key 表现完全一样**——都渲染为空。要区分二者只能自己约定，例如写入时带上哨兵值：`isset` 对 `Store` **不适用**（实测即使刚 `Set` 过，`{{ isset site.Store "greeting" }}` 仍返回 `false`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `Get` 一个从未设置的 key | `nil`（打印为空、`with` 判为假） | 否 |
| `Delete` 之后再 `Get` | 同样为 `nil`（与从未设置不可区分） | 否 |
| `Set "total" 3` 后 `Add "total" 7` | `10`（数字相加） | 否 |
| `Set "greeting" "Hello"` 后 `Add "greeting" "Welcome"` | `HelloWelcome`（字符串拼接） | 否 |
| 切片上的 `Add` | 追加，实测 `[Hello Welcome Cheers]` | 否 |
| `GetSortedMapValues` 在空 key 上 | 空切片（渲染为空） | 否 |
| `isset site.Store "key"` | **始终 `false`**，即使该 key 已 `Set` 过——`Store` 不能这样探测 | 否 |
| `Add` 的类型与已有值不兼容（如 `"a"` 上加 `1`） | —— | 是：`error calling Add: can't apply the operator to the values` |
| `printf "%T" site.Store` | `*hstore.Scratch`（满足 `returnType` 的 `maps.Scratch`） | 否 |

[`PAGE.Store`]: /methods/page/store/
[`SHORTCODE.Store`]: /methods/shortcode/store/
[`SITE.Store`]: /methods/site/store/
[`collections.NewScratch`]: /functions/collections/newscratch/
[`hugo.Store`]: /functions/hugo/store/
