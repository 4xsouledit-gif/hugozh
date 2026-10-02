+++
title = "collections.Append"
linkTitle = "append"
description = "把单个或多个元素，或者另一个完整切片，追加到给定切片的末尾并返回新切片。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/collections/append/"

[params.functions_and_methods]
returnType = "[]any"
aliases = ["append"]
+++

## 这一页解决什么问题

模板里要「往现有列表末尾续上几项」时用 `append`：它返回一个**新切片**，原切片不变。它有两个签名，取决于追加的是若干独立元素，还是另一个切片：

```text
collections.Append ELEMENT [ELEMENT...] SLICE   ← 追加若干元素，被追加的切片在最后
collections.Append SLICE1 SLICE2                ← 追加一整个切片
```

因为「被追加的目标」永远是最后一个参数，`append` 天然适合管道：`$s = $s | append "c"`。注意 Go 模板不能原地修改切片，所以必须用 `=` 把返回值接回变量。

## 什么时候用，什么时候别用

**该用**：

- 把两段页面集合接成一段：分别 `where`／`first` 各取一部分，再 `append` 起来（上游示例就是这种用法）；
- 在 `range` 循环里累积结果：`{{ $tags = $tags | append .Params.tag }}`；
- 目标是「保持原有顺序、只在末尾续接」。

**别用**：

- 想合并去重（并集）→ 用 [`collections.Union`](/functions/collections/union/)：`append` **不去重**；
- 想从集合里减去另一批元素 → 用 [`collections.Complement`](/functions/collections/complement/)；
- 想合并两个映射（map）→ 用 [`collections.Merge`](/functions/collections/merge/)，`append` 只处理切片；
- 只想要前 N 个 → 用 [`collections.First`](/functions/collections/first/)。

## 用法

该函数会把除最后一个参数之外的所有元素追加到最后一个参数上。这样就可以使用下面所示的[管道](g)写法。

向切片追加单个元素：

```go-html-template
{{ $s := slice "a" "b" }}
{{ $s }} → [a b]

{{ $s = $s | append "c" }}
{{ $s }} → [a b c]
```

向切片追加两个元素：

```go-html-template
{{ $s := slice "a" "b" }}
{{ $s }} → [a b]

{{ $s = $s | append "c" "d" }}
{{ $s }} → [a b c d]
```

以切片的形式追加两个元素。结果与前一个示例相同：

```go-html-template
{{ $s := slice "a" "b" }}
{{ $s }} → [a b]

{{ $s = $s | append (slice "c" "d") }}
{{ $s }} → [a b c d]
```

从空切片开始：

```go-html-template
{{ $s := slice }}
{{ $s }} → []

{{ $s = $s | append "a" }}
{{ $s }} → [a]

{{ $s = $s | append "b" "c" }}
{{ $s }} → [a b c]

{{ $s = $s | append (slice "d" "e") }}
{{ $s }} → [a b c d e]
```

如果起始值本身是「切片的切片」：

```go-html-template
{{ $s := slice (slice "a" "b") }}
{{ $s }} → [[a b]]

{{ $s = $s | append (slice "c" "d") }}
{{ $s }} → [[a b] [c d]]
```

要从空切片开始创建「切片的切片」：

```go-html-template
{{ $s := slice }}
{{ $s }} → []

{{ $s = $s | append (slice (slice "a" "b")) }}
{{ $s }} → [[a b]]

{{ $s = $s | append (slice "c" "d") }}
{{ $s }} → [[a b] [c d]]
```

虽然上面示例中的元素都是字符串，但 `append` 函数可用于任何数据类型，包括 Page。例如，在企业站点的首页上，先显示最近两篇新闻稿的链接，再显示最近四篇文章的链接：

```go-html-template
{{ $p := where site.RegularPages "Type" "press-releases" | first 2 }}
{{ $p = $p | append (where site.RegularPages "Type" "articles" | first 4) }}

{{ with $p }}
  <ul>
    {{ range . }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：续接列表，并确认原切片没被改动

```go-html-template {file="layouts/_partials/tag-list.html"}
{{ $s := slice "a" "b" }}
{{ $t := $s | append "c" }}
<p>原切片：{{ $s }}</p>
<p>新切片：{{ $t }}</p>
<p>元素形式：{{ slice "a" | append "b" "c" }}</p>
<p>切片形式：{{ slice "a" | append (slice "b" "c") }}</p>
<p>追加 nil：{{ slice | append nil }}</p>
```

Hugo 渲染为：

```html
<p>原切片：[a b]</p>
<p>新切片：[a b c]</p>
<p>元素形式：[a b c]</p>
<p>切片形式：[a b c]</p>
<p>追加 nil：[<nil>]</p>
```

**你应当看到什么**：`append` 返回新切片，`$s` 仍是 `[a b]`（这就是为什么必须写 `$s = $s | append …`）；追加元素与追加切片结果一致；追加 `nil` 不报错，`nil` 会成为列表里的一个元素。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 目标切片为空 | 正常追加，返回只含新元素的切片 | 否 |
| 追加的元素是 `nil` | `nil` 作为元素进入结果（`[<nil>]`） | 否 |
| 追加 `(slice …)` 与逐个追加元素 | 结果相同 | 否 |
| 原切片是「切片的切片」 | 整个切片作为一个元素追加，不会展平 | 否 |
| 第一个参数不是切片（如 `append "x" "y"`） | —— | 是：`error calling append: expected a slice, got string` |
| 返回值与原切片 | 返回**新切片**；实测原变量不受影响 | 否 |
| 返回类型 | `[]any`（元素类型不同时为 `[]any`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `range` 里累积的列表始终是空的 | 没把返回值接回变量，`append` 不会原地改切片 | 写 `{{ $s = $s \| append $x }}`（赋值运算符是 `=`，不是 `:=`，也不要漏掉） |
| 没报错但结果不对 | 结果里出现了重复项 | `append` 不去重 | 改用 [`collections.Union`](/functions/collections/union/) 或用 [`collections.Uniq`](/functions/collections/uniq/) 去重 |
| 没报错但结果不对 | 期望展平却得到嵌套切片 | 参数是切片时整体作为一个元素追加 | 要展平就 `range` 后再逐个 `append` |
| 报错看不懂 | `expected a slice, got string` | 把字符串当成了切片 | 先用 [`collections.Slice`](/functions/collections/slice/) 包起来，或检查参数顺序是「元素在前、切片在后」 |

更多排查入口见[故障排查](/troubleshooting/)。
