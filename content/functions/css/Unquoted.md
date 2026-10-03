+++
title = "css.Unquoted"
linkTitle = "Unquoted"
description = "返回给定字符串，并把其数据类型标记为在 CSS 中使用时不得带引号。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/css/unquoted/"

[params.functions_and_methods]
signatures = ["css.Unquoted STRING"]
returnType = "css.UnquotedString"
+++

## 这一页解决什么问题

`vars` 的值注入样式表时，Hugo 会先做类型推断：像 `24px`、`#FF0000` 这类「有类型」的 CSS 值按原样注入，其余值可能被当作字符串加上引号。当某个值**必须不带引号**注入时（典型如 `font-family` 的关键字列表），用 `css.Unquoted` 显式告诉 Hugo：不要加引号。

## 什么时候用，什么时候别用

**该用**：

- `vars` 里的关键字类值（`sans-serif`、`serif`、`inherit` 等）必须原样出现在声明里时；
- 上游描述的类型推断给出你不想要的结果时（推断规则按 Hugo 版本变化，拿不准就显式指定）。

**别用**：

- 值**必须带引号** → 用 [`css.Quoted`](/functions/css/quoted/)（**实测**：`("6" | css.Quoted)` 得到 `content: "6";`，不带标记则得到 `content: 6;`）；
- 值本身就是合法的有类型 CSS 值（`24px`、`#FF0000`）→ 直接给字符串即可；
- 只想打印字符串本身 → 它只是类型标记，单独输出就是原值（**实测** `printf "%T"` 为 `css.UnquotedString`）。

**实测边界提醒**：在 Hugo 0.167.0 的内置 LibSass 下，普通字符串本来就按不带引号的方式注入（`"sans-serif"` 与 `("sans-serif" | css.Unquoted)` 输出相同），因此 `css.Unquoted` 在这条路径上常常看不出差别；它的作用在于**显式表达意图**，并用于上游所述的 Dart Sass 推断路径（本站未安装 Dart Sass，该路径未实测）。

> [!NOTE]
> 这个函数只适用于传给 [`css.Sass`][] 函数的 `vars` 选项。

向 `css.Sass` 函数传入 `vars` 映射时，Hugo 会用正则匹配识别诸如 `24px` 或 `#FF0000` 这类常见的有类型 CSS 值。必要时可以用 `css.Unquoted` 函数绕过自动类型推断，明确表示该值必须当作不带引号的字符串处理。

下例中我们用 `css.Unquoted` 确保 `font-family` 属性的值注入时不带引号。

```go-html-template
{{ $vars := dict
  "font-main" ("sans-serif" | css.Unquoted)
}}

{{ $opts := dict "vars" $vars "transpiler" "dartsass" }}
{{ with resources.Get "sass/main.scss" | css.Sass $opts }}
  <link rel="stylesheet" href="{{ .RelPermalink }}">
{{ end }}
```

在样式表中使用 `hugo:vars` 标识符：

```scss
@use "hugo:vars" as h;

body {
  font-family: h.$font-main;
}
```

生成的 CSS 中包含不带引号的字符串：

```css
body {
  font-family: sans-serif;
}
```

## 完整示例：font-family 不带引号注入

```go-html-template {file="layouts/index.html"}
{{ $vars := dict
  "font-main" ("sans-serif" | css.Unquoted)
}}
{{ $opts := dict "vars" $vars "outputStyle" "expanded" }}
{{ with resources.Get "sass/main.scss" | css.Sass $opts }}
  <link rel="stylesheet" href="{{ .RelPermalink }}">
{{ end }}
```

```scss {file="assets/sass/main.scss"}
@import 'hugo:vars';

body {
  font-family: $font-main;
}
```

在本机（Hugo 0.167.0 extended，Windows）实测生成的 `/sass/main.css`：

```css
body {
  font-family: sans-serif;
}
```

**你应当看到什么**：`font-family` 的值没有引号。本轮实测中，把 `css.Unquoted` 去掉（`"font-main" "sans-serif"`）得到**完全相同**的输出——这正是上文提醒的：在 LibSass 路径上两种写法结果一致，标记的价值是显式表达意图。

对照 [`css.Quoted`](/functions/css/quoted/) 的实测差异：同一个 `content` 属性，`("6" | css.Quoted)` 注入为 `content: "6";`，而裸字符串 `"6"` 注入为 `content: 6;`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended（内置 LibSass），Windows，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ css.Unquoted "x" }}` | 类型为 `css.UnquotedString`，值是原字符串 | 否 |
| `{{ css.Unquoted 42 }}` | 类型仍为 `css.UnquotedString`（数字被转换） | 否 |
| `{{ css.Unquoted "" }}` | 空输出 | 否 |
| `{{ css.Unquoted nil }}` | 空输出 | 否 |
| 用在 `vars` 中（LibSass 路径） | 与直接给字符串结果相同（见上文） | 否 |
| 不传参数 `{{ css.Unquoted }}` | —— | 是：`wrong number of args for Unquoted: want 1 got 0` |
| 在 Dart Sass 路径上的类型推断 | 上游未说明具体边界；本机未安装 Dart Sass，未实测 | —— |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `font-family` 注入后带上了引号 | 值的类型推断与预期不符 | 用 `("sans-serif" \| css.Unquoted)` 显式标记 |
| 没报错但结果不对 | 加了 `css.Unquoted` 却没变化 | LibSass 路径上裸字符串本来就不带引号（**实测**） | 想要差异请对照 [`css.Quoted`](/functions/css/quoted/)；或安装 Dart Sass 走上游推荐的路径 |
| 报错看不懂 | `Undefined variable: "$font-main"` | 样式表里没有引入变量命名空间 | 加上 `@import 'hugo:vars';`（LibSass）或 `@use 'hugo:vars' as h;`（Dart Sass） |
| 报错看不懂 | `wrong number of args for Unquoted: want 1 got 0` | 忘了传值 | 写成 `("值" \| css.Unquoted)` |

更多排查入口见[故障排查](/troubleshooting/)。

[`css.Sass`]: /functions/css/sass/#vars
