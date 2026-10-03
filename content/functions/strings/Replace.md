+++
title = "strings.Replace"
linkTitle = "Replace"
description = "返回给定字符串，并把其中所有 OLD 替换为 NEW。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/functions/strings/replace/"

[params.functions_and_methods]
signatures = ["strings.Replace STRING OLD NEW [LIMIT]"]
returnType = "string"
aliases = ["replace"]
+++

## 这一页解决什么问题

把一段文本里的某个**固定子串**换成另一个：改标题里的品牌名、把下划线换成短横、把占位符替换成实际值。`strings.Replace` 默认替换**全部**出现位置，也可以只替换前 `LIMIT` 次。

## 什么时候用，什么时候别用

**该用**：

- 替换的是字面量（不需要模式匹配）；
- 一组替换、或者「只替换前几次」。

**别用**：

- 要同时做**多组**替换 → 用 [`strings.ReplacePairs`](/functions/strings/replacepairs/)：一次扫描完成，比连续调用本函数快；
- 要按**模式**替换（字符类、重复次数、捕获组）→ 用 [`strings.ReplaceRE`](/functions/strings/replacere/)；
- 只删开头的前缀或结尾的后缀 → 用 [`strings.TrimPrefix`](/functions/strings/trimprefix/)、[`strings.TrimSuffix`](/functions/strings/trimsuffix/)；
- 要删掉全部空白/换行 → 用 [`strings.ReplaceRE`](/functions/strings/replacere/) 配 `\s+`。

## 用法

```go-html-template
{{ $s := "Batman and Robin" }}
{{ replace $s "Robin" "Catwoman" }} → Batman and Catwoman
```

用 `LIMIT` 参数限制替换次数：

```go-html-template
{{ replace "aabbaabb" "a" "z" 2 }} → zzbbaabb
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/rename.html"}
{{ replace "Batman and Robin" "Robin" "Catwoman" }}
{{ replace "aabbaabb" "a" "z" 2 }}
```

Hugo 0.167.0 实测输出：

```text
Batman and Catwoman
zzbbaabb
```

**你应当看到什么**：第一行是全部替换的结果；第二行只替换了前 2 个 `a`（`aa`→`zz`），剩下的 `bbaa` 里那两个 `a` 保持原样——这就是 `LIMIT` 的作用。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 未找到 `OLD`（实测 `replace "abc" "z" "y"`） | 原样返回 `abc` | 否 |
| `LIMIT` 小于出现次数（实测 `replace "aabbaabb" "a" "z" 2`） | `zzbbaabb` | 否 |
| `OLD` 是空字符串（实测 `replace "abc" "" "-"`） | `-a-b-c-`：在**每个 rune 边界**插入 `NEW` | 否 |
| 大小写不同 | 不匹配（本函数区分大小写） | 否 |
| 返回类型 | `string`，未找到时是原字符串而不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 该替换的没替换 | 区分大小写，`Hugo` 与 `hugo` 是两个子串 | 需要忽略大小写就先 [`strings.ToLower`](/functions/strings/tolower/) 归一化 |
| 没报错但结果不对 | 结果里莫名多出很多替换字符 | `OLD` 传成了空字符串（实测会在每个字符边界插入） | 用 `with` 确认 `OLD` 非空再调用 |
| 没报错但结果不对 | 连续写了好几个 `replace`，构建变慢 | 每次 `replace` 都要完整扫描一遍字符串 | 多组替换改用 [`strings.ReplacePairs`](/functions/strings/replacepairs/)（单次扫描） |
| 没报错但结果不对 | 参数顺序记错，替换结果莫名其妙 | 本函数是 `STRING OLD NEW [LIMIT]`，字符串在最前 | 用管道写法 `{{ $s | replace "old" "new" }}` |

更多排查入口见[故障排查](/troubleshooting/)。
