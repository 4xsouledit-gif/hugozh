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

[[params.examples]]
id    = "strings/replacere-mask"
title = "压缩连续短横与空白（本站真实执行）"
+++

## 这一页解决什么问题

替换的目标不是一个固定子串，而是一类模式：把连续多个短横压成一个、把任意空白压成一个空格、把 URL 里的域名抽出来。`strings.ReplaceRE` 用正则匹配，并在替换串里支持 `$1`、`$2` 引用捕获组。

## 什么时候用，什么时候别用

**该用**：

- 匹配条件是模式（字符类、重复、位置）；
- 替换结果需要引用捕获组（`$1`）。

**别用**：

- 替换的是固定字面量 → 用 [`strings.Replace`](/functions/strings/replace/)（更快、不用转义）；
- 多组固定字面量一次替换 → 用 [`strings.ReplacePairs`](/functions/strings/replacepairs/)；
- 只需要**取出**匹配内容，不改写 → 用 [`strings.FindRE`](/functions/strings/findre/) 或 [`strings.FindRESubmatch`](/functions/strings/findresubmatch/)。

## 用法

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

## 完整示例（实测）

两行输出都是本站构建时**真实执行**的结果（模板文件在 `layouts/partials/examples/strings/replacere-mask.html`）：

{{< examples >}}

**你应当看到什么**：第一行把连续短横压成单个；第二行把任意数量的空白（空格、换行）压成一个空格——这是「把模板里读来的多行文本整理成一行」的常用写法。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有匹配（实测 `replaceRE `(-{2,})` "-" "a-b--c---d"`） | `a-b-c-d`（默认**全部**替换） | 否 |
| 指定 `LIMIT`（实测 `replaceRE `(-{2,})` "-" "a-b--c---d" 1`） | `a-b-c---d`，只处理第一处 | 否 |
| 使用捕获组（实测 `replaceRE "^https?://([^/]+).*" "$1" "http://gohugo.io/docs"`） | `gohugo.io` | 否 |
| 正则写错（实测 `replaceRE "(" "x" "abc"`） | —— | **是，构建失败**：``error calling replaceRE: error parsing regexp: missing closing ): `( `` |
| 没有匹配 | 原字符串原样返回 | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `error parsing regexp: ...`，整站构建失败 | 正则写错；Hugo 不会降级成警告 | 到 [regex101.com](https://regex101.com/) 选 Go 风格先验证；本页两个模式可直接借用 |
| 没报错但结果不对 | 只有第一处被替换 | 没写 `LIMIT` 时其实是全部替换；若只改了一处，通常是模式只能匹配一处 | 检查模式是否漏了量词（如 `-{2,}`） |
| 没报错但结果不对 | 转义写得很乱 | 用了双引号字符串字面量，需要对 `\` 双重转义 | 改用反引号：`` `\s+` `` |
| 没报错但结果不对 | `$1` 没有被展开 | 正则里没有对应编号的捕获组 | 先在 [regex101.com](https://regex101.com/) 确认捕获组编号，再写 `$1` |

更多排查入口见[故障排查](/troubleshooting/)。
