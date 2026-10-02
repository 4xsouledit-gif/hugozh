+++
title = "compare.Default"
linkTitle = "compare.Default"
description = "如果第二个参数已设置则返回它，否则返回第一个参数。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/compare/default/"

[params.functions_and_methods]
signatures = ["compare.Default DEFAULT INPUT"]
returnType = "any"
aliases = ["default"]
+++

## 这一页解决什么问题

写模板时最怕「参数没写」：站点的 `[params]` 里没有 `tagline`、文章的 front matter 里没有 `author`、`hugo.Data` 里缺一个字段——直接输出就是空，页面看起来像坏了。`default` 给这些值一个兜底：**第二个参数没设置时返回第一个参数**。

`default` 与 `compare.Default` 是同一个函数：`default` 是别名。写法有两种，注意参数顺序相反：

```go-html-template
{{ default 42 $qty }}   <!-- 函数式：DEFAULT INPUT -->
{{ $qty | default 42 }} <!-- 管道：$qty 作为最后的参数传进去，等价 -->
```

## 什么时候用，什么时候别用

**该用**：

- 页面参数、站点参数可能缺失时给默认文案/默认值；
- 配置项向后兼容：旧站点没写新参数，用 `default` 补上，模板不用改；
- 想让模板在没有数据时也能渲染出合理内容。

**别用**：

- 想按「真值性」兜底（把 `0`、`""`、空切片也当没设置）→ 用 [`or`](/functions/go-template/or/)：**实测 `false | default true` 返回 `false`**，而 `or` 会返回 `true`（上游在用法一节的 NOTE 里也说明了这一点）；
- 想判断某参数到底有没有设置（而不是替换它）→ 用 `isset` 或 `with`；
- 只想在值为 `nil` 时兜底 → `with` 更明确，也不会把 `0`、`""` 一起替换掉；
- 需要区分「值是空字符串」与「参数不存在」→ `default` 会把两者同等对待。

## 用法

`compare.Default` 函数如果第二个参数已设置则返回第二个参数，否则返回第一个参数。

> [!NOTE]
> 当第二个参数是布尔值 `false` 时，`compare.Default` 函数返回 `false`。所有*其他*假值都被视为未设置。
>
> 假值包括 `false`、`0`、任何 `nil` 指针或接口值、任何长度为零的数组、切片、映射或字符串，以及零值 `time.Time`。
>
> 除此之外的一切都是真值。
>
> 若要基于真值性设置默认值，请改用 [`or`][] 运算符。

## 示例

第二个参数已设置时：

```go-html-template
{{ 1             | compare.Default 42 }} → 1
{{ "foo"         | compare.Default 42 }} → foo
{{ dict "k" "v"  | compare.Default 42 }} → map[k:v]
{{ slice "a" "b" | compare.Default 42 }} → [a b]
{{ true          | compare.Default 42 }} → true

<!-- As noted above, the boolean "false" is considered set -->
{{ false         | compare.Default 42 }} → false
```

第二个参数未设置时：

```go-html-template
{{ 0     | compare.Default 42 }} → 42
{{ ""    | compare.Default 42 }} → 42
{{ dict  | compare.Default 42 }} → 42
{{ slice | compare.Default 42 }} → 42

```

## 完整示例：给缺失的参数兜底

```go-html-template {file="layouts/_partials/byline.html"}
{{ $qty := 0 }}
{{ $title := "" }}
<p>{{ $qty | default 42 }}</p>
<p>{{ $title | default "未命名" }}</p>
<p>{{ false | default true }}</p>
<p>{{ "0" | default 42 }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>42</p>
<p>未命名</p>
<p>false</p>
<p>0</p>
```

**你应当看到什么**：前两行是兜底生效——`0` 与 `""` 都被当作未设置。第三行是上游 NOTE 说的那个例外：`false` **算已设置**，所以原样返回 `false`，不会变成 `true`。第四行最容易踩：字符串 `"0"` 长度不为零，是**真值**，因此原样返回 `0`——如果你希望「字符串 `"0"` 也当作没设置」，得自己判断，`default` 不会帮你。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 第二个参数（INPUT） | 结果 | 是否报错 |
| --- | --- | --- |
| `1`、`"foo"`、`true`（真值） | 原样返回 | 否 |
| `false` | `false`（**算已设置**，上游已说明） | 否 |
| `0`、`""`、`dict`（空映射）、`slice`（空切片） | 返回 `DEFAULT`（实测均为 `42`） | 否 |
| `nil`（作为函数参数，`default nil 42`） | 返回 `DEFAULT`（实测 `42`） | 否 |
| `nil` 作为**管道起点**（`{{ nil \| default 42 }}`） | —— | 是：`nil is not a command`（模板语法层面就失败，跟 `default` 无关） |
| 缺失的页面参数（如 `.Params.nope`） | 返回 `DEFAULT`（实测 `"fallback"`） | 否 |
| 零值 `time.Time` | 返回 `DEFAULT`（实测 `42`） | 否 |
| 字符串 `"0"` | 原样返回 `0`（长度为 1，是真值） | 否 |
| 省略第二个参数（`default 42`） | `42`（上游未说明；实测按「未设置」处理） | 否 |
| 三个及以上参数（`default 42 1 2`） | —— | 是：`error calling default: wrong number of args for default: want 2 got 3` |
| 返回类型 | `any`（可以是任何类型，取决于命中的那一侧） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 参数设成了 `false`，兜底没生效 | `false` 被当作已设置 | 想按真值性兜底就用 [`or`](/functions/go-template/or/) |
| 没报错但结果不对 | 参数是字符串 `"0"`，兜底没生效 | 非空字符串是真值 | 自己判断 `eq $x "0"`，或先用 [`cast.ToInt`](/functions/cast/toint/) |
| 没报错但结果不对 | `0` 被替换成了默认值，但业务上 0 是合法值 | `0` 属于假值 | 用 `isset` / `with` 判断「是否存在」，而不是 `default` |
| 报错看不懂 | `wrong number of args for default: want 2 got 3` | 多写了一个参数 | `default` 只接受两个参数 |
| 没报错但结果不对 | 管道写法里默认值跑到后面去了 | 参数顺序是 `DEFAULT INPUT`，管道会把左侧值作为**最后**一个参数 | 写成 `{{ $qty \| default 42 }}`，不要写成 `{{ 42 \| default $qty }}` |
| 报错看不懂 | `nil is not a command` | 把 `nil` 写成了管道的起点（`{{ nil \| default 42 }}`） | 直接写函数式：`{{ default 42 nil }}`；管道起点必须是一个可求值的表达式 |

更多排查入口见[故障排查](/troubleshooting/)。

[`or`]: /functions/go-template/or/
