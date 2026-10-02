+++
title = "collections.After"
linkTitle = "after"
description = "返回给定切片中位于前 N 个元素之后的元素所组成的切片。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/collections/after/"

[params.functions_and_methods]
signatures = ["collections.After N SLICE"]
returnType = "[]any"
aliases = ["after"]
+++

## 这一页解决什么问题

`after` 用来**跳过开头 N 个元素**，返回剩下的部分：`after 2 $data` 得到第 3 个及以后的元素。它最常见的用法是和 [`collections.First`](/functions/collections/first/) 配对切出「中间一段」——上游示例就是首页两行：第一行用 `first 1` 显示最新一篇，第二行用 `after 1` 加 `first 3` 显示第 2–4 篇。

它和 `first` 的参数顺序相同（**数量在前、集合在后**），因此管道写法一致：`$data | after 2`。

## 什么时候用，什么时候别用

**该用**：

- 分栏／分段展示：`first 1` 与 `after 1` 配合；
- 想跳过固定数量的开头元素，且保持其余元素的原有顺序。

**别用**：

- 想取前 N 个 → 用 [`collections.First`](/functions/collections/first/)；
- 想取末尾 N 个 → 用 [`collections.Last`](/functions/collections/last/)；
- 想按条件排除元素 → 用 [`collections.Complement`](/functions/collections/complement/) 或 [`collections.Where`](/functions/collections/where/)；
- 想要「从末尾往回数」的偏移 → `after` 只接受正数，实测传负数会报错（见文末），倒着数请用 `last`。

## 基本用法

下面演示 `after` 与 [`slice`][] 函数配合使用：

```go-html-template
{{ $data := slice "one" "two" "three" "four" }}
<ul>
  {{ range after 2 $data }}
    <li>{{ . }}</li>
  {{ end }}
</ul>
```

上面的模板渲染为：

```html
<ul>
  <li>three</li>
  <li>four</li>
</ul>
```

## 与 first 配合使用

你可以把 `after` 与 [`first`][] 函数以及 Hugo [强大的排序方法][powerful sorting methods]组合使用。假设你在 `example.org/articles` 有一个 `section` 页面，共有 10 篇文章，但希望模板只显示两行：

1. 第一行标题为 “Featured”，只显示最近发布的那篇文章（即按内容文件前置元数据中的 `publishdate` 排序后的第一篇）。
1. 第二行标题为 “Recent Articles”，只显示第 2 至第 4 篇最近发布的文章。

```go-html-template {file="layouts/section/articles.html"}
{{ define "main" }}
  <section class="row featured-article">
    <h2>Featured Article</h2>
    {{ range first 1 .Pages.ByPublishDate.Reverse }}
    <header>
      <h3><a href="{{ .RelPermalink }}">{{ .Title }}</a></h3>
    </header>
    <p>{{ .Description }}</p>
  {{ end }}
  </section>
  <div class="row recent-articles">
    <h2>Recent Articles</h2>
    {{ range first 3 (after 1 .Pages.ByPublishDate.Reverse) }}
      <section class="recent-article">
        <header>
          <h3><a href="{{ .RelPermalink }}">{{ .Title }}</a></h3>
        </header>
        <p>{{ .Description }}</p>
      </section>
    {{ end }}
  </div>
{{ end }}
```

## 完整示例：切出「第二到第三篇」

```go-html-template {file="layouts/_partials/articles.html"}
{{ $data := slice "one" "two" "three" "four" }}
<p>after 2：{{ after 2 $data }}</p>
<p>first 2：{{ first 2 $data }}</p>
<p>after 1 再 first 2：{{ after 1 $data | first 2 }}</p>
<p>跳过 0 个：{{ after 0 $data }}</p>
<p>跳过 9 个（超过总数）：{{ after 9 $data }}</p>
```

Hugo 渲染为：

```html
<p>after 2：[three four]</p>
<p>first 2：[one two]</p>
<p>after 1 再 first 2：[two three]</p>
<p>跳过 0 个：[one two three four]</p>
<p>跳过 9 个（超过总数）：[]</p>
```

**你应当看到什么**：`after 0` 原样返回整个切片；跳过的数量**超过总数**时返回空切片而不报错；`after` 与 `first` 串联就能取出中间一段。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `N` 为 `0` | 返回整个切片 | 否 |
| `N` 大于元素总数 | 空切片（`len` 为 0） | 否 |
| 输入是空切片 | 空切片 | 否 |
| 输入是字符串 | 按**字节**跳过：实测 `after 1 "abc"` 得 `bc`，返回类型仍是 `string` | 否 |
| `N` 为负数 | —— | 是：`error calling after: sequence bounds out of range [-1:]` |
| `N` 不是整数 | —— | 是：`unable to cast … to int` |
| 输入是 `nil` | —— | 是：`error calling after: both limit and seq must be provided` |
| 返回类型 | 切片进切片出；字符串进字符串出（签名写作 `[]any`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 「最近文章」里又出现了第一行那篇 | `after N` 是按**位置**跳过，不是按内容去重 | 用 `after 1` 前确认集合已排好序，且两处取的是同一顺序 |
| 没报错但结果不对 | 元素少的时候列表为空 | 跳过的数量超过了总数 | 先用 `len` 判断，或改用 `first` |
| 报错看不懂 | `sequence bounds out of range [-1:]` | 传了负数 | 想倒着数请用 [`collections.Last`](/functions/collections/last/) |
| 报错看不懂 | `both limit and seq must be provided` | 切片是 `nil` | 先用 `with` 判空再调用 |

更多排查入口见[故障排查](/troubleshooting/)。

[`first`]: /functions/collections/first/
[`slice`]: /functions/collections/slice/
[powerful sorting methods]: /quick-reference/page-collections/#sort
