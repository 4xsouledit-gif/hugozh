+++
title = "strings.FindRESubmatch"
linkTitle = "FindRESubmatch"
description = "返回正则表达式全部连续匹配构成的切片，其中每个元素也是一个切片，依次保存最左侧匹配的文本及其各子表达式的匹配结果。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/strings/findresubmatch/"

[params.functions_and_methods]
signatures = ["strings.FindRESubmatch PATTERN STRING [LIMIT]"]
returnType = "[][]string"
aliases = ["findRESubmatch"]
+++

默认情况下，`findRESubmatch` 会找出所有匹配项。可以用可选的 LIMIT 参数限制匹配数量。返回值为 `nil` 表示没有匹配。

指定正则表达式时，请使用原始的[字符串字面量][string literal]（反引号），而不要使用解释型字符串字面量（双引号），以简化语法：使用解释型字符串字面量时必须转义反斜杠。

Go 的正则表达式包实现的是 [RE2 语法][]。大致来说，RE2 语法是 [PCRE][] 所接受语法的一个子集，并且有若干[注意事项][]。注意，不支持 RE2 的 `\C` 转义序列。

## 演示示例

```go-html-template
{{ findRESubmatch `a(x*)b` "-ab-" }} → [["ab" ""]]
{{ findRESubmatch `a(x*)b` "-axxb-" }} → [["axxb" "xx"]]
{{ findRESubmatch `a(x*)b` "-ab-axb-" }} → [["ab" ""] ["axb" "x"]]
{{ findRESubmatch `a(x*)b` "-axxb-ab-" }} → [["axxb" "xx"] ["ab" ""]]
{{ findRESubmatch `a(x*)b` "-axxb-ab-" 1 }} → [["axxb" "xx"]]
```

## 实用示例

这段 Markdown：

```md
- [Example](https://example.org)
- [Hugo](https://gohugo.io)
```

会生成这样的 HTML：

```html
<ul>
  <li><a href="https://example.org">Example</a></li>
  <li><a href="https://gohugo.io">Hugo</a></li>
</ul>
```

要匹配其中的链接元素，并捕获链接目标与链接文本：

```go-html-template
{{ $regex := `<a\s*href="(.+?)">(.+?)</a>` }}
{{ $matches := findRESubmatch $regex .Content }}
```

上面代码中 `$matches` 的数据结构用 JSON 表示如下：

```json
[
  [
    "<a href=\"https://example.org\"></a>Example</a>",
    "https://example.org",
    "Example"
  ],
  [
    "<a href=\"https://gohugo.io\">Hugo</a>",
    "https://gohugo.io",
    "Hugo"
  ]
]
```

要渲染其中的 `href` 属性：

```go-html-template
{{ range $matches }}
  {{ index . 1 }}
{{ end }}
```

结果：

```text
https://example.org
https://gohugo.io
```

> [!NOTE]
> 可以用 [regex101.com][] 编写并测试正则表达式。开始之前请务必选择 Go 语言风格。

[PCRE]: https://www.pcre.org/
[RE2 语法]: https://github.com/google/re2/wiki/Syntax/
[注意事项]: https://swtch.com/~rsc/regexp/regexp3.html#caveats
[regex101.com]: https://regex101.com/
[string literal]: https://go.dev/ref/spec#String_literals
