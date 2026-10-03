+++
title = "collections.Last"
linkTitle = "last"
description = "返回给定切片或字符串的最后 N 个元素。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/functions/collections/last/"

[params.functions_and_methods]
signatures = ["collections.Last N SLICE|STRING"]
returnType = "any"
aliases = ["last"]
+++

## 这一页解决什么问题

`collections.Last` 取集合的**末尾** N 个元素：最近更新的几篇文章、列表最后几项、字符串结尾的几个字节。它和 [`collections.First`](/functions/collections/first/) 是一对，参数顺序同为「数量在前、集合在后」，因此都适合管道写法。

要点：返回的是**原顺序的末尾片段**，不是倒序——`last 2` 作用于 `[a b c]` 得到 `[b c]`，不是 `[c b]`。想要倒序请用 [`collections.Reverse`](/functions/collections/reverse/)。

## 什么时候用，什么时候别用

**该用**：

- 页面集合按时间**升序**排（Hugo 的 `.Pages` 默认如此）而你想把「最新的几篇」放在最前：`last 5` 取到最近的 5 篇，再用 [`collections.Reverse`](/functions/collections/reverse/) 翻转顺序即可；
- 取结果要继续交给 `range`、`len` 处理。

**别用**：

- 想要「最新的在前」的完整列表 → 用 [`collections.Sort`](/functions/collections/sort/)（`"date" "desc"`）或页面集合的 `Reverse` 方法，不要用 `last` 截一段；
- 想按条件挑元素 → 用 [`collections.Where`](/functions/collections/where/)；
- 想按字符截断**中文**字符串 → `last` 对字符串按**字节**切（实测 `last 3 "Schön"` 得 `ön`，而 `last 2` 会从半个字符中间切开），中文请用 [`strings.Substr`](/functions/strings/substr/) 或 [`strings.Truncate`](/functions/strings/truncate/)。

## 用法

```go-html-template
{{ slice "a" "b" "c" | last 1 }} → [c]
{{ slice "a" "b" "c" | last 2 }} → [b c]
```

由于字符串实际上就是只读的字节切片，该函数可用于返回字符串末尾指定数量的字节：

```go-html-template
{{ "abc" | last 1 }} → c
{{ "abc" | last 2 }} → bc
```

注意一个_字符_可能由多个_字节_组成：

```go-html-template
{{ "Schön" | last 1 }} → n
{{ "Schön" | last 2 }} → \xb6n
{{ "Schön" | last 3 }} → ön
```

要在页面集合上使用 `collections.Last` 函数：

```go-html-template
{{ range last 5 .Pages }}
  {{ .Render "summary" }}
{{ end }}
```

把 `N` 设为 0 可返回空切片：

```go-html-template
{{ $emptyPageCollection := last 0 .Pages }}
```

`last` 与 [`where`][] 一起使用：

```go-html-template
{{ range where .Pages "Section" "articles" | last 5 }}
  {{ .Render "summary" }}
{{ end }}
```

## 完整示例：取最后 2 项并倒序显示

```go-html-template {file="layouts/_partials/latest.html"}
{{ $titles := slice "第一篇" "第二篇" "第三篇" "第四篇" }}
<p>最后 2 篇：{{ $titles | last 2 }}</p>
<p>最后 2 篇（反转）：{{ $titles | last 2 | collections.Reverse }}</p>
<p>最后 2 篇的标题：</p>
<ul>
  {{ range $titles | last 2 | collections.Reverse }}
    <li>{{ . }}</li>
  {{ end }}
</ul>
<p>取 99 篇（超过总数）：{{ len ($titles | last 99) }} 篇</p>
```

Hugo 渲染为（`range` 循环本身会留下空行，这里省略）：

```html
<p>最后 2 篇：[第三篇 第四篇]</p>
<p>最后 2 篇（反转）：[第四篇 第三篇]</p>
<p>最后 2 篇的标题：</p>
<ul>
  <li>第四篇</li>
  <li>第三篇</li>
</ul>
<p>取 99 篇（超过总数）：4 篇</p>
```

**你应当看到什么**：`last 2` 得到的是**保持原顺序**的末尾两项 `[第三篇 第四篇]`；接上 `collections.Reverse` 才变成「最新的在最前」。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `N` 大于元素总数（`last 5` 作用于 3 元素切片） | 返回整个切片 | 否 |
| `N` 为 `0` | 空切片（`len` 为 0） | 否 |
| 输入是空切片 | 空切片 | 否 |
| 输入是字符串 | 返回末尾 `N` 个**字节**（`last 3 "Schön"` 得 `ön`） | 否 |
| 字符串截断落在多字节字符中间（上游 `last 2 "Schön"` → `\xb6n`） | 半个字符加一个字节 | 否 |
| `N` 为负数 | —— | 是：`error calling last: sequence length must be non-negative` |
| `N` 不是整数 | —— | 是：`error calling last: unable to cast … to int` |
| 输入是整数或 `nil` | —— | 是：`can't iterate over int` 或 `both limit and seq must be provided` |
| 返回类型 | 按输入定：切片进切片出、字符串进字符串出（签名写作 `any`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `last 2` 的结果顺序看起来「不对」 | `last` 保持原顺序，不反转 | 需要倒序就再串一个 [`collections.Reverse`](/functions/collections/reverse/) |
| 没报错但结果不对 | 中文串被截出乱码 | 字符串按**字节**切 | 改用 [`strings.Substr`](/functions/strings/substr/) 或 [`strings.Truncate`](/functions/strings/truncate/) |
| 没报错但结果不对 | 取「最新 5 篇」却拿到了最旧的 5 篇 | `.Pages` 默认按日期升序，`last` 取的是末尾 | 先确认集合顺序，或干脆用 `sort` 指定 `"desc"` |
| 报错看不懂 | `sequence length must be non-negative` | `N` 传了负数 | 用 `math.Max 0 N` 之类的写法先夹住 |

更多排查入口见[故障排查](/troubleshooting/)。

[`where`]: /functions/collections/where/
