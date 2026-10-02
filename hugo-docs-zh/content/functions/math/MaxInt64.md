+++
title = "math.MaxInt64"
linkTitle = "math.MaxInt64"
description = "返回有符号 64 位整数的最大值。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/math/maxint64/"

[params.functions_and_methods]
signatures = ["math.MaxInt64"]
returnType = "int64"
+++

## 这一页解决什么问题

Go 模板的 `range` 通常用来遍历集合，但有时你只想要「一直循环，直到满足条件才 `break`」——例如按序号生成一串元素、反复处理直到命中。Go 模板没有 `while`，`math.MaxInt64` 提供了一个「足够大」的整数，`range` 它再配合 `break` 就等价于无限循环。

```go-html-template
{{ math.MaxInt64 }} → 9223372036854775807
```

**（0.147.3 新增）**

## 什么时候用，什么时候别用

**该用**：

- 需要一个「上限极大」的循环，靠 `break` 结束（上游给出的正是这种用法）；
- 需要某个「实际不可能达到」的哨兵值参与比较。

**别用**：

- 明确知道循环次数 → 用 `range $n` 或 `seq`；
- 遍历集合 → 直接 `range` 集合；
- 忘了写 `break` → 会真的循环到 9223372036854775807 次，构建会卡死。**这是本函数唯一的真实风险**。

当需要模拟一个持续到满足中断条件才结束的循环时，这个函数很有用。例如：

```go-html-template
{{ range math.MaxInt64 }}
  {{ if eq . 42 }}
    {{ break }}
  {{ end }}
{{ end }}
```

## 完整示例：循环到 3 就停

```go-html-template {file="layouts/_partials/maxint64-demo.html"}
<p>最大值：{{ math.MaxInt64 }}</p>
<p>循环到 3 就停：{{ range math.MaxInt64 }}{{ if eq . 3 }}{{ break }}{{ end }}{{ . }} {{ end }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>最大值：9223372036854775807</p>
<p>循环到 3 就停：0 1 2 </p>
```

**你应当看到什么**：`range math.MaxInt64` 从 **0** 开始（不是 1），依次给出 `0 1 2`，到 `3` 时 `break` 结束。因此这个函数生成的是「从 0 开始的序号」；若要从 1 开始输出，循环体里用 `add . 1`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 直接输出 | `9223372036854775807` | 否 |
| `range math.MaxInt64` 的起始值 | `0`（实测循环体先收到 0） | 否 |
| 配合 `{{ if eq . 3 }}{{ break }}{{ end }}` | 输出 `0 1 2 `，随后结束 | 否 |
| 忘记 `break` | 会执行约 9.2×10¹⁸ 次迭代，构建实际上无法完成 | 否（但会卡住） |
| 返回类型 | `int64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建卡死 | `hugo` 长时间不结束 | `range math.MaxInt64` 里没有 `break`，或 `break` 条件永不为真 | 一定要写 `break`；先用一个较小的数（如 `10`）验证逻辑再换成 `math.MaxInt64` |
| 没报错但结果不对 | 序号从 0 开始，比预期少 1 | `range` 从 0 起算 | 用 `{{ add . 1 }}` 输出 |
| 没报错但结果不对 | 想把结果当「无穷大」参与数值比较 | `int64` 与 `float64` 混算时精度不同 | 明确用 `float` 或直接用该常量做比较 |

更多排查入口见[故障排查](/troubleshooting/)。
