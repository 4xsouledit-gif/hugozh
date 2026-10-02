+++
title = "collections.Sort"
linkTitle = "sort"
description = "按指定的 key 与顺序重排给定集合，返回排序后的映射或切片。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/functions/collections/sort/"

[params.functions_and_methods]
signatures = ["collections.Sort MAP|SLICE [KEY] [ORDER]"]
returnType = "any"
aliases = ["sort"]
+++

## 这一页解决什么问题

模板要按某个字段排序时用它：按日期、标题、权重、价格排页面或 `dict` 列表。它有两种典型输入：

- **标量切片**（`["b" "a" "c"]`、`[3 1 2]`）：默认升序，`KEY` 可省略；
- **映射或「映射构成的切片」**（页面集合、`dict` 列表）：必须给出 `KEY`，Hugo 按该 key 的值排序。

**最容易踩的一脚**：想对**标量切片**降序时，不能只写 `"desc"`——那个位置是 `KEY`，实测会直接报错。正确写法是把字面量 `value` 作为 `KEY` 补上：`sort $slice "value" "desc"`。

## 什么时候用，什么时候别用

**该用**：

- 数据切片按字段排序（`dict` 列表、`hugo.Data` 读入的数据）；
- 配置里的标量列表排序。

**别用**：

- 排序**页面集合** → 优先用页面集合自带的排序方法（见 [`methods/pages`](/methods/pages/)），它们更贴合 Page，且能直接与分组、分页配合；
- 想**分组** → 用页面集合的分组方法（如 [`PAGES.GroupBy`](/methods/pages/groupby/)）；
- 只是想要「最近的 N 篇」而已 → 集合已排序时直接用 [`collections.First`](/functions/collections/first/)；
- 想反转既有顺序 → 用 [`collections.Reverse`](/functions/collections/reverse/)，`sort` 会重新比较，不是简单倒序。

## 用法

对切片做升序排序时 `KEY` 可以省略，其他情况则必填。排序切片时，请用字面量 `value` 代替 `KEY`。参见下面的示例。

`ORDER` 可以是 `asc`（升序）或 `desc`（降序）。默认排序顺序为升序。

### 排序切片

下面的示例假定项目配置为：

```toml
[params]
grades = ['b','a','c']
```

#### 升序 {#slice-ascending-order}

用下面任一写法按升序对切片元素排序：

```go-html-template
{{ sort site.Params.grades }} → [a b c]
{{ sort site.Params.grades "value" "asc" }} → [a b c]
```

上面的示例中，`value` 就是代表切片元素值的 `KEY`。

#### 降序 {#slice-descending-order}

按降序对切片元素排序：

```go-html-template
{{ sort site.Params.grades "value" "desc" }} → [c b a]
```

上面的示例中，`value` 就是代表切片元素值的 `KEY`。

### 排序映射

下面的示例假定项目配置为：

```toml
[params.authors.a]
firstName = 'Marius'
lastName  = 'Pontmercy'
[params.authors.b]
firstName = 'Victor'
lastName  = 'Hugo'
[params.authors.c]
firstName = 'Jean'
lastName  = 'Valjean'
```

> [!NOTE]
> 排序映射时，`KEY` 参数必须用小写。

#### 升序 {#map-ascending-order}

用下面任一写法按升序对映射对象排序：

```go-html-template
{{ range sort site.Params.authors "firstname" }}
  {{ .firstName }}
{{ end }}

{{ range sort site.Params.authors "firstname" "asc" }}
  {{ .firstName }}
{{ end }}
```

它们输出：

```text
Jean Marius Victor
```

#### 降序 {#map-descending-order}

按降序对映射对象排序：

```go-html-template
{{ range sort site.Params.authors "firstname" "desc" }}
  {{ .firstName }}
{{ end }}
```

输出：

```text
Victor Marius Jean
```

#### 移除第一层 key

Hugo 在排序映射时会移除第一层的 key。

原始映射：

