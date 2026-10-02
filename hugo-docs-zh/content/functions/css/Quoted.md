+++
title = "css.Quoted"
linkTitle = "Quoted"
description = "返回给定字符串，并把其数据类型标记为在 CSS 中使用时必须带引号。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/css/quoted/"

[params.functions_and_methods]
signatures = ["css.Quoted STRING"]
returnType = "css.QuotedString"
+++

## 这一页解决什么问题

把 `vars` 传给 [`css.Build`](/functions/css/build/#vars) 或 [`css.Sass`](/functions/css/sass/#vars) 时，Hugo 会用正则匹配猜测每个值的类型（`24px`、`#FF0000` 这类「一看就是 CSS 值」的字符串），再决定注入时要不要加引号。多数时候猜得对；但 `content` 属性的字符串、`font-family` 名这类值**必须显式带引号**，否则 CSS 语义就变了。`css.Quoted` 就是给这类值打上「必须当成带引号的字符串」的标记。

## 什么时候用，什么时候别用

**该用**：

- 在 `vars` 里给 `content` 这类属性注入字符串。**实测**：不加标记时注入的是 `content: 6;`，加了标记是 `content: "6";`；
- 值里含 CSS 特殊字符、需要整段作为字符串输出时。

**别用**：

- 值本身就是合法的 CSS 值（`24px`、`#FF0000`、`blue`）→ 直接给字符串即可，不需要标记；
- 想强制**不带**引号 → 用 [`css.Unquoted`](/functions/css/unquoted/)；
- 只是想在页面上打印这个字符串 → 它只是个类型标记，单独输出就是原值（**实测** `{{ css.Quoted 42 }}` 输出 `42`）。

> [!NOTE]
> 这个函数只适用于传给 [`css.Build`][] 或 [`css.Sass`][] 函数的 `vars` 选项。

向 `css.Sass` 函数传入 `vars` 映射时，Hugo 会用正则匹配识别诸如 `24px` 或 `#FF0000` 这类常见的有类型 CSS 值。必要时可以用 `css.Quoted` 函数绕过自动类型推断，明确表示该值必须当作带引号的字符串处理。

对 `css.Build` 函数而言，用 `css.Quoted` 明确表示某个值必须当作带引号的字符串处理，最常用于 `font-family` 名称或 `content` 属性。

下例中我们用 `css.Quoted` 确保 `content` 属性的值以字符串形式注入。

```go-html-template
{{ $vars := dict
  "ol-li-after" ("6" | css.Quoted)
  "ul-li-after" ("7" | css.Quoted)
}}

{{ $opts := dict "vars" $vars "transpiler" "dartsass" }}
{{ with resources.Get "sass/main.scss" | css.Sass $opts }}
  <link rel="stylesheet" href="{{ .RelPermalink }}">
{{ end }}
```

在样式表中使用 `hugo:vars` 标识符：

```scss
@use "hugo:vars" as h;

ol li::after {
  content: h.$ol-li-after;
}

ul li::after {
  content: h.$ul-li-after;
}
```

生成的 CSS 中会包含带引号的字符串：

```css
ol li::after {
  content: "6";
}

ul li::after {
  content: "7";
}
```

## 完整示例：让 content 属性注入带引号的字符串

```go-html-template {file="layouts/index.html"}
{{ $vars := dict
  "ol-li-after" ("6" | css.Quoted)
  "ul-li-after" ("7" | css.Quoted)
}}
{{ $opts := dict "vars" $vars "outputStyle" "expanded" }}
{{ with resources.Get "sass/main.scss" | css.Sass $opts }}
  <link rel="stylesheet" href="{{ .RelPermalink }}">
{{ end }}
```

```scss {file="assets/sass/main.scss"}
@import 'hugo:vars';

ol li::after {
  content: $ol-li-after;
}

ul li::after {
  content: $ul-li-after;
}
```

在本机（Hugo 0.167.0 extended，Windows）实测生成的 `/sass/main.css`：

```css
ol li::after {
  content: "6";
}

ul li::after {
  content: "7";
}
```

**你应当看到什么**：两个值都带双引号。把 `css.Quoted` 去掉（`"ol-li-after" "6"`）后，同一份模板实测输出变成 `content: 6;` 与 `content: 7;`——引号消失，值从「字符串」变成了「数字」。

> [!NOTE]
> 测量条件：Hugo 0.167.0 extended 的内置 LibSass（默认 `transpiler`），Windows；本机未安装 Dart Sass。上游示例使用 `transpiler: "dartsass"` 与 `@use "hugo:vars"`——安装了 Dart Sass 后语法等价，但本站未实测 Dart Sass 分支。用 LibSass 时变量通过 `@import 'hugo:vars';` 引入，**实测可用**。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ css.Quoted "x" }}` | 类型为 `css.QuotedString`，值是原字符串 | 否 |
| `{{ css.Quoted "" }}` | 空输出 | 否 |
| `{{ css.Quoted 42 }}` | `42`（数字也接受，原样输出） | 否 |
| `{{ css.Quoted true }}` | `true` | 否 |
| `{{ css.Quoted nil }}` | 空输出 | 否 |
| 用在 `vars` 中 | 注入时带引号（`content: "6";`） | 否 |
| 不传参数 `{{ css.Quoted }}` | —— | 是：`wrong number of args for Quoted: want 1 got 0` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `content` 注入成了数字（`content: 6;`） | 没加 `css.Quoted`，Hugo 的类型推断把 `"6"` 当成数值 | 用 `("6" \| css.Quoted)` 包一层 |
| 没报错但结果不对 | 值里本来就有引号，结果外面又多了一层单引号 | `css.Quoted` 会把整段当作字符串再包一次（**实测** `"\"Times New Roman\", Times, serif" \| css.Quoted` 输出 `'"Times New Roman", Times, serif'`） | 这类值改用 [`css.Unquoted`](/functions/css/unquoted/)，或直接给字符串 |
| 报错看不懂 | `wrong number of args for Quoted: want 1 got 0` | 忘了传值 | 写成 `("值" \| css.Quoted)` |

更多排查入口见[故障排查](/troubleshooting/)。

[`css.Build`]: /functions/css/build/#vars
[`css.Sass`]: /functions/css/sass/#vars
