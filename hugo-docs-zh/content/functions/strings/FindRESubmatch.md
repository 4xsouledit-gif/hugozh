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

## 这一页解决什么问题

当一段文本里「一整段匹配」和「其中的几个部分」都要拿到时，`findRESubmatch` 是唯一现成的工具：从 HTML 里同时取出 `<a>` 的整段、链接目标和链接文字，或从 `key=value` 序列里同时取出键和值。它返回 `[][]string`——外层是每个匹配，内层依次是「整段匹配、第 1 个捕获组、第 2 个捕获组……」。

## 什么时候用，什么时候别用

**该用**：

- 正则里写了**捕获组**，且需要分别使用各组的内容；
- 需要遍历所有匹配，逐个处理。

**别用**：

- 不需要分组、只要整段匹配 → 用 [`strings.FindRE`](/functions/strings/findre/)（返回 `[]string`，更好处理）；
- 只需要替换、不关心分组内容 → 用 [`strings.ReplaceRE`](/functions/strings/replacere/)（替换串里可直接写 `$1`）；
- 只想知道「有没有」→ 用 [`strings.Contains`](/functions/strings/contains/)。

## 用法

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

## 完整示例（实测）

```go-html-template {file="layouts/_partials/pairs.html"}
{{ range findRESubmatch "([a-z]+)=([0-9]+)" "a=1 b=22" }}{{ index . 1 }}={{ index . 2 }};{{ end }}
```

Hugo 0.167.0 实测输出：

```text
a=1;b=22;
```

**你应当看到什么**：两次匹配各输出一段 `键=值;`。注意下标是从 `0` 开始的：`index . 0` 是整段匹配（`a=1`），`index . 1` 是第一个捕获组（`a`），`index . 2` 是第二个（`1`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有匹配（实测 `findRESubmatch `a(x*)b` "-axxb-ab-"`） | `[["axxb" "xx"] ["ab" ""]]`，未参与匹配的捕获组是**空字符串**（不是缺项） | 否 |
| 完全没有匹配（实测 `findRESubmatch `a(x*)b` "-xyz-"`） | `nil`；`len` 实测为 `0`，`range` 不进入循环 | 否 |
| 指定 `LIMIT`（实测 `findRESubmatch `a(x*)b` "-axxb-ab-" 1`） | 只返回第一组：`[["axxb" "xx"]]` | 否 |
| 正则写错（实测 `findRESubmatch "[" "abc"`） | —— | **是，构建失败**：`error calling findRESubmatch: error parsing regexp: missing closing ]: ` + 反引号包住的 `[` |
| 返回类型 | `[][]string`（签名如此）；无匹配时是 `nil` 而不是空切片 | 否 |

> [!NOTE]
> 直接把结果打印出来会变成 `[[ab ] [axb x]]` 这样——**内层的空字符串看不出来**，容易误判。要确认某一组是否为空，请用 `index` 取出后单独判断。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 取到的是整段匹配而不是捕获组 | 下标从 `0` 开始，`index . 0` 是整段 | 捕获组从 `index . 1` 开始取 |
| 没报错但结果不对 | 打印出来像是丢了几列 | 空字符串打印出来是「什么都没有」，看起来像少了一列 | 用 `printf "%q"` 或逐项 `index` 检查 |
| 报错看不懂 | `error parsing regexp: ...`，整站构建失败 | 正则本身写错；Hugo 不会降级成警告 | 在 [regex101.com](https://regex101.com/) 选 Go 风格先验证 |
| 没报错但结果不对 | 明明有匹配却进了 `range` 的空循环 | 结果为 `nil`（没有匹配） | 先用 `with` 或 `len` 判断再遍历 |

更多排查入口见[故障排查](/troubleshooting/)。
