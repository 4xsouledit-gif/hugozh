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

## 这一页解决什么问题

要从一大段文本里把**所有**符合某个模式的部分抽出来：正文里所有二级标题、摘要里所有话题标签、字符串里所有数字。`findRE` 返回的是一个**切片**（`[]string`），可以直接 `range`、`len`、`index`，不需要自己写循环。

## 什么时候用，什么时候别用

**该用**：

- 匹配数量不固定，需要拿到全部结果；
- 后续要对每个匹配做点什么（渲染、计数、拼接）。

**别用**：

- 需要**捕获组**（把一整段拆成几个部分）→ 用 [`strings.FindRESubmatch`](/functions/strings/findresubmatch/)；
- 要把匹配到的内容**替换**掉 → 用 [`strings.ReplaceRE`](/functions/strings/replacere/)；
- 只想知道「有没有」→ 用 [`strings.Contains`](/functions/strings/contains/) 更简单也更快；
- 想按固定分隔符切分 → 用 [`strings.Split`](/functions/strings/split/)。

## 用法

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

## 完整示例（实测）

```go-html-template {file="layouts/_partials/tags.html"}
{{ $s := "#hugo #gohugo 没有标签" }}
{{ findRE "#[[:alnum:]]+" $s }}|{{ len (findRE `\d+` "v1.2.3") }}
```

Hugo 0.167.0 实测输出：

```text
[#hugo #gohugo]|3
```

**你应当看到什么**：第一项是切片本身——直接打印会用方括号把元素包起来，元素之间以空格分隔（`[#hugo #gohugo]`）；第二项是用 `len` 数出 `v1.2.3` 里有 3 段数字。要拿单个元素用 `index`，要遍历用 `range`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有匹配 | `[]string`；实测 `findRE "#[[:alnum:]]+" "#hugo #gohugo 没有标签"` → `[#hugo #gohugo]` | 否 |
| 完全没有匹配（实测 `findRE `\d+` "abc"`） | 空切片，`len` 为 `0`，`if`/`with` 里判为假 | 否 |
| 指定 `LIMIT`（实测 `findRE `\d+` "a1b22c333" 1`） | 只返回前 1 个：`[1]` | 否 |
| 正则写错（实测 `findRE "[" "abc"`） | —— | **是，构建失败**：`error calling findRE: error parsing regexp: missing closing ]: ` + 反引号包住的 `[` |
| 大小写（实测 `findRE `(?i)hugo` "Hugo hugo"`） | `[Hugo hugo]`，`(?i)` 生效 | 否 |
| 返回类型 | `[]string`（不是字符串，也不是 `string`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `error parsing regexp: ...`，整站构建失败 | 正则本身写错了；Hugo 不会把它降级成警告 | 到 [regex101.com](https://regex101.com/) 选 Go 风格先验证；注意 RE2 不支持 `\C` |
| 没报错但结果不对 | 匹配结果比预期少 | `.` 默认不匹配换行 | 在模式前面加 `(?s)`（本页示例已加） |
| 没报错但结果不对 | 输出里带方括号 | 返回的是切片，直接打印会显示整个切片 | 用 `range` 遍历，或用 `index` 取元素 |
| 没报错但结果不对 | 转义写得很乱 | 用了双引号字符串字面量 | 改用反引号原始字符串：`` `\d+` `` |

更多排查入口见[故障排查](/troubleshooting/)。
