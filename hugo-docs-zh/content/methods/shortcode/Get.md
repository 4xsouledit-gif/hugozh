+++
title = "Get"
linkTitle = "Get"
description = "返回给定参数的值。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/shortcode/get/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Get ARG"]
returnType = "any"
+++

参数可以按位置或按名称指定。在 Markdown 中调用短代码时，位置参数和命名参数只能用其中一种，不能混用。

> [!NOTE]
> 有些短代码支持位置参数，有些支持命名参数，还有些两者都支持。用法细节请参见相应短代码的文档。

## 这一页解决什么问题

`Get` 是短代码模板读取调用方参数的入口：`{{</* img src="a.jpg" */>}}` 里的 `src`、`{{</* quote "Hello" */>}}` 里的 `"Hello"`，都靠它取出来。

它同时支持两套参数空间——**位置**（`ARG` 是整数）和**名称**（`ARG` 是字符串）——并在取不到时不报错，返回空值。所以「参数到底是哪一种」「取不到会怎样」是这一页的重点，也是短代码模板出错最集中的地方。

## 什么时候用，什么时候别用

**该用**：

- 模板知道调用方怎么传参（自己的短代码自己定规矩）：位置用 `.Get 0`，命名用 `.Get "name"`；
- 想同时兼容两种写法 → 先用 [`IsNamedParams`](/methods/shortcode/isnamedparams/) 判断，再分别取（见本页示例）；
- 需要取**全部**参数 → 用 [`Params`](/methods/shortcode/params/) 更直接。

**别用**：

- 想给参数设默认值 → 别指望 `Get`，要自己用 `with`/`default`：`{{ $src := .Get "src" | default "images/placeholder.jpg" }}`；
- 想校验「必填参数缺失」并报错 → `Get` 不会报错，要自己 `errorf`（见 [`Name`](/methods/shortcode/name/) 与 [`Position`](/methods/shortcode/position/)）；
- 想读**短代码调用之外**的数据（页面前置元数据）→ 用 [`Page`](/methods/shortcode/page/)。

## 位置参数

下面这个短代码调用使用位置参数：

```md {file="content/about.md"}
{{</* myshortcode "Hello" "world" */>}}
```

要按位置获取参数：

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ printf "%s %s." (.Get 0) (.Get 1) }} → Hello world.
```

## 命名参数

下面这个短代码调用使用命名参数：

```md {file="content/about.md"}
{{</* myshortcode greeting="Hello" firstName="world" */>}}
```

要按名称获取参数：

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ printf "%s %s." (.Get "greeting") (.Get "firstName") }} → Hello world.
```

> [!NOTE]
> 参数名称区分大小写。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。同一个短代码被两种方式各调用一次。

模板 `layouts/_shortcodes/myshortcode.html`：

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
<p>IsNamedParams：{{ .IsNamedParams }}</p>
<p>位置 0：{{ .Get 0 }}</p>
<p>位置 1：{{ .Get 1 }}</p>
<p>命名 greeting：{{ .Get "greeting" }}</p>
<p>命名 firstName：{{ .Get "firstName" }}</p>
```

内容 `content/about.md` 里的两次调用：

```md {file="content/about.md"}
{{</* myshortcode "Hello" "world" */>}}
{{</* myshortcode greeting="Hello" firstName="world" */>}}
```

Hugo 渲染为：

```html
<!-- 第一次调用：位置参数 -->
<p>IsNamedParams：false</p>
<p>位置 0：Hello</p>
<p>位置 1：world</p>
<p>命名 greeting：</p>
<p>命名 firstName：</p>

<!-- 第二次调用：命名参数 -->
<p>IsNamedParams：true</p>
<p>位置 0：</p>
<p>位置 1：</p>
<p>命名 greeting：Hello</p>
<p>命名 firstName：world</p>
```

**你应当看到什么**：同一个模板、两种调用方式，**只有对应的那种取法有值**——位置参数调用时命名取法全空，反之亦然。取不到时不会报错、也不会提示「你取错了空间」，所以在写模板时要么固定一种传参方式，要么按 `IsNamedParams` 分支。

> [!NOTE]
> 上面省略了 Markdown 给每个短代码输出加上的外层 `<p>` 包裹；不影响你看到的取值。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 位置参数调用，`.Get 0` / `.Get 1` | 对应参数值（实测 `Hello` / `world`） | 否 |
| 命名参数调用，`.Get "greeting"` | 对应参数值（实测 `Hello`） | 否 |
| 命名参数调用，`.Get "不存在的键"` | **空字符串**（实测 `printf "%T"` 为 `string`，`eq … nil` 为 `false`） | 否 |
| 位置参数调用，`.Get "不存在的键"` | **`nil`**（实测 `printf "%T"` 为 `<nil>`，`eq … nil` 为 `true`） | 否 |
| 位置参数调用，`.Get 9`（越界） | 空字符串（实测 `printf "%T"` 为 `string`） | 否 |
| 命名参数调用，`.Get 9` | `nil` | 否 |
| 没有传任何参数 | 全部取到空值，`len .Params` 为 `0` | 否 |
| 同一次调用里混用位置与命名 | —— | 是：`got named parameter 'b'. Cannot mix named and positional parameters` |
| 键名大小写不同 | 取不到（上游说明：名称区分大小写） | 否 |

> [!IMPORTANT]
> 「取不到」既可能是 `nil` 也可能是空字符串，取决于调用方式与取法。**不要**用 `{{ if eq (.Get "x") nil }}` 判断「参数是否存在」；用 `{{ with .Get "x" }}` 判断即可（两种空值在 `with` 里都为假）。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 命名参数写了却取不到值 | 模板用 `.Get 0` 去取命名参数（两套空间不互通） | 用 `.Get "键名"`，或用 `IsNamedParams` 分支 |
| 没报错但结果不对 | 参数值总是空 | 键名大小写不一致（`firstName` 与 `firstname`） | 保持调用方与模板一致 |
| 构建失败 | `got named parameter 'b'. Cannot mix named and positional parameters` | 同一个调用里既有 `"a"` 又有 `b="c"` | 只用其中一种；需要同时给两类信息就改用字典传参 |
| 报错看不懂 | 短代码参数里写了 `{{</* x "a" b */>}}` 之类 | 位置参数必须是**带引号的字符串**或可解析的值 | 检查引号 |

更多排查入口见[故障排查](/troubleshooting/)。
