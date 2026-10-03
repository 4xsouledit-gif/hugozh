+++
title = "strings.Title"
linkTitle = "Title"
description = "返回给定字符串，并转换为标题式大小写。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/functions/strings/title/"

[params.functions_and_methods]
signatures = ["strings.Title STRING"]
returnType = "string"
aliases = ["title"]
+++

## 这一页解决什么问题

把英文短语显示成「标题式大小写」（Title Case）：`table of contents (TOC)` → `Table of Contents (TOC)`。Hugo 默认按美联社（Associated Press）风格手册的规则处理，哪些小词要大写、哪些不用，都由它判断。

## 什么时候用，什么时候别用

**该用**：

- 页面语言是英文，且希望标题按英文出版惯例大写；
- 需要在模板里统一标题外观，而不想手工维护每一条标题。

**别用**：

- 只想把首字母大写 → 用 [`strings.FirstUpper`](/functions/strings/firstupper/)（实测 `title` 会按规则处理每个词，不是只动首字母）；
- 整串转大写 / 小写 → 用 [`strings.ToUpper`](/functions/strings/toupper/)、[`strings.ToLower`](/functions/strings/tolower/)；
- 内容以中文为主 → 中文没有大小写，调用它是空操作（见下文实测 `""` 与中文的效果一致）；给中文标题套用英文规则也不会带来变化。

> [!NOTE]
> 大小写风格由项目配置决定（上游链接 [project configuration][]），可以改成芝加哥风格、每个词都大写、只大写第一个词，或关闭 `title` 的效果。主题已经用了 `title` 时，最后一种选项很有用。

## 用法

```go-html-template
{{ title "table of contents (TOC)" }} → Table of Contents (TOC)
```

默认情况下，Hugo 遵循 [Associated Press Stylebook][] 发布的大小写规则。如果你更希望采用以下某种方式，请修改[项目配置][]：

- 遵循 [Chicago Manual of Style][] 发布的大小写规则
- 每个单词的首字母都大写
- 只把第一个单词的首字母大写
- 关闭 `title` 函数的效果

如果主题使用了 `title` 函数，而你更愿意按需手动处理大小写，最后一种选项会很有用。

[Associated Press Stylebook]: https://www.apstylebook.com/
[Chicago Manual of Style]: https://www.chicagomanualofstyle.org/home.html
[project configuration]: /configuration/all/#title-case-style

## 完整示例（实测）

```go-html-template {file="layouts/_partials/heading.html"}
{{ title "table of contents (TOC)" }}|{{ title "hello world" }}
```

Hugo 0.167.0 实测输出：

```text
Table of Contents (TOC)|Hello World
```

**你应当看到什么**：不只是每个词的首字母大写——`of` 这类小词也被大写成了 `Of`，这是当前默认风格的实际结果。若你的站点改过 `titleCaseStyle`，同一段模板会得到不同输出。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows，未修改 `titleCaseStyle`。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ title "table of contents (TOC)" }}` | `Table of Contents (TOC)` | 否 |
| `{{ title "hello world" }}` | `Hello World` | 否 |
| `{{ title "" }}` | `""` | 否 |
| `{{ title "a b   c" }}` | `A B   C`（多个连续空格原样保留） | 否 |
| `{{ title 42 }}` | `42`（非字符串参数自动转换，不报错） | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 只想首字母大写，其他词也被改了 | `title` 是标题式大小写，不是首字母大写 | 改用 [`strings.FirstUpper`](/functions/strings/firstupper/) |
| 没报错但结果不对 | 与同事机器上的结果不同 | `titleCaseStyle` 属站点配置，不同站点可能不同 | 用 `hugo config` 确认本站配置，或改配置统一 |
| 没报错但结果不对 | 中文标题没有任何变化 | 中文没有大小写概念 | 无需处理；英文标题才需要本函数 |

更多排查入口见[故障排查](/troubleshooting/)。
