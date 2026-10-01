+++
title = "strings.FindRE"
linkTitle = "FindRE"
description = "返回与正则表达式匹配的字符串切片。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/strings/findre/"

[params.functions_and_methods]
signatures = ["strings.FindRE PATTERN STRING [LIMIT]"]
returnType = "[]string"
aliases = ["findRE"]
+++

默认情况下，`findRE` 会找出所有匹配项。可以用可选的 LIMIT 参数限制匹配数量。

指定正则表达式时，请使用原始的[字符串字面量][string literal]（反引号），而不要使用解释型字符串字面量（双引号），以简化语法：使用解释型字符串字面量时必须转义反斜杠。

Go 的正则表达式包实现的是 [RE2 语法][]。大致来说，RE2 语法是 [PCRE][] 所接受语法的一个子集，并且有若干[注意事项][]。注意，不支持 RE2 的 `\C` 转义序列。

下面的例子返回渲染后的 `.Content` 中所有二级标题（`h2` 元素）组成的切片：

```go-html-template
{{ findRE `(?s)<h2.*?>.*?</h2>` .Content }}
```

`s` 标志让 `.` 也能匹配 `\n`，因此可以找出包含换行的 `h2` 元素。

把匹配数量限制为一个：

```go-html-template
{{ findRE `(?s)<h2.*?>.*?</h2>` .Content 1 }}
```

> [!NOTE]
> 可以用 [regex101.com][] 编写并测试正则表达式。开始之前请务必选择 Go 语言风格。

[PCRE]: https://www.pcre.org/
[RE2 语法]: https://github.com/google/re2/wiki/Syntax/
[注意事项]: https://swtch.com/~rsc/regexp/regexp3.html#caveats
[regex101.com]: https://regex101.com/
[string literal]: https://go.dev/ref/spec#String_literals
