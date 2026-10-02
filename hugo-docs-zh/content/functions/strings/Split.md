+++
title = "strings.Split"
linkTitle = "Split"
description = "按分隔符切分给定字符串，返回字符串切片。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/functions/strings/split/"

[params.functions_and_methods]
signatures = ["strings.Split STRING DELIM"]
returnType = "[]string"
aliases = ["split"]
+++

## 这一页解决什么问题

前置元数据里的标签常写成 `"hugo,go,模板"` 这样的一个字符串，模板里却需要逐个遍历。`strings.Split` 把它按分隔符切成字符串切片，之后就能 `range`、`len`、`index`，或者交给 [`collections.Delimit`](/functions/collections/delimit/) 用别的分隔符再拼回去。

## 什么时候用，什么时候别用

**该用**：

- 输入是一个完整字符串、需要变成多项；
- 分隔符固定且每项之间没有嵌套。

**别用**：

- 反向操作（把切片拼成一个字符串）→ 用 [`collections.Delimit`](/functions/collections/delimit/)；
- 按位置截取而不是按分隔符 → 用 [`strings.Substr`](/functions/strings/substr/) 或 [`strings.SliceString`](/functions/strings/slicestring/)；
- 分隔规则是模式（例如「以任意空白分隔」）→ 用 [`strings.FindRE`](/functions/strings/findre/) 或先 [`strings.ReplaceRE`](/functions/strings/replacere/) 归一化再切；
- 想按行切分 → 用换行符作 `DELIM`，或直接用 [`os.ReadDir`](/functions/os/readdir/) 之类的目录函数。

## 用法

示例：

```go-html-template
{{ split "tag1,tag2,tag3" "," }} → ["tag1", "tag2", "tag3"]
{{ split "abc" "" }} → ["a", "b", "c"]
```

> [!NOTE]
> `strings.Split` 函数的作用本质上与 [`collections.Delimit`][] 函数相反：`split` 把字符串切分成切片，`delimit` 则把切片拼接成字符串。

[`collections.Delimit`]: /functions/collections/delimit/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/tags.html"}
{{ $tags := split "hugo,go,模板" "," }}
{{ len $tags }}|{{ index $tags 1 }}|{{ delimit $tags ", " }}
```

Hugo 0.167.0 实测输出：

```text
3|go|hugo, go, 模板
```

**你应当看到什么**：`len` 得 3，`index 1` 取到第二个元素 `go`，最后用 `delimit` 又拼回一行。注意直接打印切片会得到 `[hugo go 模板]` 这种带方括号的形式，通常不是你想要的，遍历或 `delimit` 才是常规做法。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ split "tag1,tag2,tag3" "," }}` | `[tag1 tag2 tag3]`（打印形式；元素为 3 个） | 否 |
| `{{ split "abc" "" }}` | `[a b c]`——空分隔符按**字符**切分 | 否 |
| `{{ split "a,,b" "," }}` | `[a  b]`——中间那个**空项会保留** | 否 |
| `{{ split "" "," }}` | 打印为 `[]`，但实测 `len` 为 **1**——是「含一个空字符串的切片」，不是空切片 | 否 |
| `{{ split "" "" }}` | 打印为 `[]`，实测 `len` 为 **0**（真正的空切片） | 否 |
| `{{ split "abc" "," }}` | 打印为 `[abc]`，实测 `len` 为 **1**（分隔符不存在时得到只含原字符串一项的切片） | 否 |
| 返回类型 | `[]string`，可直接 `range` / `len` / `index` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 遍历时多出一项空字符串 | 输入里有两个连续分隔符，空项被保留（实测 `"a,,b"` 得 3 项） | 切分后用 `with` 过滤空项，或先 [`strings.TrimSpace`](/functions/strings/trimspace/) 清理每一项 |
| 没报错但结果不对 | 页面上直接显示 `[a b c]` | 把切片当字符串输出了 | 用 `range` 遍历或 `delimit` 拼接 |
| 没报错但结果不对 | 中文被切坏 | 用了空字符串以外的错误分隔符 | 空分隔符按 rune 切分（实测 `"abc"` 得 `[a b c]`），中文同样安全 |

更多排查入口见[故障排查](/troubleshooting/)。
