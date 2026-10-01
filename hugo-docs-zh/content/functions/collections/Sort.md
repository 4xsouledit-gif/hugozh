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

对切片做升序排序时 `KEY` 可以省略，其他情况则必填。排序切片时，请用字面量 `value` 代替 `KEY`。参见下面的示例。

`ORDER` 可以是 `asc`（升序）或 `desc`（降序）。默认排序顺序为升序。

## 排序切片

下面的示例假定项目配置为：

```toml
[params]
grades = ['b','a','c']
```

### 升序 {#slice-ascending-order}

用下面任一写法按升序对切片元素排序：

```go-html-template
{{ sort site.Params.grades }} → [a b c]
{{ sort site.Params.grades "value" "asc" }} → [a b c]
```

上面的示例中，`value` 就是代表切片元素值的 `KEY`。

### 降序 {#slice-descending-order}

按降序对切片元素排序：

```go-html-template
{{ sort site.Params.grades "value" "desc" }} → [c b a]
```

上面的示例中，`value` 就是代表切片元素值的 `KEY`。

## 排序映射

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

### 升序 {#map-ascending-order}

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

### 降序 {#map-descending-order}

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

### 移除第一层 key

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

## 排序页面集合

> [!NOTE]
> 虽然你可以用 `sort` 函数排序页面集合，但 Hugo 也提供了[排序与分组方法][sorting and grouping methods]。

在这个刻意构造的示例中，按 `.Type` 降序排序站点的普通页面：

```go-html-template
{{ range sort site.RegularPages "Type" "desc" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

[sorting and grouping methods]: /methods/pages/
