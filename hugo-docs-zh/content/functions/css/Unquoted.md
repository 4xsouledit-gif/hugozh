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

[`css.Sass`]: /functions/css/sass/#vars
