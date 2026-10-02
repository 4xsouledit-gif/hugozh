+++
title = "collections.Dictionary"
linkTitle = "dict"
description = "根据给定的键值对创建一个映射（map）。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/collections/dictionary/"

[params.functions_and_methods]
signatures = ["collections.Dictionary [VALUE...]"]
returnType = "map[string]any"
aliases = ["dict"]
+++

## 这一页解决什么问题

`dict` 用来在模板里**临时造一个映射**（key → value）。最常见的三个用途：给局部模板（partial）一次传一组命名参数、把手边的几个值打包后交给别的函数、在调试模板逻辑时造测试数据。它不依赖任何内容文件，是模板里最常用的「数据构造器」。

另一个容易忽略的能力：`key` 除了字符串，还可以是 `[]string`，此时会生成**逐层嵌套**的结构（见下）。

## 什么时候用，什么时候别用

**该用**：

- 给 partial 传多个值：`{{ partial "card.html" (dict "title" .Title "url" .RelPermalink) }}`；
- 手工构造测试数据（本站参考页的示例大量这么用）；
- 需要一个空映射作为累积起点：`{{ $m := dict }}`。

**别用**：

- 想合并两个已有的映射 → 用 [`collections.Merge`](/functions/collections/merge/)；
- 想按固定顺序存放一串值 → 用 [`collections.Slice`](/functions/collections/slice/)（映射是「键 → 值」的查找结构，本身没有顺序概念）；
- 想生成 URL 查询字符串 → 用 [`collections.Querify`](/functions/collections/querify/)；
- 能在前置元数据（front matter）里写的数据，不要硬编码进模板。

参数必须**成对**出现，且 key 只能是字符串或 `[]string`——这是最容易踩的一条（报错见文末实测表）。

## 用法

把键值对作为一个个独立参数传入：

```go-html-template
{{ $m := dict "a" 1 "b" 2 }}
```

上面会生成如下数据结构：

```json
{
  "a": 1,
  "b": 2
}
```

注意 `key` 既可以是 `string`，也可以是 `[]string`。后者可用于创建深层嵌套的结构，例如：

```go-html-template
{{ $m := dict (slice "a" "b" "c") "value" }}
```

上面会生成如下数据结构：

```json
{
  "a": {
    "b": {
      "c": "value"
    }
  }
}
```

要创建空映射：

```go-html-template
{{ $m := dict }}
```

## 完整示例：构造数据并按 key 取值

```go-html-template {file="layouts/_partials/book.html"}
{{ $m := dict "title" "Hugo 入门" "price" 42 }}
<p>{{ index $m "title" }} 定价 {{ index $m "price" }} 元</p>
<p>键数：{{ len $m }}</p>
<p>嵌套取值：{{ index (dict (slice "a" "b" "c") "value") "a" "b" "c" }}</p>
<p>空映射：{{ dict }}，长度 {{ len (dict) }}</p>
<p>值为 nil：{{ index (dict "a" nil) "a" }}</p>
```

Hugo 渲染为：

```html
<p>Hugo 入门 定价 42 元</p>
<p>键数：2</p>
<p>嵌套取值：value</p>
<p>空映射：map[]，长度 0</p>
<p>值为 nil：（输出为空，不报错）</p>
```

**你应当看到什么**：`index` 按 key 取值（嵌套结构就逐层 `index`）；`dict` 不带参数得到空映射；值可以是 `nil`，不会报错——但**单独打印一个 `nil` 值得到的是空输出**（实测），所以判断「有没有值」要用 `with`，不能看输出是否为空。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 参数成对 | 正常返回映射 | 否 |
| 无参数（`dict`） | 空映射，输出 `map[]`，`len` 为 0 | 否 |
| key 重复（`dict "a" 1 "a" 2`） | 后者覆盖前者，实测得到 `map[a:2]` | 否 |
| key 是 `[]string` | 生成逐层嵌套结构 | 否 |
| value 是 `nil` | 允许；打印整个映射得 `map[a:<nil>]`，而单独取值输出为空（实测） | 否 |
| 参数个数是奇数（`dict "a" 1 "b"`） | —— | 是：`error calling dict: invalid dictionary call` |
| key 不是字符串或 `[]string`（如 `dict 1 "x"`） | —— | 是：`error calling dict: invalid dictionary key` |
| 返回值类型 | `map[string]any` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `invalid dictionary call` | 键值对没成对，参数个数是奇数 | 检查每个 key 后面都跟着 value |
| 报错看不懂 | `invalid dictionary key` | key 用了数字等非字符串类型 | key 写字符串；需要数字下标请用 [`collections.Slice`](/functions/collections/slice/) |
| 没报错但结果不对 | 取不到值 | key 含点号（如 `a.b`）时字段写法不适用 | 用 `index $m "a.b"`（实测可行） |
| 没报错但结果不对 | 传给 partial 后字段取不到 | partial 里要用 `.title`（或 `index . "title"`），key 大小写必须一致 | 统一 key 命名为小写，取值处与定义处核对 |

更多排查入口见[故障排查](/troubleshooting/)。
