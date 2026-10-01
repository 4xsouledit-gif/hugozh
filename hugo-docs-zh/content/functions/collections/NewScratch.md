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

用 `collections.NewScratch` 函数创建一个局部作用域的持久化数据结构，用于存储和操作带 key 的值。要创建其他[作用域](g)的数据结构，请参见下文的[作用域](#作用域)一节。

## 方法

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

[`PAGE.Store`]: /methods/page/store/
[`SHORTCODE.Store`]: /methods/shortcode/store/
[`SITE.Store`]: /methods/site/store/
[`collections.NewScratch`]: /functions/collections/newscratch/
[`hugo.Store`]: /functions/hugo/store/
