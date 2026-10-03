+++
title = "collections.Merge"
linkTitle = "merge"
description = "把两个或多个给定映射合并为一个映射并返回。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/functions/collections/merge/"

[params.functions_and_methods]
signatures = ["collections.Merge MAP MAP..."]
returnType = "map[string]any"
aliases = ["merge"]
+++

## 这一页解决什么问题

`merge` 把两个或多个映射合成一个，合并顺序**从左到右**：后面的映射会覆盖前面同名 key 的值（大小写不敏感，上游已说明）。最常见的用法是「默认值在前、用户配置在后」——这样用户没写的项自动落回默认值。

它**只处理映射**：无论嵌套多深，切片都不会被合并（上游提示），需要合并切片请用 [`collections.Append`](/functions/collections/append/)。

## 什么时候用，什么时候别用

**该用**：

- 把默认配置与用户配置合并（`merge $defaults $user`）；
- 把站点参数与页面参数合并；
- 嵌套映射的深度合并（实测 `map[a:map[x:1 y:2]]`）。

**别用**：

- 合并切片 → 用 [`collections.Append`](/functions/collections/append/) 或 [`collections.Union`](/functions/collections/union/)；
- 想「保留第一个映射的值、不被覆盖」→ 把优先级高的放**后面**，`merge` 没有「只填空不覆盖」的模式；
- 想从映射里挑几个键 → 用 [`collections.Dictionary`](/functions/collections/dictionary/) 手工构造。

## 用法

返回从左到右合并两个或多个映射的结果。如果 key 已存在，`merge` 会更新它的值；如果 key 不存在，`merge` 会在新 key 下插入该值。

key 的处理不区分大小写。

下面的示例使用这些映射定义：

```go-html-template
{{ $m1 := dict "x" "foo" }}
{{ $m2 := dict "x" "bar" "y" "wibble" }}
{{ $m3 := dict "x" "baz" "y" "wobble" "z" (dict "a" "huey") }}
```

这个示例按顺序合并 `$m1`、`$m2` 和 `$m3`：

```go-html-template
{{ $merged := merge $m1 $m2 $m3 }}

{{ $merged.x }}   → baz
{{ $merged.y }}   → wobble
{{ $merged.z.a }} → huey
```

这个示例按顺序合并 `$m3`、`$m2` 和 `$m1`：

```go-html-template
{{ $merged := merge $m3 $m2 $m1 }}

{{ $merged.x }}   → foo
{{ $merged.y }}   → wibble
{{ $merged.z.a }} → huey
```

这个示例按顺序合并 `$m2`、`$m3` 和 `$m1`：

```go-html-template
{{ $merged := merge $m2 $m3 $m1 }}

{{ $merged.x }}   → foo
{{ $merged.y }}   → wobble
{{ $merged.z.a }} → huey
```

这个示例按顺序合并 `$m1`、`$m3` 和 `$m2`：

```go-html-template
{{ $merged := merge $m1 $m3 $m2 }}

{{ $merged.x }}   → bar
{{ $merged.y }}   → wibble
{{ $merged.z.a }} → huey
```

> [!NOTE]
> 无论嵌套多深，合并都只作用于映射。切片请使用 [`collections.Append`][] 函数。

## 完整示例：默认值 + 用户覆盖

```go-html-template {file="layouts/_partials/merged.html"}
{{ $defaults := dict "color" "blue" "size" "m" }}
{{ $user := dict "color" "red" }}
<p>默认 + 用户：{{ merge $defaults $user }}</p>
<p>用户 + 默认：{{ merge $user $defaults }}</p>
<p>扁平合并：{{ merge (dict "a" 1) (dict "b" 2) }}</p>
<p>深度合并：{{ merge (dict "a" (dict "x" 1)) (dict "a" (dict "y" 2)) }}</p>
<p>第一个参数是 nil：{{ merge nil (dict "a" 1) }}</p>
```

Hugo 渲染为：

```html
<p>默认 + 用户：map[color:red size:m]</p>
<p>用户 + 默认：map[color:blue size:m]</p>
<p>扁平合并：map[a:1 b:2]</p>
<p>深度合并：map[a:map[x:1 y:2]]</p>
<p>第一个参数是 nil：map[a:1]</p>
```

**你应当看到什么**：谁能覆盖谁取决于**顺序**——`merge $defaults $user` 让用户的值生效，反过来则默认值赢；深度合并会合并嵌套映射（`x` 与 `y` 同时保留）；第一个参数是 `nil` 不报错。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 后面的映射有同名 key | 覆盖前面的值（实测 `map[a:2]`） | 否 |
| 第一个参数是 `nil` | 不报错，返回后面的映射（实测 `map[a:1]`） | 否 |
| 后面的参数是 `nil` | —— | 是：`error calling merge: destination must be a map, got <nil>` |
| 参数是切片 | —— | 是：`destination must be a map, got []int` |
| 嵌套映射 | 深度合并（实测 `map[a:map[x:1 y:2]]`） | 否 |
| key 只在大小写上不同 | 按不区分大小写处理（上游已说明），可能互相覆盖 | 否 |
| 返回类型 | `map[string]any`（新映射） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 默认值把用户配置覆盖了 | 合并顺序写反（后面的赢） | 把优先级高的映射放在**后面** |
| 没报错但结果不对 | 配置里的 `color` 和 `Color` 打架 | key 处理不区分大小写（上游已说明） | 统一 key 的大小写命名 |
| 报错看不懂 | `destination must be a map, got <nil>` | 把 `nil` 放在了后面的参数位置 | 先用 `default dict` 兜底，或调整参数顺序 |
| 报错看不懂 | `destination must be a map, got []int` | 想合并切片 | 切片用 [`collections.Append`](/functions/collections/append/) |

更多排查入口见[故障排查](/troubleshooting/)。

[`collections.Append`]: /functions/collections/append/
