+++
title = "collections.Intersect"
linkTitle = "intersect"
description = "返回两个给定切片中的公共元素，顺序与第一个切片一致。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/collections/intersect/"

[params.functions_and_methods]
signatures = ["collections.Intersect SLICE1 SLICE2"]
returnType = "[]any"
aliases = ["intersect"]
+++

## 这一页解决什么问题

`intersect` 取两个集合的**公共元素**：只在第一个切片里出现、同时也出现在第二个切片里的元素。描述里有一个容易忽略的细节——**输出顺序跟着第一个切片走**（实测 `intersect (slice "b" "a" "c") (slice "c" "a")` 得 `[a c]`，而不是 `[c a]`）。

在页面集合上，它常被当作 `AND` 过滤器使用（上游示例）：先 `where` 收窄，再用 `intersect` 叠加另一个条件。想要 `OR` 的语义请用 [`collections.Union`](/functions/collections/union/)。

## 什么时候用，什么时候别用

**该用**：

- 两个条件必须同时满足：`$pages | intersect (where site.RegularPages "Params.images" "!=" nil)`；
- 比较分类法（taxonomy）术语，找「同时属于这两个标签」的条目；
- 需要保持第一个集合的呈现顺序。

**别用**：

- 想取并集（满足任一条件）→ 用 [`collections.Union`](/functions/collections/union/)；
- 想取「只在其中一个里出现」的差集 → 用 [`collections.SymDiff`](/functions/collections/symdiff/)；
- 想「排除」→ 用 [`collections.Complement`](/functions/collections/complement/)；
- 条件能直接写进一个 `where` 表达式时，不必拆成两次再 `intersect`。

## 用法

一个有用的例子是把它与 where 组合起来，当作 `AND` 过滤器使用：

```go-html-template
{{ $pages := where .Site.RegularPages "Type" "not in" (slice "page" "about") }}
{{ $pages := $pages | union (where .Site.RegularPages "Params.pinned" true) }}
{{ $pages := $pages | intersect (where .Site.RegularPages "Params.images" "!=" nil) }}
```

上面的代码会取出类型不是 `page` 或 `about` 的普通页面，除非它们被 pin 了。最后，我们排除掉所有未在 Page 参数中设置 `images` 的页面。

`OR` 请参见 [union][]。

## 完整示例：取两个标签列表的共同项

```go-html-template {file="layouts/_partials/common-tags.html"}
{{ $a := slice "Hugo" "Go" "模板" }}
{{ $b := slice "Go" "Hugo" "短代码" }}
<p>共同项：{{ intersect $a $b }}</p>
<p>顺序跟着第一个切片：{{ intersect (slice "b" "a" "c") (slice "c" "a") }}</p>
<p>没有共同项：{{ intersect (slice "x") (slice "y") }}，长度 {{ len (intersect (slice "x") (slice "y")) }}</p>
<p>其中一个为空：{{ intersect $a (slice) }}</p>
```

Hugo 渲染为：

```html
<p>共同项：[Hugo Go]</p>
<p>顺序跟着第一个切片：[a c]</p>
<p>没有共同项：[]，长度 0</p>
<p>其中一个为空：[]</p>
```

**你应当看到什么**：元素按**第一个切片**中的出现顺序输出；没有共同项时返回空切片（`len` 为 0）；结果不重复。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 没有公共元素 | 空切片 | 否 |
| 任一输入是空切片 | 空切片 | 否 |
| 两个切片的公共元素有多个 | 按第一个切片的顺序输出 | 否 |
| 第一个参数是 `nil` | 空切片（不报错） | 否 |
| 第二个参数是字符串 | —— | 是：`error calling intersect: can't iterate over string` |
| 元素是页面（`Page`） | 只要两个集合里是同一批对象就能取到公共项 | 否 |
| 返回类型 | `[]any` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 结果顺序「乱」 | 输出顺序由第一个切片决定，不是第二个 | 先把作为「基准」的集合放在第一个参数位置 |
| 没报错但结果不对 | 页面集合取不到公共项 | 两个集合里的 Page 不是同一批（例如一边用了 `.Site.RegularPages`，一边用了 `.Pages`） | 用同一种方式取集合 |
| 报错看不懂 | `can't iterate over string` | 把字符串当切片传了 | 字符串先 [`strings.Split`](/functions/strings/split/) |
| 报错看不懂 | `can't iterate over <nil>` | 某个变量是 `nil` | 先用 `with` 判空 |

更多排查入口见[故障排查](/troubleshooting/)。

[union]: /functions/collections/union/
