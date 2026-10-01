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

用 `Page` 对象上的 `Store` 方法可以创建一个持久化的数据结构，用于存储和操作带 key 的值，作用域为当前页面。要创建其他[作用域](g)的数据结构，请参见下面的[作用域](#作用域)一节。

## 方法

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

## 作用域

用于创建该数据结构的方法或函数决定了它的作用域。例如，用 `Page` 对象上的 `Store` 方法创建的数据结构，其作用域就是该页面。

作用域|方法或函数
:--|:--
page|[`PAGE.Store`][]
site|[`SITE.Store`][]
global|[`hugo.Store`][]
local|[`collections.NewScratch`][]
shortcode|[`SHORTCODE.Store`][]

[`PAGE.Store`]: /methods/page/store/
[`SHORTCODE.Store`]: /methods/shortcode/store/
[`SITE.Store`]: /methods/site/store/
[`collections.NewScratch`]: /functions/collections/newscratch/
[`hugo.Store`]: /functions/hugo/store/

## 确定值

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
