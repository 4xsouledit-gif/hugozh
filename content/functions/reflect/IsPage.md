+++
title = "reflect.IsPage"
linkTitle = "IsPage"
description = "报告给定值是否为页面（Page）对象。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/reflect/ispage/"

[params.functions_and_methods]
signatures = ["reflect.IsPage INPUT"]
returnType = "bool"
+++

## 这一页解决什么问题

`site.GetPage`、`where`、`index` 的返回值可能是页面，也可能不是。对不是页面的值调用 `.RelPermalink`、`.Title`、`.Params`，模板会报 `can't evaluate field RelPermalink in type …`，整个构建停下来。

`reflect.IsPage` 让你在取页面字段之前先确认「这确实是一个页面」，从而把守卫写在最外层，而不是等报错再补。

## 什么时候用，什么时候别用

**该用**：

- 写可复用的局部模板：同一个片段既可能收到页面，也可能收到字符串或映射；
- 需要在调用 `.Params`、`.RelPermalink` 之前做防御；
- 判断 `range` 里的 `.` 到底是不是页面对象。

**别用**：

- **不要用它判断 `site.GetPage` 是否成功**。实测（见下表）页面不存在时 `GetPage` 返回的是一个「占位页面」`*page.nopPage`：它在 `if`／`with` 里为假，`reflect.IsPage` 却返回 `true`。判断取没取到，请用 `with`；
- 想判断是不是**资源**（图片、JSON 文件）→ 用 [reflect.IsResource](/functions/reflect/isresource/)。注意实测：页面对象**同时**满足 `reflect.IsPage` 与 `reflect.IsResource`；
- 想判断站点对象 → 用 [reflect.IsSite](/functions/reflect/issite/)。

**（0.154.0 新增）**

```go-html-template {file="layouts/page.html"}
{{ with site.GetPage "/examples" }}
  {{ reflect.IsPage . }} → true
{{ end }}

{{ with .Site  }}
  {{ reflect.IsPage . }} → false
{{ end }}
```

上述两个结论在 Hugo 0.167.0 上实测一致（用 `/example` 页面复现：页面得到 `true`，`.Site` 得到 `false`）。

## 完整示例：既能收页面、也能收字符串的片段

```go-html-template {file="layouts/_partials/link-or-text.html"}
{{ $value := . }}
{{ if reflect.IsPage $value }}<a href="{{ $value.RelPermalink }}">{{ $value.LinkTitle }}</a>{{ else }}<span>{{ $value }}</span>{{ end }}
```

分别用页面与字符串调用：

```go-html-template {file="layouts/index.html"}
{{ partial "link-or-text.html" (site.GetPage "/example") }}
{{ partial "link-or-text.html" "plain" }}
```

Hugo 0.167.0 实测渲染为：

```html
<a href="/example/">Example</a>
<span>plain</span>
```

**你应当看到什么**：页面被渲染成链接（`.RelPermalink` 与 `.LinkTitle` 都取到了），字符串走了 `else` 分支。如果去掉 `reflect.IsPage` 判断、直接对字符串取 `.RelPermalink`，构建会以 `can't evaluate field RelPermalink in type string` 失败。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `site.GetPage "/example"`（页面存在） | `true` | 否 |
| `site.GetPage "/not-there"`（页面不存在） | `true`——**返回的是占位页面**（`printf "%T"` 得到 `*page.nopPage`），虽然它在 `if`／`with` 里为假、与 `nil` 比较也不相等 | 否 |
| `.Site` | `false` | 否 |
| `site.RegularPages`（页面集合） | `false`（实测） | 否 |
| 页面资源（`.Resources.Get "d.json"`） | `false`（实测） | 否 |
| `dict`、字符串、`nil` 字面量 | `false`（实测） | 否 |
| 返回类型 | `bool` | 否 |

实测对照（同一页面对象，三种判空方式结果并不一致）：

| 写法 | 结果 |
| --- | --- |
| `{{ with site.GetPage "/not-there" }}…{{ else }}nil{{ end }}` | `nil`（判为假） |
| `{{ reflect.IsPage (site.GetPage "/not-there") }}` | `true` |
| `{{ eq (site.GetPage "/not-there") nil }}` | `false` |
| `{{ reflect.IsResource (site.GetPage "/not-there") }}` | `true` |
| `{{ printf "%T" (site.GetPage "/not-there") }}` | `*page.nopPage` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `can't evaluate field RelPermalink in type string` | 对非页面值取了页面字段 | 先 `reflect.IsPage`，或改 `with` + `site.GetPage` |
| 没报错但结果不对 | `site.GetPage` 没取到页面，`reflect.IsPage` 却是 `true` | 页面不存在时返回占位对象 `*page.nopPage`，仍满足 `Page` 接口（实测） | 判空一律用 `with`／`if`，不要用 `reflect.IsPage` |
| 没报错但结果不对 | 判断「页面也是资源」，逻辑走错分支 | 页面（包括占位页面）同时满足 `IsPage` 与 `IsResource`（实测） | 用 `reflect.IsPage` 优先排除页面，再判断资源 |
| 没报错但结果不对 | `site.GetPage` 取到的页面内容为空 | 路径写错、页面是草稿/将来日期、或该页未构建，都会得到占位页面而不是报错 | 核对内容路径与构建选项（`--buildDrafts`、`--buildFuture`），或先列出 `.Site.Pages` |
| 报错看不懂 | `wrong number of args for IsPage: want 1 got 2` | 内层函数调用没加括号 | 写 `{{ reflect.IsPage (site.GetPage "/x") }}` |

更多排查入口见[故障排查](/troubleshooting/)。
