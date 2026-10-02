+++
title = "collections.KeyVals"
linkTitle = "keyVals"
description = "把给定的 key 与一组值配对，返回一个 KeyVals 结构。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/collections/keyvals/"

[params.functions_and_methods]
signatures = ["collections.KeyVals KEY VALUE..."]
returnType = "types.KeyValues"
aliases = ["keyVals"]
+++

## 这一页解决什么问题

`keyVals` 造一个「**名字 + 一组值**」的结构，它有两个字段：`.Key`（字符串）和 `.Values`（切片）。它基本只有一个正经用途：给 `Pages` 对象上 [`Related`](/methods/pages/related/) 方法的 options 里的 `namedSlices` 传值（上游说明）。

要记住两点：

- 返回值是**结构体**而不是切片，不能直接 `range`（实测 `range keyVals "k" "a" "b"` 会报错），要遍历就 `range $kv.Values`；
- 它与「键 → 值」的映射不是一回事：想要映射请用 [`collections.Dictionary`](/functions/collections/dictionary/)。

## 什么时候用，什么时候别用

**该用**：

- 配置 `Related` 的 `namedSlices`（本函数的设计初衷）；
- 需要一个「一个名字挂一列值」的结构时。

**别用**：

- 想要「键 → 值」映射 → 用 [`collections.Dictionary`](/functions/collections/dictionary/)；
- 想要普通列表 → 用 [`collections.Slice`](/functions/collections/slice/)；
- 想要「多个名字各自的列表」→ 用 `dict` 加 `slice` 自己组合更直观。

## 用法

该函数的主要用途，是为传给 `Pages` 对象上 [`Related`][] 方法的 options 映射定义 `namedSlices` 值。

参见[相关内容][related content]。

```go-html-template
{{ $kv := keyVals "foo" "a" "b" "c" }}
```

得到的数据结构为：

```json
{
  "Key": "foo",
  "Values": [
    "a",
    "b",
    "c"
  ]
}
```

要取出 key 和 values：

```go-html-template
{{ $kv.Key }} → foo
{{ $kv.Values }} → [a b c]
```

## 完整示例：取出名字与列表

```go-html-template {file="layouts/_partials/keyvals.html"}
{{ $kv := keyVals "foo" "a" "b" "c" }}
<p>整个结构：{{ $kv }}</p>
<p>Key：{{ $kv.Key }}</p>
<p>Values：{{ $kv.Values }}</p>
<p>只给名字：{{ (keyVals "bar").Values }}（长度 {{ len (keyVals "bar").Values }}）</p>
<ul>
  {{ range $kv.Values }}<li>{{ . }}</li>{{ end }}
</ul>
```

Hugo 渲染为（`range` 循环会留下空行，这里省略）：

```html
<p>整个结构：foo: [a b c]</p>
<p>Key：foo</p>
<p>Values：[a b c]</p>
<p>只给名字：[]（长度 0）</p>
<ul>
  <li>a</li>
  <li>b</li>
  <li>c</li>
</ul>
```

**你应当看到什么**：结构体默认打印成 `名字: [值…]` 的形式；取值要写 `.Key` / `.Values`；不给 `VALUE` 时 `.Values` 是空切片，不报错。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 给了 `KEY` 与若干 `VALUE` | `types.KeyValues`，`.Key` 是名字、`.Values` 是值列表 | 否 |
| 只给 `KEY`（不给值） | `.Values` 为空切片（实测输出 `k: []`） | 否 |
| 直接 `range` 返回值 | —— | 是：`range can't iterate over k: [a b]` |
| 把多个 KeyVals 放进 `slice` | 可以，实测 `[k: [a] j: [b]]` | 否 |
| 返回类型 | `types.KeyValues` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `range can't iterate over …` | KeyVals 是结构体，不是切片 | 改成 `range $kv.Values` |
| 没报错但结果不对 | 想当映射用却取不到值 | 它只有 `.Key` 和 `.Values` 两个字段 | 需要键值对请用 [`collections.Dictionary`](/functions/collections/dictionary/) |
| 没报错但结果不对 | `Related` 的 `namedSlices` 不生效 | 结构不对：`namedSlices` 要的是 KeyVals 的**切片** | 用 `slice (keyVals …) (keyVals …)` 组装 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Related`]: /methods/pages/related/
[related content]: /content-management/related-content/
