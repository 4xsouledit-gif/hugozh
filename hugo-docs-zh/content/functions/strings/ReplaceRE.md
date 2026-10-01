+++
title = "strings.ReplaceRE"
linkTitle = "ReplaceRE"
description = "返回给定字符串，并把所有与正则表达式匹配的部分替换为替换模式。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/functions/strings/replacere/"

[params.functions_and_methods]
signatures = ["strings.ReplaceRE PATTERN REPLACEMENT STRING [LIMIT]"]
returnType = "string"
aliases = ["replaceRE"]
+++

指定正则表达式时，请使用原始的[字符串字面量][string literal]（反引号），而不要使用解释型字符串字面量（双引号），以简化语法：使用解释型字符串字面量时必须转义反斜杠。

Go 的正则表达式包实现的是 [RE2 语法][]。大致来说，RE2 语法是 [PCRE][] 所接受语法的一个子集，并且有若干[注意事项][]。注意，不支持 RE2 的 `\C` 转义序列。

```go-html-template
{{ $s := "a-b--c---d" }}
{{ replaceRE `(-{2,})` "-" $s }} → a-b-c-d
```

用 LIMIT 参数限制替换次数：

```go-html-template
{{ $s := "a-b--c---d" }}
{{ replaceRE `(-{2,})` "-" $s 1 }} → a-b-c---d
```

在替换字符串中使用 `$1`、`$2` 等，可以插入正则表达式中各捕获组的内容：

```go-html-template
{{ $s := "http://gohugo.io/docs" }}
{{ replaceRE "^https?://([^/]+).*" "$1" $s }} → gohugo.io
```

> [!NOTE]
> 可以用 [regex101.com][] 编写并测试正则表达式。开始之前请务必选择 Go 语言风格。

[PCRE]: https://www.pcre.org/
[RE2 语法]: https://github.com/google/re2/wiki/Syntax/
[注意事项]: https://swtch.com/~rsc/regexp/regexp3.html#caveats
[regex101.com]: https://regex101.com/
[string literal]: https://go.dev/ref/spec#String_literals
