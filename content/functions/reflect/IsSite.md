+++
title = "reflect.IsSite"
linkTitle = "IsSite"
description = "报告给定值是否为站点（Site）对象。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/reflect/issite/"

[params.functions_and_methods]
signatures = ["reflect.IsSite INPUT"]
returnType = "bool"
+++

## 这一页解决什么问题

写一个「什么上下文都能收」的局部模板时，你需要知道传进来的到底是**站点对象**（能取 `.Title`、`.RegularPages`、`.Params`）还是**页面对象**（能取 `.RelPermalink`、`.Date`）。取错字段会直接让构建失败。

`reflect.IsSite` 用来确认「这是站点对象」——它是 Hugo 里唯一能拿到 `Site` 的两个入口（全局变量 `site` 与页面上的 `.Site`）的类型标识。

## 什么时候用，什么时候别用

**该用**：

- 局部模板的上下文可能是站点也可能是页面，需要分派；
- 需要在调用 `.Sites`、`.RegularPages`、`.Home` 这类**只有站点才有**的方法之前做守卫。

**别用**：

- 只是要取当前站点 → 直接用全局变量 `site` 或 `.Site`，不需要判断；
- 想判断是不是页面 → 用 [reflect.IsPage](/functions/reflect/ispage/)；
- 想判断「有没有某个参数」→ 用 `with`／[`compare.Default`](/functions/compare/default/)。

**（0.154.0 新增）**

```go-html-template {file="layouts/page.html"}
{{ with .Site  }}
  {{ reflect.IsSite . }} → true
{{ end }}

{{ with site.GetPage "/examples" }}
  {{ reflect.IsSite . }} → false
{{ end }}
```

上述结论在 Hugo 0.167.0 上实测一致（用 `/example` 页面复现：`.Site` 得到 `true`，页面得到 `false`）。

## 完整示例：同一个局部模板处理站点与页面

```go-html-template {file="layouts/_partials/site-info.html"}
{{ $value := . }}
{{ if reflect.IsSite $value }}<p>{{ $value.Title }} 共 {{ len $value.RegularPages }} 页正文</p>{{ else }}<p>不是站点对象</p>{{ end }}
```

分别用站点与页面调用：

```go-html-template {file="layouts/index.html"}
{{ partial "site-info.html" .Site }}
{{ partial "site-info.html" (site.GetPage "/example") }}
```

Hugo 0.167.0 实测渲染为：

```html
<p>Teach Test 共 1 页正文</p>
<p>不是站点对象</p>
```

**你应当看到什么**：站点对象走第一条分支，打印出站点标题与正文页数；页面对象走 `else`。如果把 `.Site` 换成 `.Params` 之类的映射传进去，同样落到 `else`，不会报错——这正是守卫的价值。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `.Site`（以及全局 `site`） | `true` | 否 |
| 页面对象（`site.GetPage "/example"`） | `false` | 否 |
| 页面不存在时的占位对象（`site.GetPage "/not-there"`） | `false`（实测） | 否 |
| `dict`、切片、字符串、`nil` 字面量 | `false`（实测 `reflect.IsSite nil`、`reflect.IsSite "yo"` 都是 `false`） | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 把页面对象当站点用，输出却是空的 | 取站点专有字段时 Hugo 常常**静默返回空值**而不是报错（实测 `(site.GetPage "/example").RegularPages` 输出 `Pages(0)`，`.Sites` 输出空） | 用 `reflect.IsSite` 显式分派，不要指望报错提醒你 |
| 没报错但结果不对 | 局部模板里 `site` 取到的是当前站点而不是传入的站点 | `site` 是**全局变量**，永远指向正在构建的站点，与上下文无关 | 多站点场景要显式使用传入的值（`$value`），不要用全局 `site` |
| 没报错但结果不对 | 判断为假，但你确信传的是站点 | 传进来的是 `.Params`、`.Site.Params` 这类映射 | 传 `.Site` 本身；参数映射用 `reflect.IsMap` 判断 |
| 报错看不懂 | `wrong number of args for IsSite: want 1 got 2` | 内层函数调用没加括号 | 写 `{{ reflect.IsSite (site.GetPage "/x") }}` |

更多排查入口见[故障排查](/troubleshooting/)。
