+++
title = "collections.Complement"
linkTitle = "complement"
description = "找出只出现在最后一个给定切片中、而不出现在前面任何切片中的元素，返回这些元素组成的切片。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/collections/complement/"

[params.functions_and_methods]
signatures = ["collections.Complement SLICE [SLICE...]"]
returnType = "[]any"
aliases = ["complement"]
+++

## 这一页解决什么问题

`complement` 做的是**集合减法**：从**最后一个**切片里，去掉所有出现在前面切片中的元素。它最少接收两个参数——前面的是「要排除的东西」，最后一个是「被处理的集合」。

方向很容易记反，一句话口诀：**排除项在前，待处理集合在最后**。也正因如此，管道写法把它读得最顺：`$all | complement $excluded`（把 `$excluded` 从 `$all` 里减掉）。

## 什么时候用，什么时候别用

**该用**：

- 列出「除某几类之外的全部内容」（上游示例：排除 `blog` 与 `faqs`）；
- 从一个列表里剔除一批已知值（上游示例：去除停用词）；
- 需要表达「不是这几类」但又想沿用已有的 `where`/`first` 结果作为排除集。

**别用**：

- 条件能写成 `where` 表达式（例如「类型不是 blog/faqs」）→ 上游也提示可以直接用 [`collections.Where`](/functions/collections/where/) 的 `not in`，可读性更好；
- 想要交集／并集／对称差 → 用 [`collections.Intersect`](/functions/collections/intersect/)、[`collections.Union`](/functions/collections/union/)、[`collections.SymDiff`](/functions/collections/symdiff/)；
- 想按位置去掉开头 N 个 → 用 [`collections.After`](/functions/collections/after/)，`complement` 按**值**比较，不看位置。

## 用法

要找出存在于 `$c3` 但不存在于 `$c1` 或 `$c2` 中的元素：

```go-html-template
{{ $c1 := slice 3 }}
{{ $c2 := slice 4 5 }}
{{ $c3 := slice 1 2 3 4 5 }}

{{ complement $c1 $c2 $c3 }} → [1 2]
```

> [!NOTE]
> 使用[链式管道][chained pipeline]可以让代码更易理解：

```go-html-template
{{ $c3 | complement $c1 $c2 }} → [1 2]
```

`complement` 函数也可以用于页面集合。假设你的站点有五种内容类型：

```tree
content/
├── blog/
├── books/
├── faqs/
├── films/
└── songs/
```

要列出除博客文章（`blog`）和常见问题（`faqs`）之外的所有内容：

```go-html-template
{{ $blog := where site.RegularPages "Type" "blog" }}
{{ $faqs := where site.RegularPages "Type" "faqs" }}
{{ range site.RegularPages | complement $blog $faqs }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

> [!NOTE]
> 虽然上面的示例演示的是 `complement` 函数，但你同样可以使用 [`where`][] 函数：

```go-html-template
{{ range where site.RegularPages "Type" "not in" (slice "blog" "faqs") }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

在这个示例中，我们用 `complement` 函数从句子中移除[停用词][stop words]：

```go-html-template
{{ $text := "The quick brown fox jumps over the lazy dog" }}
{{ $stopWords := slice "a" "an" "in" "over" "the" "under" }}
{{ $filtered := split $text " " | complement $stopWords }}

{{ delimit $filtered " " }} → The quick brown fox jumps lazy dog
```

## 完整示例：从标签列表里剔除黑名单

```go-html-template {file="layouts/_partials/tags.html"}
{{ $all := slice "Hugo" "Go" "模板" "草稿" }}
{{ $hidden := slice "草稿" }}
<p>全部：{{ $all }}</p>
<p>剔除后：{{ complement $hidden $all }}</p>
<p>管道写法：{{ $all | complement $hidden }}</p>
<p>剔除项为空：{{ complement (slice) $all }}</p>
<p>被处理集合为空：{{ complement $hidden (slice) }}</p>
```

Hugo 渲染为：

```html
<p>全部：[Hugo Go 模板 草稿]</p>
<p>剔除后：[Hugo Go 模板]</p>
<p>管道写法：[Hugo Go 模板]</p>
<p>剔除项为空：[Hugo Go 模板 草稿]</p>
<p>被处理集合为空：[]</p>
```

**你应当看到什么**：两种写法结果一致（`complement $hidden $all` 与 `$all | complement $hidden`）；剔除项为空时原样返回；被处理集合为空时返回空切片。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 剔除项为空切片 | 原样返回最后一个切片 | 否 |
| 被处理的切片为空 | 空切片 | 否 |
| 最后一个切片的所有元素都在剔除项里 | 空切片 | 否 |
| 元素是数字 | 按值比较，实测 `complement (slice 1 2) (slice 2)` 得 `[]` | 否 |
| 第一个参数是 `nil` | —— | 是：`error calling complement: arguments must be slices or arrays` |
| 最后一个参数是 `nil` | —— | 是：`error calling complement: arguments to complement must be slices or arrays` |
| 参数是字符串 | —— | 是：`arguments must be slices or arrays` |
| 返回类型 | `[]any`（与最后一个切片同类的元素） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 结果和预期正好相反 | 参数顺序记反了：**排除项在前，待处理集合在最后** | 换成管道写法 `$all \| complement $excluded` 就不容易错 |
| 报错看不懂 | `arguments must be slices or arrays` | 传了字符串（常见于把 `split` 的结果忘在另一头） | 字符串先 [`strings.Split`](/functions/strings/split/)；`nil` 不能被当作空切片 |
| 没报错但结果不对 | 页面集合剔除后顺序变了 | 输出顺序与最后一个切片一致，但 `where` 的结果顺序由输入决定 | 先确认输入集合的顺序，必要时再接 [`collections.Sort`](/functions/collections/sort/) |
| 没报错但结果不对 | 该被剔掉的元素还在 | 比较的是**整个元素**，页面集合要求是同一批 Page 对象 | 排除集合要用同样的 `where` 条件取，不要手工 `slice` 拼字符串 |

更多排查入口见[故障排查](/troubleshooting/)。

[`where`]: /functions/collections/where/
[chained pipeline]: https://pkg.go.dev/text/template#hdr-Pipelines
[stop words]: https://en.wikipedia.org/wiki/Stop_word
