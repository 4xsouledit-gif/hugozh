+++
title = "strings.ReplacePairs"
linkTitle = "ReplacePairs"
description = "返回给定字符串，并用一组旧新字符串对在一次扫描中完成多处替换。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/functions/strings/replacepairs/"

[params.functions_and_methods]
signatures = ["strings.ReplacePairs OLD NEW [OLD NEW ...] STRING"]
returnType = "string"
+++

## 这一页解决什么问题

要对同一段文本做**好几处**不同替换时，连着写几个 [`strings.Replace`](/functions/strings/replace/) 既啰嗦又慢（每次都要把整段文本重扫一遍）。`strings.ReplacePairs` 把所有「旧→新」对一次传入，只扫描一遍字符串就完成全部替换。

## 什么时候用，什么时候别用

**该用**：

- 替换组数 ≥ 2，或文本很长（例如整篇文章）；
- 想用一次调用替掉一串变量赋值。

**别用**：

- 只有一处替换，且字符串很短（例如标题）→ [`strings.Replace`](/functions/strings/replace/) 就够，代码更直白；
- 要按**模式**替换 → 用 [`strings.ReplaceRE`](/functions/strings/replacere/)；
- 替换是**递归**的（替换结果还要再被后续规则处理）→ 本函数只扫一遍，不会二次应用（见下文实测）。

## 用法

**（0.158.0 新增）**

用 `strings.ReplacePairs` 函数可以在一次操作中对字符串完成多处替换，这比依次调用 [`strings.Replace`][] 函数更快。

依次替换需要多次函数调用与变量重新赋值：

```go-html-template
{{ $s := "aabbcc" }}
{{ $s = strings.Replace $s "a" "x" }}
{{ $s = strings.Replace $s "b" "y" }}
{{ $s = strings.Replace $s "c" "z" }}
{{ $s }} → xxyyzz
```

使用 `strings.ReplacePairs` 可以用更少的函数调用、在更短的时间内得到相同结果：

```go-html-template
{{ "aabbcc" | strings.ReplacePairs "a" "x" "b" "y" "c" "z" }} → xxyyzz
```

各对字符串也可以放在一个切片中传入：

```go-html-template
{{ $pairs := slice
  "a" "x"
  "b" "y"
  "c" "z"
}}
{{ "aabbcc" | strings.ReplacePairs $pairs }} → xxyyzz
```

## 示例

注意：由于该函数只扫描字符串一次，替换不会递归进行。

```go-html-template
{{ $pairs := slice
  "a" "b"
  "b" "c"
}}
{{ "a" | strings.ReplacePairs $pairs }} → b
```

当多个旧字符串都能在同一位置匹配时，应用最先匹配的那一个。

```go-html-template
{{ $pairs := slice
  "app" "pear"
  "apple" "orange"
}}
{{ "apple" | strings.ReplacePairs $pairs }} → pearle
```

把一对中的第二个值写成空字符串，即可删除指定的字符串。

```go-html-template
{{ $pairs := slice "b" "" }}
{{ "abc" | strings.ReplacePairs $pairs }} → ac
```

## 边界情况

下表说明该函数如何处理各种输入情况。

场景|结果
:--|:--
参数少于两个|报错
切片元素个数为奇数|报错
空切片|返回输入字符串
输入字符串为空|返回空字符串
旧字符串为空|返回输入字符串与新字符串交错（interleaved）后的结果

## 性能

`strings.Replace` 与 `strings.ReplacePairs` 虽然可以得到相同的结果，但处理数据的方式不同。选对函数可以明显缩短 Hugo 构建项目所需的时间。

### 单次扫描与多次扫描

使用 `strings.Replace` 时，Hugo 必须从头到尾扫描文本才能找到匹配。如果把三次替换串联在一起，Hugo 就要对整个字符串做三次独立的扫描。

`strings.ReplacePairs` 函数更高效，因为它只做一次扫描：Hugo 只遍历文本一遍，同时应用所有替换。

### 缓存

`strings.Replace` 执行的是直接替换，而 `strings.ReplacePairs` 需要先完成一步初始化，准备好单次扫描的替换逻辑。为了保持高效，Hugo 用缓存来管理这套逻辑：

- 首次调用时，Hugo 初始化并存储该组旧新字符串对应的逻辑。
- 后续调用时，Hugo 取出已存储的逻辑，跳过初始化步骤，从而缩短调用耗时。

### 如何选择函数

文本越长、旧新字符串对越多，`strings.ReplacePairs` 的效率优势越明显。决定用哪个函数时，可以参考以下情形：

- 对标题这类短字符串做单次替换时，`strings.Replace` 更高效。
- 需要多处替换，或处理长文这类长字符串时，`strings.ReplacePairs` 快得多。

对于约 8000 字符的文档（大致相当于一篇长文的长度），即使在首次调用时，`strings.ReplacePairs` 也比连续调用五次 `strings.Replace` 更快。一旦命中缓存，只要有两对或更多旧新字符串，几乎在任何情况下它都是更快的选择。

## 完整示例（实测）

```go-html-template {file="layouts/_partials/replace-all.html"}
{{ "aabbcc" | strings.ReplacePairs "a" "x" "b" "y" "c" "z" }}
{{ $pairs := slice "a" "b" "b" "c" }}
{{ "a" | strings.ReplacePairs $pairs }}
```

Hugo 0.167.0 实测输出（第二段模板里变量声明那一行自身不留输出）：

```text
xxyyzz
b
```

**你应当看到什么**：第一行是 3 组替换的结果；第二行验证了「不递归」——`a` 先被换成 `b`，而这个新产生的 `b` **不会**再被第二条规则换成 `c`，所以结果是 `b` 而不是 `c`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。上游「边界情况」表逐条复核如下。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 空切片（实测 `{{ "abc" | strings.ReplacePairs (slice) }}`） | 原样返回 `abc` | 否 |
| 输入字符串为空 | 返回空字符串 | 否 |
| 参数少于两个（实测 `{{ strings.ReplacePairs "a" }}`） | —— | **是，构建失败**：`error calling ReplacePairs: requires at least 2 arguments` |
| 切片元素个数为奇数（实测 `{{ "abc" | strings.ReplacePairs (slice "a") }}`） | —— | **是，构建失败**：`error calling ReplacePairs: uneven number of replacement pairs` |
| 同一位置多个旧串都能匹配（实测 `"apple"` 配 `"app"→"pear"`、`"apple"→"orange"`） | `pearle`——用**最先**匹配的那一对 | 否 |
| 旧字符串为空 | 返回输入字符串与新字符串交错后的结果（上游说明） | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 替换结果没有继续被后面的规则处理 | 本函数只扫描一遍，替换**不递归**（实测 `a` 配 `a→b`、`b→c` 得 `b`） | 需要连锁替换就按顺序多次调用，或用 [`strings.ReplaceRE`](/functions/strings/replacere/) |
| 报错看不懂 | `uneven number of replacement pairs`，整站构建失败 | 传入的旧新字符串个数成单 | 检查切片长度是否为偶数，或直接写成 `"a" "x" "b" "y"` |
| 没报错但结果不对 | 长旧串没被匹配 | 同一位置多个候选时用**最先**匹配的那一对，与「最长匹配」无关 | 把更长的旧串放在前面（实测 `"app"` 在 `"apple"` 之前会命中 `"app"`） |

更多排查入口见[故障排查](/troubleshooting/)。

[`strings.Replace`]: /functions/strings/replace/
