+++
title = "collections.Union"
linkTitle = "union"
description = "返回两个给定切片中的全部不重复元素。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/functions/collections/union/"

[params.functions_and_methods]
signatures = ["collections.Union SLICE1 SLICE2"]
returnType = "[]any"
aliases = ["union"]
+++

## 这一页解决什么问题

`union` 把两个集合**合并并去重**：结果先按第一个切片的顺序排，再追加第二个切片里新出现的元素。实测 `union (slice "c" "a") (slice "b" "a")` 得 `[c a b]`。

页面集合上它承担 `OR` 过滤器的角色（上游示例）：只要满足任一条件就保留。与之相对，`AND` 用 [`collections.Intersect`](/functions/collections/intersect/)。

## 什么时候用，什么时候别用

**该用**：

- 两个来源的页面合并成一份列表（「置顶的 + 最新的」）；
- 合并标签、术语列表并自动去重；
- 需要表达 `OR` 语义的 where 查询。

**别用**：

- 只要交集 → 用 [`collections.Intersect`](/functions/collections/intersect/)；
- 只要差集 → 用 [`collections.SymDiff`](/functions/collections/symdiff/) 或 [`collections.Complement`](/functions/collections/complement/)；
- 只是想在末尾续接、**不关心去重** → 用 [`collections.Append`](/functions/collections/append/)（`union` 会额外做去重，语义更强）；
- 想合并的是映射 → 用 [`collections.Merge`](/functions/collections/merge/)。

## 基本用法

用 `union` 函数合并两个切片，并去掉重复元素：

```go-html-template
{{ union (slice 1 2 3) (slice 3 4 5) }} → [1 2 3 4 5]
{{ union (slice 1 2 3) nil }}           → [1 2 3]
{{ union nil (slice 1 2 3) }}           → [1 2 3]
{{ union nil nil }}                     → []
```

## where 查询中的 OR 过滤

与 where 组合使用时，它也可以当作 `OR` 过滤器：

```go-html-template
{{ $pages := where .Site.RegularPages "Type" "not in" (slice "page" "about") }}
{{ $pages = $pages | union (where .Site.RegularPages "Params.pinned" true) }}
{{ $pages = $pages | intersect (where .Site.RegularPages "Params.images" "!=" nil) }}
```

上面的代码会取出类型不是 `page` 或 `about` 的普通页面，除非它们被 pin 了。最后，我们排除掉所有未在 Page 参数中设置 `images` 的页面。

`AND` 请参见 [intersect][]。

## 完整示例：合并两个标签列表并去重

```go-html-template {file="layouts/_partials/all-tags.html"}
{{ $a := slice "Hugo" "Go" }}
{{ $b := slice "Go" "模板" }}
<p>并集：{{ union $a $b }}</p>
<p>顺序：{{ union (slice "c" "a") (slice "b" "a") }}</p>
<p>与 append 对比：{{ append $a $b }}</p>
<p>两个 nil：{{ union nil nil }}，长度 {{ len (union nil nil) }}</p>
```

Hugo 渲染为：

```html
<p>并集：[Hugo Go 模板]</p>
<p>顺序：[c a b]</p>
<p>与 append 对比：[Go 模板 Hugo Go]</p>
<p>两个 nil：[]，长度 0</p>
```

**你应当看到什么**：`union` 去掉了重复的 `Go`，而 `append` 原样保留；`union` 先排**第一个**切片的元素，再补第二个切片里没出现过的新元素（所以顺序是 `[c a b]`）。第三行的 `append $a $b` 顺序看着「反了」，是因为 [`collections.Append`](/functions/collections/append/) 把**最后一个参数当作追加目标**——它把 `$a` 追加到了 `$b` 后面，得到 `[Go 模板 Hugo Go]`。这也说明「合并去重」请用 `union`，不要拿 `append` 硬凑。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 两个 `nil` | 空切片 | 否 |
| 一个参数是 `nil` | 返回另一个切片的内容（上游已说明，实测一致） | 否 |
| 两个切片有重复元素 | 去重，保留首次出现的顺序 | 否 |
| 两个切片都为空 | 空切片 | 否 |
| 元素是页面（`Page`） | 可合并，重复的同一 Page 只保留一次 | 否 |
| 参数不是切片（如字符串 `"ab"`） | —— | 是：`error calling union: can't iterate over string` |
| 返回类型 | `[]any` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 结果里保留了重复项 | 用的是 [`collections.Append`](/functions/collections/append/) 而不是 `union` | 需要去重就换 `union` |
| 没报错但结果不对 | 元素顺序和预期不同 | 先第一个切片的顺序，再第二个切片的新元素 | 需要固定顺序时对结果再接 [`collections.Sort`](/functions/collections/sort/) |
| 报错看不懂 | `arguments must be slices or arrays` | 传了字符串或 `nil` 之外的标量 | 字符串先 `split`；确认参数都是切片 |
| 没报错但结果不对 | 页面合并后总数不对 | 两个集合里有同一批 Page，被去重了 | 这是 `union` 的预期行为；要不做去重就用 `append` |

更多排查入口见[故障排查](/troubleshooting/)。

[intersect]: /functions/collections/intersect/
