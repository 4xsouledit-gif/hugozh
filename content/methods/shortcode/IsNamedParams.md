+++
title = "IsNamedParams"
linkTitle = "IsNamedParams"
description = "报告短代码调用是否使用命名参数。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/shortcode/isnamedparams/"

[params.functions_and_methods]
signatures = ["SHORTCODE.IsNamedParams"]
returnType = "bool"
+++

要让短代码调用同时支持位置参数和命名参数，可以用 `IsNamedParams` 方法判断短代码是以哪种方式调用的。

## 这一页解决什么问题

`IsNamedParams` 返回一个布尔值：**这次调用用的是命名参数吗？** 它是「让同一个短代码对两种写法都友好」的关键——位置参数和命名参数在 [`Get`](/methods/shortcode/get/) 里是两套互不相通的空间，只有先判断出调用方式，模板才知道该用 `.Get 0` 还是 `.Get "greeting"`。

对短代码作者来说，这决定了你写的是「只接受一种写法的短代码」还是「两种写法都接受的短代码」。

## 什么时候用，什么时候别用

**该用**：

- 短代码要同时支持 `{{</* myshortcode "Hello" "world" */>}}` 与 `{{</* myshortcode greeting="Hello" firstName="world" */>}}`；
- 需要在两种写法之间做**参数名映射**（位置 0 对应 `greeting`）；
- 想在参数缺失时报出「你用的是哪种写法、缺了哪个」的清晰错误。

**别用**：

- 你自己规定了唯一写法 → 直接在模板里固定 `.Get 0` 或 `.Get "name"`，少一层分支，模板更简单；
- 想读全部参数 → 用 [`Params`](/methods/shortcode/params/)（它的类型本身就暴露了写法）；
- 想校验参数个数 → 它只告诉你「是不是命名参数」，个数用 `len .Params`。

## 用法

使用这个_短代码_模板：

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ if .IsNamedParams }}
  {{ printf "%s %s." (.Get "greeting") (.Get "firstName") }}
{{ else }}
  {{ printf "%s %s." (.Get 0) (.Get 1) }}
{{ end }}
```

下面两个调用返回相同的值：

```md {file="content/about.md"}
{{</* myshortcode greeting="Hello" firstName="world" */>}}
{{</* myshortcode "Hello" "world" */>}}
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。模板里用 `<p>` 把结果包起来，便于看清两次调用的输出：

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ if .IsNamedParams }}
  <p>{{ printf "%s %s." (.Get "greeting") (.Get "firstName") }}</p>
{{ else }}
  <p>{{ printf "%s %s." (.Get 0) (.Get 1) }}</p>
{{ end }}
```

```md {file="content/about.md"}
{{</* myshortcode greeting="Hello" firstName="world" */>}}
{{</* myshortcode "Hello" "world" */>}}
```

Hugo 渲染为：

```html
<p>Hello world.</p>
<p>Hello world.</p>
```

**你应当看到什么**：两种写法输出**完全一样**。第一次调用走 `IsNamedParams` 为真的分支，第二次走为假的分支——两个分支的取值方式不同，但结果被抹平了。这就是「两种写法都支持」的标准做法。

## 返回值边界（实测）

| 调用方式 | 返回值 | 是否报错 |
| --- | --- | --- |
| `{{</* myshortcode greeting="Hello" */>}}`（命名） | `true` | 否 |
| `{{</* myshortcode "Hello" */>}}`（位置） | `false` | 否 |
| `{{</* myshortcode */>}}`（无参数） | `false`（按位置参数处理，`Params` 为 `[]string`） | 否 |
| 同一次调用混用两种写法 | 模板根本不会被渲染 | 是：`got named parameter 'b'. Cannot mix named and positional parameters` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 只写了一个分支，另一种调用方式参数全空 | 短代码只处理了自己习惯的那种写法 | 用 `IsNamedParams` 补上另一种分支 |
| 没报错但结果不对 | 无参数调用时走了命名分支 | 无参数调用 `IsNamedParams` 为 `false` | 按本页边界表判断，别把「无参数」当成命名调用 |
| 构建失败 | `Cannot mix named and positional parameters` | 调用方混用了两种写法 | 修改调用方；模板里的 `IsNamedParams` 分支帮不了这个错误 |

更多排查入口见[故障排查](/troubleshooting/)。
