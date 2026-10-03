+++
title = "reflect.IsMap"
linkTitle = "IsMap"
description = "报告给定值是否为映射（map）。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/reflect/ismap/"

[params.functions_and_methods]
signatures = ["reflect.IsMap INPUT"]
returnType = "bool"
+++

## 这一页解决什么问题

从数据文件、站点配置或页面参数里取出的值，可能是一个映射（`dict`、YAML/JSON/TOML 里的对象），也可能是字符串、切片或数字。直接对它 `range $k, $v := …`，一旦它不是映射，模板就会报 `range can't iterate over …`。

`reflect.IsMap` 让你在动手之前先问一句「这是映射吗」，从而写出对多种输入都安全的模板。

## 什么时候用，什么时候别用

**该用**：

- 要遍历一个「不知道是映射还是别的什么」的值；
- 内容数据（`data/`、`hugo.Data`）可能同时存在对象与数组两种写法；
- 需要按类型分派：映射 → 键值列表，切片 → 有序列表，标量 → 直接输出。

**别用**：

- 只想判断「有没有值」→ 用 `with` 或 [`compare.Default`](/functions/compare/default/)；
- 想判断是不是切片／页面／资源 → 用 [reflect.IsSlice](/functions/reflect/isslice/)、[reflect.IsPage](/functions/reflect/ispage/)、[reflect.IsResource](/functions/reflect/isresource/)；
- 想把字符串转成映射 → 用 [`transform.Unmarshal`](/functions/transform/unmarshal/)，本函数不做转换。

```go-html-template
{{ reflect.IsMap (dict "key" "value") }} → true
{{ reflect.IsMap "yo" }} → false
```

## 完整示例：按类型分派渲染

```go-html-template {file="layouts/index.html"}
{{ define "show" }}
{{ if reflect.IsMap . }}<ul>{{ range $k, $v := . }}<li>{{ $k }} = {{ $v }}</li>{{ end }}</ul>
{{ else if reflect.IsSlice . }}<ol>{{ range . }}<li>{{ . }}</li>{{ end }}</ol>
{{ else }}<p>{{ . }}</p>{{ end }}
{{ end }}
{{ template "show" (dict "name" "hugo" "count" 3) }}
{{ template "show" (slice "a" "b") }}
{{ template "show" "plain" }}
```

Hugo 0.167.0 实测渲染为（空行来自 `define` 与模板自身的换行）：

```html
<ul><li>count = 3</li><li>name = hugo</li></ul>
<ol><li>a</li><li>b</li></ol>
<p>plain</p>
```

**你应当看到什么**：同一个模板块对三种输入给出了三种结构。注意映射的键是**按字母排序**输出的（`count` 在 `name` 之前）——这是 Go 模板对映射的固定行为，不要指望它保持数据文件里的书写顺序。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `dict "key" "value"` | `true` | 否 |
| `.Params`（页面参数，即使为空） | `true` | 否 |
| 字符串（`"yo"`） | `false` | 否 |
| 切片（`slice 1 2`） | `false` | 否 |
| `nil` | `false` | 否 |
| 页面对象、站点对象 | 上游未说明；实测 `false` | 否 |
| 返回类型 | `bool`，从不返回 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `range can't iterate over …` | 对非映射/切片的值做了 `range` | 先用 `reflect.IsMap`／[reflect.IsSlice](/functions/reflect/isslice/) 守卫，或改用 `with` |
| 没报错但结果不对 | 输出顺序与数据文件里不一致 | Go 模板遍历映射时按键排序 | 需要固定顺序就先把键显式写成切片再按它取值 |
| 没报错但结果不对 | 页面参数明明是对象，却判成不是映射 | 取到的是更外层的值（例如忘了 `.Params` 前缀） | 先 `{{ debug.Dump .Params }}` 确认值的形状 |
| 报错看不懂 | `can't evaluate field x in type interface {}` | 值不是映射却按映射取字段 | 加 `reflect.IsMap` 判断，或改用 `index` + `with` |
| 报错看不懂 | `wrong number of args for IsMap: want 1 got 2` | 内层函数调用没加括号，例如 `{{ reflect.IsMap site.GetPage "/x" }}`——`"/x"` 被当成了本函数的第二个参数 | 用括号把内层调用包起来：`{{ reflect.IsMap (site.GetPage "/x") }}` |

更多排查入口见[故障排查](/troubleshooting/)。
