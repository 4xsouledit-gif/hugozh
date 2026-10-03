+++
title = "continue"
linkTitle = "continue"
description = "终止最内层的 range 迭代，并继续执行下一次迭代。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/go-template/continue/"

[params.functions_and_methods]
signatures = ["continue"]
+++

## 这一页解决什么问题

`continue` 跳过当前这一轮 `range` 迭代，直接进入下一轮。它常被用来「过滤」：循环体开头判断条件，不满足就 `continue`，后面的代码只处理满足条件的元素，比把整段逻辑包进 `if` 更扁平。

## 什么时候用，什么时候别用

**该用**：

- 循环里少数元素需要特殊对待，其余照常处理；
- 用「早退出」代替层层嵌套的 `if`，让循环体更好读；
- 与 [`if`](/functions/go-template/if/) 配合检查前置条件。

**别用**：

- 想结束整个循环 → 用 [`break`](/functions/go-template/break/)；
- 只是想过滤集合 → 用 [`where`](/functions/collections/where/) 先把集合筛干净再 `range`，通常更快也更短；
- 需要「跳过重复项」→ 用 [`collections.Uniq`](/functions/collections/uniq/)。

## 用法

这段模板代码：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  {{ if eq . "bar" }}
    {{ continue }}
  {{ end }}
  <p>{{ . }}</p>
{{ end }}
```

渲染结果为：

```html
<p>foo</p>
<p>baz</p>
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

## 完整示例（实测）

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  {{ if eq . "bar" }}
    {{ continue }}
  {{ end }}
  <p>{{ . }}</p>
{{ end }}
```

Hugo 0.167.0 实测渲染（`range` 每轮自带空行，这里省略）：

```html
<p>foo</p>
<p>baz</p>
```

**你应当看到什么**：`bar` 被跳过，`foo` 与 `baz` 照常输出——与 `break` 不同，循环没有结束，只是进入下一轮。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 在 `range` 内执行 `continue` | 跳过本轮剩余代码，继续下一轮 | 否 |
| 循环中最后一个元素被 `continue` | 循环正常结束 | 否 |
| 返回类型 | 无（语句，不产生模板输出） | 否 |

> [!NOTE]
> `continue` 只能作用于 [`range`](/functions/go-template/range/)；想结束整个循环用 [`break`](/functions/go-template/break/)。