```json
{
  "felix": {
    "breed": "malicious",
    "type": "cat"
  },
  "spot": {
    "breed": "boxer",
    "type": "dog"
  }
}
```

排序之后：

```json
[
  {
    "breed": "malicious",
    "type": "cat"
  },
  {
    "breed": "boxer",
    "type": "dog"
  }
]
```

### 排序页面集合

> [!NOTE]
> 虽然你可以用 `sort` 函数排序页面集合，但 Hugo 也提供了[排序与分组方法][sorting and grouping methods]。

在这个刻意构造的示例中，按 `.Type` 降序排序站点的普通页面：

```go-html-template
{{ range sort site.RegularPages "Type" "desc" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：标量切片与 dict 列表

```go-html-template {file="layouts/_partials/sorted.html"}
{{ $nums := slice 3 1 2 }}
<p>默认升序：{{ sort $nums }}</p>
<p>显式 asc：{{ sort $nums "value" "asc" }}</p>
<p>降序：{{ sort $nums "value" "desc" }}</p>
<p>大小写混合：{{ sort (slice "b" "A" "a") }}</p>
{{ $items := slice (dict "n" 2) (dict "n" 1) (dict "n" 3) }}
<p>按 n 升序：{{ sort $items "n" }}</p>
<p>按 n 降序：{{ sort $items "n" "desc" }}</p>
```

Hugo 渲染为：

```html
<p>默认升序：[1 2 3]</p>
<p>显式 asc：[1 2 3]</p>
<p>降序：[3 2 1]</p>
<p>大小写混合：[a A b]</p>
<p>按 n 升序：[map[n:1] map[n:2] map[n:3]]</p>
<p>按 n 降序：[map[n:3] map[n:2] map[n:1]]</p>
```

**你应当看到什么**：标量切片省略 `KEY` 时按升序；降序必须写成 `"value" "desc"`；`dict` 列表按 `KEY` 排序；字符串排序**不区分大小写**（`[a A b]`，大写不会整体排在小写后面）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 标量切片，省略 `KEY` | 升序 | 否 |
| 标量切片，`"value" "desc"` | 降序（实测 `[3 2 1]`） | 否 |
| 标量切片，只写 `"desc"` | —— | 是：`error calling sort: desc is neither a struct field, a method nor a map element of type int` |
| 输入是字符串 | —— | 是：`error calling sort: can't sort string` |
| `KEY` 在元素里不存在 | 不报错，元素保持原顺序 | 否 |
| 输入是映射且省略 `KEY` | 返回按 key 排序后的**值**列表（第一层 key 被移除），实测 `sort (dict "b" 2 "a" 1)` 得 `[1 2]` | 否 |
| 输入是映射却写 `"desc"` | —— | 是：`error calling sort: desc is neither a struct field, a method nor a map element of type interface {}` |
| 返回类型 | 与输入同类（签名写作 `any`）；页面集合仍是页面集合 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `desc is neither a struct field, a method nor a map element` | 对**标量切片**降序时漏了 `KEY`，`"desc"` 被当成字段名 | 写成 `sort $slice "value" "desc"` |
| 报错看不懂 | `can't sort string` | 把字符串当集合传了 | 先 `split` 成切片 |
| 没报错但结果不对 | 排序没有变化 | `KEY` 拼错或大小写不符（映射的 `KEY` 必须小写，上游已说明） | 先打印一个元素确认字段名 |
| 没报错但结果不对 | 排序结果里第一层 key 不见了 | 排序映射时 Hugo 会移除第一层 key（上游已说明） | 想保留 key 就改成对 `dict` 列表排序，或 `range` 自己拼 |
| 没报错但结果不对 | 页面顺序和 `.ByDate` 等方法不一致 | 页面集合应当优先用自带排序方法 | 改用 [`methods/pages`](/methods/pages/) 里的排序方法 |

更多排查入口见[故障排查](/troubleshooting/)。

[sorting and grouping methods]: /methods/pages/
