+++
title = "集合函数"
linkTitle = "collections"
description = "用这些函数操作与查询映射（map）、切片（slice）和字符串。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/collections/"
+++

## 这一页解决什么问题

`collections` 下的函数做的事可以概括成四类：**造数据**（`slice`、`dict`、`seq`）、**筛选与截取**（`where`、`first`、`last`、`after`、`in`）、**集合运算**（`intersect`、`union`、`complement`、`symdiff`、`uniq`）、**排序与派生**（`sort`、`reverse`、`shuffle`、`D`、`apply`、`merge`、`querify`），外加两个查找工具 `index`、`isset`。

写列表页、标签云、相关文章、随机推荐时，几乎都要从这一章挑函数。反过来说，模板里大多数「没报错但结果不对」的问题，也都出在这些函数的**参数顺序**与**类型**上——各页末尾的「返回值边界（实测）」小节就是为这个准备的。

## 读完本章你应该能够

- 用 `slice`、`dict`、`seq` 造出模板里的数据与测试用例，并说清切片与映射的区别；
- 用 `where` 筛选、用 `first`/`last`/`after` 截取，并说明为什么不能拿 `first` 去按字符截断中文；
- 用 `intersect`/`union`/`complement`/`symdiff` 表达交集、并集、单向减法、对称差，并指出四者的顺序语义差别；
- 用 `sort`/`uniq`/`reverse` 得到想要的顺序，知道标量切片降序必须写成 `"value" "desc"`；
- 用 `index`/`isset` 取值，并解释「取不到也不报错」会带来什么风险；
- 判断什么时候该改用页面集合自带的方法（`GroupBy`、`ByDate` 等）。

## 什么时候用本章的函数，什么时候别用

**该用**：

- 处理的是**纯数据**（`slice`、`dict`、配置项、`hugo.Data` 读入的数据），而不是页面集合；
- 需要集合运算：交集、并集、单向减法、去重；
- 需要把结果继续交给 `range`、`len`、`delimit` 处理。

**别用**：

- 要排序、分组、分页**页面集合** → 优先用页面集合自带的方法（[methods/pages](/methods/pages/)），它们更贴合 Page，还能直接配合分页；
- 要处理**字符串**（截断、替换、大小写）→ 用 [functions/strings](/functions/strings/) 下的函数；
- 要做**算术** → 用 [functions/math](/functions/math/)；
- 要**格式化日期** → 用 [functions/time](/functions/time/)。

## 阅读顺序

按「先造、再筛、再运算、最后查找」用：

1. **造数据**：[collections.Slice](/functions/collections/slice/) → [collections.Dictionary](/functions/collections/dictionary/) → [collections.Seq](/functions/collections/seq/)
2. **筛选与截取**：[collections.Where](/functions/collections/where/) → [collections.First](/functions/collections/first/) → [collections.Last](/functions/collections/last/) → [collections.After](/functions/collections/after/) → [collections.In](/functions/collections/in/)
3. **集合运算**：[collections.Intersect](/functions/collections/intersect/) → [collections.Union](/functions/collections/union/) → [collections.Complement](/functions/collections/complement/) → [collections.SymDiff](/functions/collections/symdiff/) → [collections.Uniq](/functions/collections/uniq/)
4. **排序与随机**：[collections.Sort](/functions/collections/sort/) → [collections.Reverse](/functions/collections/reverse/) → [collections.Shuffle](/functions/collections/shuffle/) → [collections.D](/functions/collections/d/)
5. **查找、合并与转换**：[collections.Index](/functions/collections/indexfunction/) → [collections.IsSet](/functions/collections/isset/) → [collections.KeyVals](/functions/collections/keyvals/) → [collections.Merge](/functions/collections/merge/) → [collections.Querify](/functions/collections/querify/) → [collections.Apply](/functions/collections/apply/) → [collections.Group](/functions/collections/group/)

映射（map）与切片（slice）的取舍贯穿全章：**要按键查找用映射，要保持顺序、去重、做切片操作用切片。**

## 完整示例：把多篇文章的标签汇总成一张表

```go-html-template {file="layouts/_partials/tag-table.html"}
{{ $posts := slice
     (dict "title" "A" "tags" (slice "Hugo" "Go"))
     (dict "title" "B" "tags" (slice "Go"))
     (dict "title" "C" "tags" (slice "Hugo")) }}
{{ $tags := slice }}
{{ range $posts }}{{ range .tags }}{{ $tags = $tags | append . }}{{ end }}{{ end }}
<p>全部（含重复）：{{ $tags }}</p>
<p>去重：{{ $tags | uniq }}</p>
<p>去重并排序：{{ $tags | uniq | collections.Sort }}</p>
<p>带 Go 的文章：{{ range where $posts "tags" "intersect" (slice "Go") }}{{ .title }} {{ end }}</p>
```

Hugo 渲染为：

```html
<p>全部（含重复）：[Hugo Go Go Hugo]</p>
<p>去重：[Hugo Go]</p>
<p>去重并排序：[Go Hugo]</p>
<p>带 Go 的文章：A B </p>
```

**你应当看到什么**：`append` 只追加、不去重；`uniq` 保序去重；`sort` 才真正排序。筛选时字段本身是**切片**，所以要用 `"intersect"` 这类匹配切片的运算符——实测把 `"intersect"` 换成 `"in"` 会得到空结果。
