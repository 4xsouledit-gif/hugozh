+++
title = "Params"
linkTitle = "Params"
description = "返回短代码参数的集合。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/shortcode/params/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Params"]
returnType = "any"
+++

## 这一页解决什么问题

`Params` 一次给出**这次调用的全部参数**，而不是像 [`Get`](/methods/shortcode/get/) 那样一次取一个。它的返回类型会随调用方式变化：

- 位置参数调用 → **切片**（`[]interface{}`），按下标访问；
- 命名参数调用 → **映射**（`map[string]interface{}`），按 key 访问。

正因为类型不固定，`Params` 既是「快速看看到底传了什么」的调试入口，也是写「两种写法都支持」的模板时需要先判断对象类型的地方。

## 什么时候用，什么时候别用

**该用**：

- 需要遍历/统计全部参数（`len .Params`、`range .Params`）；
- 模板需要兼容两种调用方式，且参数数量不定；
- 调试时打印 `{{ printf "%v" .Params }}` 看清调用方传了什么。

**别用**：

- 只取某一两个已知参数 → 用 [`Get`](/methods/shortcode/get/) 更直接，也不用判类型；
- 想知道「这次是不是命名调用」→ 用 [`IsNamedParams`](/methods/shortcode/isnamedparams/)（布尔值比类型判断更明确）；
- 想读页面前置元数据 → 那是 `.Page.Params`，不是 `.Params`（见 [`Page`](/methods/shortcode/page/)）。

用位置参数调用短代码时，`Params` 方法返回一个切片。

```md {file="content/about.md"}
{{</* myshortcode "Hello" "world" */>}}
```

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ index .Params 0 }} → Hello
{{ index .Params 1 }} → world
```

用命名参数调用短代码时，`Params` 方法返回一个映射。

```md {file="content/about.md"}
{{</* myshortcode greeting="Hello" name="world" */>}}
```

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ .Params.greeting }} → Hello
{{ .Params.name }} → world
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。模板对两种调用都做类型判断，避免用错访问方式：

```go-html-template {file="layouts/_shortcodes/params-demo.html"}
<p>Params 类型：{{ printf "%T" .Params }}，是映射：{{ reflect.IsMap .Params }}，是切片：{{ reflect.IsSlice .Params }}</p>
{{ if reflect.IsMap .Params }}<p>greeting：{{ .Params.greeting }}</p>{{ end }}
{{ if reflect.IsSlice .Params }}<p>index 0：{{ index .Params 0 }}</p>{{ end }}
<p>len：{{ len .Params }}</p>
```

```md {file="content/about.md"}
{{</* params-demo "Hello" "world" */>}}
{{</* params-demo greeting="Hello" name="world" */>}}
```

Hugo 渲染为（实测）：

```html
<p>Params 类型：[]interface {}，是映射：false，是切片：true</p>
<p>index 0：Hello</p>
<p>len：2</p>
<p>Params 类型：map[string]interface {}，是映射：true，是切片：false</p>
<p>greeting：Hello</p>
<p>len：2</p>
```

**你应当看到什么**：同样是 `len` 为 2 的两次调用，第一次是切片、第二次是映射。`reflect.IsMap` / `reflect.IsSlice` 让模板能安全地分支，而不必猜类型。

反过来，**在位置参数调用里直接写 `.Params.greeting` 会失败**（实测）：

```text
can't evaluate field greeting in type interface {}
```

切片元素的静态类型是 `interface{}`，点号取键对它没有意义。要按下标取：`index .Params 0`。

## 返回值边界（实测）

| 调用方式 | 返回类型 | 取值方式 | 是否报错 |
| --- | --- | --- | --- |
| 位置参数 | `[]interface{}`（实测 `reflect.IsSlice` 为 `true`） | `{{ index .Params 0 }}` | 否 |
| 命名参数 | `map[string]interface{}`（实测 `reflect.IsMap` 为 `true`） | `{{ .Params.greeting }}` | 否 |
| 无参数 | 位置参数调用按空切片处理（实测 `[]string`、`len` 为 `0`） | — | 否 |
| 位置参数调用里写 `.Params.greeting` | —— | —— | 是：`can't evaluate field greeting in type interface {}` |
| 命名参数调用里写 `index .Params 0` | 空值 | — | 否（但取不到东西） |
| 两种写法混用 | —— | —— | 是：`Cannot mix named and positional parameters` |

> [!TIP]
> 只有「命名参数」的映射才有字符串 key；位置参数得到的是切片。判断方式：`reflect.IsMap .Params` 为真就是命名调用。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `can't evaluate field greeting in type interface {}` | 位置参数调用返回切片，却用点号取键 | 用 `index .Params 0`，或先 `reflect.IsMap` 判断 |
| 没报错但结果不对 | 命名调用里 `index .Params 0` 取不到值 | 映射没有数字下标 | 用 `.Params.键名` |
| 没报错但结果不对 | 以为 `.Params` 是页面参数 | 短代码对象上的 `.Params` 是**短代码参数** | 页面参数用 `.Page.Params` |
| 构建失败 | `Cannot mix named and positional parameters` | 调用方混用两种写法 | 改调用方，只能用一种 |

更多排查入口见[故障排查](/troubleshooting/)。
