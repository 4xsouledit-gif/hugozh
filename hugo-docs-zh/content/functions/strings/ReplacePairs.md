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

[`strings.Replace`]: /functions/strings/replace/
