+++
title = "reflect.IsSlice"
linkTitle = "IsSlice"
description = "报告给定值是否为切片（slice）。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/reflect/isslice/"

[params.functions_and_methods]
signatures = ["reflect.IsSlice INPUT"]
returnType = "bool"
+++

## 这一页解决什么问题

数据文件里同一个字段，有时写成数组，有时只写了一个值。模板里直接 `range` 那个值，遇到单个值就可能报 `range can't iterate over …`；反过来，把一个切片当成单值处理又会输出 `[a b c]` 这样的字符串。

`reflect.IsSlice` 用来回答「这个值是一组东西，还是单个东西」，让同一个模板对两种写法都能工作。

## 什么时候用，什么时候别用

**该用**：

- 遍历来源不确定的值之前先做守卫；
- 区分「集合」与「标量」，分别用列表或直接输出；
- 判断 `where`、`collections.First`、`.Pages`、`site.RegularPages` 这类结果是否为空集合以外的类型问题。

**别用**：

- 只想判断集合是否为空 → 用 `len` 或 `with`；空切片实测仍是 `true`（它不是 `nil`）；
- 想「无论如何都当集合处理」→ 先判断，再决定是否用 [`collections.Slice`](/functions/collections/slice/) 包一层。**注意 `slice` 不会打平嵌套切片**：实测 `slice (slice 1 2)` 仍是长度为 1 的切片；
- 想判断映射／页面／资源 → 用 [reflect.IsMap](/functions/reflect/ismap/)、[reflect.IsPage](/functions/reflect/ispage/)、[reflect.IsResource](/functions/reflect/isresource/)。

```go-html-template
{{ reflect.IsSlice (slice 1 2 3) }} → true
{{ reflect.IsSlice "yo" }} → false
```

## 完整示例：单个值与数组写法都能渲染

前置元数据可以是 `authors = "张三"`，也可以是 `authors = ["张三", "李四"]`；下面这个局部模板两种都能处理：

```go-html-template {file="layouts/_partials/authors.html"}
{{ $value := .Params.authors }}
{{ $items := $value }}
{{ if not (reflect.IsSlice $value) }}{{ $items = slice $value }}{{ end }}
<ul>{{ range $items }}<li>{{ . }}</li>{{ end }}</ul>
```

`authors = "张三"` 时实测渲染为：

```html
<ul><li>张三</li></ul>
```

`authors = ["张三", "李四"]` 时实测渲染为：

```html
<ul><li>张三</li><li>李四</li></ul>
```

**你应当看到什么**：两种前置元数据写法得到结构一致的列表。如果不加这个判断，字符串写法会直接让构建失败（`range can't iterate over 张三`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `slice 1 2 3` | `true` | 否 |
| 空切片 `slice` | `true`（空集合仍是切片） | 否 |
| `site.RegularPages`、`.Pages` 这类页面集合 | `true` | 否 |
| 字符串（`"yo"`） | `false` | 否 |
| 映射（`dict "a" 1`） | `false` | 否 |
| `nil` | `false` | 否 |
| 页面对象、站点对象 | `false`（实测） | 否 |
| 返回类型 | `bool` | 否 |

配套实测：`slice "张三"` 得到 `[]string`（长度 1），可以安全 `range`；`slice (slice 1 2)` 得到 `[][]int`（长度 1，**不展开**）。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `range can't iterate over 张三` | 前置元数据是字符串，却被当成集合遍历 | 按本页示例先 `reflect.IsSlice` 判断再包 `slice` |
| 没报错但结果不对 | 列表里出现 `[张三 李四]` 一整行 | 反过来：集合被当成了单个值输出，或 `slice` 包了已经切片的值 | 用 `reflect.IsSlice` 分派；不要无条件 `slice` 包一层 |
| 没报错但结果不对 | 用 `with` 判断空集合时「有内容」 | 空切片不为 `nil`，`with` 为真 | 用 `len` 判断：`{{ if gt (len $items) 0 }}` |
| 报错看不懂 | `wrong number of args for IsSlice: want 1 got 2` | 内层函数调用没加括号 | 写 `{{ reflect.IsSlice (where .Pages "Section" "posts") }}` |

更多排查入口见[故障排查](/troubleshooting/)。
