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

[`css.Build`]: /functions/css/build/#vars
[`css.Sass`]: /functions/css/sass/#vars
