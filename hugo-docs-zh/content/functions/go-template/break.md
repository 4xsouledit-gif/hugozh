+++
title = "break"
linkTitle = "break"
description = "终止最内层的 range 迭代，并跳过其余所有迭代。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/go-template/break/"

[params.functions_and_methods]
signatures = ["break"]
+++

## 这一页解决什么问题

`range` 默认会把集合从头走到尾。真实需求经常是「找到就停」——比如在页面列表里找第一个带封面图的页面，找到后继续循环纯属浪费。`break` 就是循环里的「跳出」：**终止最内层的 `range` 迭代，并跳过其余所有迭代**。

## 什么时候用，什么时候别用

**该用**：

- 在循环里「找到第一个符合条件的元素就收工」；
- 已经拿到需要的结果，继续迭代只会浪费构建时间；
- 与 [`if`](/functions/go-template/if/) 配合，在某个条件下提前结束。

**别用**：

- 只是想「跳过当前这一个」→ 用 [`continue`](/functions/go-template/continue/)；
- 只是想筛选元素 → 用 [`where`](/functions/collections/where/)（一次调用就得到结果切片，比手写循环更短也更快）；
- 需要遍历完所有元素并累计 → 不要 `break`；
- 想把结果分组或取前 N 个 → 用 [`collections.Group`](/functions/collections/group/) / [`collections.First`](/functions/collections/first/)。

## 用法

这段模板代码：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  {{ if eq . "bar" }}
    {{ break }}
  {{ end }}
  <p>{{ . }}</p>
{{ end }}
```

渲染结果为：

```html
<p>foo</p>
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

## 完整示例（实测）

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  {{ if eq . "bar" }}
    {{ break }}
  {{ end }}
  <p>{{ . }}</p>
{{ end }}
```

Hugo 0.167.0 实测渲染（`range` 每轮自带空行，这里省略）：

```html
<p>foo</p>
```

**你应当看到什么**：只有 `foo` 被输出。迭代到 `bar` 时 `break` 生效，`bar` 与它后面的 `baz` 都不会再输出。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 在 `range` 内执行 `break` | 立即终止最内层循环，剩余元素全部跳过 | 否 |
| `break` 之后的模板代码 | 循环**之外**的代码照常执行（`break` 只影响循环） | 否 |
| 返回类型 | 无（语句，不产生模板输出） | 否 |

> [!NOTE]
> `break` 只能作用于 [`range`](/functions/go-template/range/)；想跳过当前一轮用 [`continue`](/functions/go-template/continue/)。
