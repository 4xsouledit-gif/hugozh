+++
title = "hugo.Store"
linkTitle = "hugo.Store"
description = "返回一个全局作用域的持久数据结构，用于存取与操作键值对。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/functions/hugo/store/"

[params.functions_and_methods]
signatures = ["hugo.Store"]
returnType = "maps.Scratch"
+++

**（0.139.0 新增）**

## 用法

用 `hugo.Store` 函数创建一个全局作用域的持久数据结构，用于存取与操作键值对。若要创建其它作用域的数据结构，请参见下文的[作用域](#作用域)一节。

## 方法

在数据结构上使用以下方法。

`Set`
: 设置给定键的值。

  ```go-html-template
  {{ hugo.Store.Set "greeting" "Hello" }}
  ```

`Get`
: （`any`）获取给定键的值。

  ```go-html-template
  {{ hugo.Store.Set "greeting" "Hello" }}
  {{ hugo.Store.Get "greeting" }} → Hello
  ```

`Add`
: 把给定值加到该键的现有值上。

  对单值而言，`Add` 接受支持 Go `+` 运算符的值。如果某个键的第一次 `Add` 传入的是数组或切片，后续的 add 会追加到该列表末尾。

  ```go-html-template
  {{ hugo.Store.Set "greeting" "Hello" }}
  {{ hugo.Store.Add "greeting" "Welcome" }}
  {{ hugo.Store.Get "greeting" }} → HelloWelcome
  ```

  ```go-html-template
  {{ hugo.Store.Set "total" 3 }}
  {{ hugo.Store.Add "total" 7 }}
  {{ hugo.Store.Get "total" }} → 10
  ```

  ```go-html-template
  {{ hugo.Store.Set "greetings" (slice "Hello") }}
  {{ hugo.Store.Add "greetings" (slice "Welcome" "Cheers") }}
  {{ hugo.Store.Get "greetings" }} → [Hello Welcome Cheers]
  ```

`SetInMap`
: 接受 `key`、`mapKey` 与 `value`，把由 `mapKey` 与 `value` 组成的映射加入给定的 `key`。

  ```go-html-template
  {{ hugo.Store.SetInMap "greetings" "english" "Hello" }}
  {{ hugo.Store.SetInMap "greetings" "french" "Bonjour" }}
  {{ hugo.Store.Get "greetings" }} → map[english:Hello french:Bonjour]
  ```

`DeleteInMap`
: 接受 `key` 与 `mapKey`，从给定的 `key` 中移除 `mapKey` 对应的映射项。

  ```go-html-template
  {{ hugo.Store.SetInMap "greetings" "english" "Hello" }}
  {{ hugo.Store.SetInMap "greetings" "french" "Bonjour" }}
  {{ hugo.Store.DeleteInMap "greetings" "english" }}
  {{ hugo.Store.Get "greetings" }} → map[french:Bonjour]
  ```

`GetSortedMapValues`
: （`[]any`）返回 `key` 中的值数组，按 `mapKey` 排序。

  ```go-html-template
  {{ hugo.Store.SetInMap "greetings" "english" "Hello" }}
  {{ hugo.Store.SetInMap "greetings" "french" "Bonjour" }}
  {{ hugo.Store.GetSortedMapValues "greetings" }} → [Hello Bonjour]
  ```

`Delete`
: 移除给定的键。

  ```go-html-template
  {{ hugo.Store.Set "greeting" "Hello" }}
  {{ hugo.Store.Delete "greeting" }}
  ```

## 作用域

创建数据结构所用的方法或函数决定它的作用域。例如，在 `Page` 对象上使用 `Store` 方法，会创建一个作用域限于该页面的数据结构。

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

## 不确定的值

`Store` 方法常用于在 _短代码_ 模板、由 _短代码_ 调用的 _局部模板_，或 _渲染钩子_ 模板中设置值。这三种情况下，在 Hugo 渲染页面内容之前，所存的值都是不确定的。

如果需要从父模板访问某个已存的值，而父模板尚未渲染页面内容，可以把返回值赋给一个 noop 变量来触发内容渲染：

```go-html-template
{{ $noop := .Content }}
{{ hugo.Store.Get "mykey" }}
```

也可以用 `ContentWithoutSummary`、`FuzzyWordCount`、`Len`、`Plain`、`PlainWords`、`ReadingTime`、`Summary`、`Truncated` 与 `WordCount` 方法来触发内容渲染。例如：

```go-html-template
{{ $noop := .WordCount }}
{{ hugo.Store.Get "mykey" }}
```
