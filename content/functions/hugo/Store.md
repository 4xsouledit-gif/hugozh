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

## 这一页解决什么问题

模板本身是「无状态」的：局部模板各渲染各的，没法随手互相传值。但有些需求天然是累加的——统计本页渲染了多少张卡片、在短代码里登记一个值、在渲染钩子里收集脚注。`hugo.Store` 提供一个**全局作用域**的持久键值容器，任何模板都能往里写、从里读。

## 什么时候用，什么时候别用

**该用**：

- 跨模板共享数据：局部模板写、父模板读；短代码写、布局读；
- 需要映射式操作（`SetInMap`、`GetSortedMapValues`）。`hugo.Store` 的全局作用域意味着**整个构建**共用一个容器。

**别用**：

- 只是把一个值传给一个局部模板 → 用 `partial "x.html" $ctx` 显式传上下文，作用域更小、更清楚；
- 数据只用在一页之内 → 用页面作用域的 `PAGE.Store`，或用 [`collections.NewScratch`](/functions/collections/newscratch/)（local 作用域）；
- 数据属于当前站点 → 用 `SITE.Store`。各作用域的对照表见下文「作用域」。

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

## 完整示例：用局部模板累加计数

局部模板把每次调用的名字追加进同一个键：

```go-html-template {file="layouts/_partials/badge.html"}
{{ hugo.Store.Add "badges" (slice .name) }}
<span class="badge">{{ .name }}</span>
```

页面模板循环调用它两次，然后读取累加结果：

```go-html-template {file="layouts/index.html"}
{{ range slice (dict "name" "A") (dict "name" "B") }}{{ partial "badge.html" . }}{{ end }}
<p>徽章数：{{ len (hugo.Store.Get "badges") }}</p>
<p>徽章列表：{{ hugo.Store.Get "badges" }}</p>
```

在本机（Hugo 0.167.0 extended，Windows）实测 `hugo --source <临时目录> --ignoreCache` 渲染为（`range` 留下的空行已省略）：

```html
<span class="badge">A</span>
<span class="badge">B</span>
<p>徽章数：2</p>
<p>徽章列表：[A B]</p>
```

**你应当看到什么**：局部模板里不需要任何返回值，父模板用同一个键就能读到累加后的列表——这是「跨模板共享」的典型用法。注意这里是**全局**作用域：如果站内还有别的页面也调用这个局部模板，计数会继续累加。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `Get` 一个从未设置过的键 | 空输出；在 `if` 中为假；`printf "%T"` 得到 `<nil>` | 否 |
| `Set` 后再 `Delete` 再 `Get` | 空输出 | 否 |
| `Add` 到不存在的键 | 无输出（不报错，实测构建成功） | 否 |
| `Add` 类型不兼容（`1` 与 `"x"`，任一方向） | —— | 是：`error calling Add: can't apply the operator to the values` |
| `SetInMap` / `GetSortedMapValues` | `Get "greetings"` 得到 `map[english:Hello french:Bonjour]`；`GetSortedMapValues` 得到 `[Hello Bonjour]`（按 mapKey 排序） | 否 |
| `GetSortedMapValues` 用在非映射键上 | —— | 是：`interface conversion: interface {} is string, not map[string]interface {}` |
| `DeleteInMap` 删除不存在的 mapKey | 无输出，不报错 | 否 |
| `Set` 少传值 | —— | 是：`wrong number of args for Set: want 2 got 1` |
| `Get` 少传键 | —— | 是：`wrong number of args for Get: want 1 got 0` |
| 容器类型（`printf "%T"`） | `*hstore.Scratch` | 否 |
| 返回类型（签名） | `maps.Scratch` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 多页构建时计数比单页预期大 | `hugo.Store` 是全局作用域，整个构建共用一个容器，各页面写入会累积 | 换成 `PAGE.Store`；或在写入前先 `Delete` 重置 |
| 报错看不懂 | `error calling Add: can't apply the operator to the values` | `Add` 的新值与已存值类型不兼容（实测 `1` 与 `"x"` 双向都报错） | 保持同一类型；集合用 `slice` 累加 |
| 报错看不懂 | `interface conversion: interface {} is string, not map[string]interface {}` | 对不是映射的键调用了 `GetSortedMapValues` | 该键必须先用 `SetInMap` 写入 |
| 没报错但结果不对 | 父模板读不到短代码里设置的值 | 父模板先于内容渲染执行，值还不存在（见上文「不确定的值」） | 用 `{{ $noop := .Content }}` 或 `.WordCount` 先触发内容渲染 |
| 报错看不懂 | `wrong number of args for Get: want 1 got 0` | 调用 `Get` 时漏了键名 | 补上键名：`{{ hugo.Store.Get "mykey" }}` |

更多排查入口见[故障排查](/troubleshooting/)。
