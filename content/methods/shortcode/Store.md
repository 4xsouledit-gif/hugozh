+++
title = "Store"
linkTitle = "Store"
description = "返回一个持久化的数据结构，用于存储和操作带 key 的值，作用域为当前短代码。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/shortcode/store/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Store"]
returnType = "maps.Scratch"
+++

**（0.139.0 新增）**

用 `Store` 方法可以创建一个持久化的数据结构，用于存储和操作带 key 的值，作用域为当前短代码。要创建其他[作用域](g)的数据结构，请参见下面的[作用域](#作用域)一节。

> [!NOTE]
> 随着 [`newScratch`][] 函数的引入，以及初始化之后[给模板变量赋值][]的能力，短代码中的 `Store` 方法基本已经过时了。

## 这一页解决什么问题

短代码模板有时需要一块**临时存放值的地方**：把中间结果存下来、等后面再用；或者在模板的多个分支之间传递数据。`Store` 就是这次短代码调用专属的「带 key 的小仓库」，提供 `Set`/`Get`/`Add`/`SetInMap` 等方法。

它最容易误解的地方是**作用域**：这里的 `Store` 属于**当前这一次短代码调用**，不是整个页面、也不是整个站点。同一短代码在同一页被调用两次，第二次读不到第一次写的值——这一点在下面的实测里可以看到。要其他作用域，见「作用域」一节。

## 什么时候用，什么时候别用

**该用**：

- 需要在模板里多次读写同一组命名值，且用普通变量表达不顺手；
- 需要在 `range` 循环里累计（`Add`）、先收集再排序（`SetInMap` + `GetSortedMapValues`）；
- 需要明确「这份状态只属于本次调用」。

**别用**：

- 能用模板变量就直接用变量：`{{ $x := … }}`、以及初始化后重新赋值 `{{ $x = … }}`（上游也指出，`Store` 因此已基本过时）；
- 想在**两次短代码调用之间**共享状态 → 这里的 `Store` 不共享（实测）；共享请让调用方传参，或用页面/站点级 `Store`；
- 想读页面或站点数据 → 用 [`Page`](/methods/shortcode/page/) / [`Site`](/methods/shortcode/site/)；
- 老代码里的 `.Scratch` → 0.139.0 起它就是本方法的别名，见 [`Scratch`](/methods/shortcode/scratch/)。

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

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。先读一次旧值再写入，用来确认「上一次调用留下的值」在不在：

```go-html-template {file="layouts/_shortcodes/store-demo.html"}
<p>读取旧值：{{ with .Store.Get "seen" }}{{ . }}{{ else }}（空）{{ end }}</p>
{{ .Store.Set "seen" (printf "第 %d 次调用写入" .Ordinal) }}
<p>写入后：{{ .Store.Get "seen" }}</p>
```

```md {file="content/about.md"}
{{</* store-demo */>}}

{{</* store-demo */>}}
```

Hugo 渲染为（实测）：

```html
<p>读取旧值：（空）</p>
<p>写入后：第 0 次调用写入</p>

<p>读取旧值：（空）</p>
<p>写入后：第 1 次调用写入</p>
```

**你应当看到什么**：第二次调用的「读取旧值」**也是（空）**——第一次调用写进去的 `seen` 没有留下来。这证明 `Store` 的作用域是**单次调用**；同时也解释了为什么 `Ordinal` 在这里是 0 和 1（见 [`Ordinal`](/methods/shortcode/ordinal/)）。

> [!TIP]
> 如果你的意图恰恰是「跨调用共享」，`Store` 不是答案：请在调用方把值作为参数传进来。要真正跨页面/跨短代码共享，请使用下表中对应作用域的 `Store`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 同一次调用内 `Set` 后 `Get` | 取回刚写入的值 | 否 |
| 读取从未写入的 key | 空值，`with` 判为假 | 否 |
| 同一短代码第二次调用读取第一次写的值 | **读不到**（实测两次都显示「（空）」）——作用域是单次调用 | 否 |
| 返回值类型 | `maps.Scratch`，提供 `Set`/`Get`/`Add`/`SetInMap`/`DeleteInMap`/`GetSortedMapValues`/`Delete` | 否 |
| 跨页共享 | 不共享；需要时改用 page/site/global 作用域 | 否 |
| 复杂用法（`Add`、`SetInMap` 等） | 上游示例给出预期结果；本站未逐条实测 | —— |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 第二次调用读不到第一次写的值 | `Store` 作用域是单次调用 | 让调用方传参；或改用 page/site/global 作用域的 `Store` |
| 没报错但结果不对 | key 读出来总是空 | key 与写入时不一致（必须逐字符相同） | 统一 key 命名 |
| 没报错但结果不对 | `Add` 的结果不是预期 | `Add` 对数字做加法，对切片做追加（上游说明） | 先 `Set` 初始值，再 `Add` |
| 过度设计 | 模板里到处 `Set`/`Get` | 有更直接的写法 | 优先用模板变量赋值（上游也建议如此） |

更多排查入口见[故障排查](/troubleshooting/)。

[`PAGE.Store`]: /methods/page/store/
[`SHORTCODE.Store`]: /methods/shortcode/store/
[`SITE.Store`]: /methods/site/store/
[`collections.NewScratch`]: /functions/collections/newscratch/
[`hugo.Store`]: /functions/hugo/store/

[`newScratch`]: /functions/collections/newscratch/
[给模板变量赋值]: https://go.dev/doc/go1.11#texttemplatepkgtexttemplate
