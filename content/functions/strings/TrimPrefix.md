+++
title = "strings.TrimPrefix"
linkTitle = "TrimPrefix"
description = "返回给定字符串，并从开头删除指定前缀。"
date = 2026-10-02
weight = 280
source = "https://gohugo.io/functions/strings/trimprefix/"

[params.functions_and_methods]
signatures = ["strings.TrimPrefix PREFIX STRING"]
returnType = "string"
+++

## 这一页解决什么问题

想把开头的固定文本去掉，得到剩下的部分：把 `content/news/a.md` 变成相对路径 `news/a.md`、把 `/docs/guide/` 变成 `guide/`、把 `v2.1.0` 变成 `2.1.0`。与 [`strings.HasPrefix`](/functions/strings/hasprefix/) 只回答「是不是」不同，本函数直接返回处理后的字符串。

## 什么时候用，什么时候别用

**该用**：

- 前缀是固定文本，且希望**最多删一次**；
- 想拿到结果继续参与拼接或查找。

**别用**：

- 想删的是「开头某一类字符」而不是一整段文本 → 用 [`strings.TrimLeft`](/functions/strings/trimleft/)（它按字符集合反复删）；
- 想删结尾 → 用 [`strings.TrimSuffix`](/functions/strings/trimsuffix/) 或 [`strings.TrimRight`](/functions/strings/trimright/)；
- 只想判断是不是这个前缀 → 用 [`strings.HasPrefix`](/functions/strings/hasprefix/)；
- 想按模式去头 → 用 [`strings.ReplaceRE`](/functions/strings/replacere/)。

## 用法

```go-html-template
{{ strings.TrimPrefix "a" "aabbaa" }} → abbaa
{{ strings.TrimPrefix "aa" "aabbaa" }} → bbaa
{{ strings.TrimPrefix "aaa" "aabbaa" }} → aabbaa
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/rel-path.html"}
[{{ strings.TrimPrefix "content/" "content/news/a.md" }}]
```

Hugo 0.167.0 实测输出：

```text
[news/a.md]
```

**你应当看到什么**：开头的 `content/` 被删掉了。若换成不存在的前缀，结果原样返回（上游示例里 `"aaa"` 对 `"aabbaa"` 就得到 `aabbaa`）——不报错，也不做模糊匹配。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ strings.TrimPrefix "a" "aabbaa" }}` | `abbaa`——只删**一次**开头的前缀 | 否 |
| `{{ strings.TrimPrefix "aa" "aabbaa" }}` | `bbaa` | 否 |
| `{{ strings.TrimPrefix "aaa" "aabbaa" }}` | `aabbaa`——前缀不匹配时**原样返回** | 否 |
| 前缀比字符串长 | 原样返回，不报错 | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 想删光开头所有的 `a`，结果还剩一个 | 本函数只删**一次**完整前缀（实测 `"aa"` 得 `bbaa`） | 要按字符集合反复删，用 [`strings.TrimLeft`](/functions/strings/trimleft/) |
| 没报错但结果不对 | 前缀明明在开头却没删掉 | 大小写不同，或字符串前面多了空白 | 先 [`strings.TrimSpace`](/functions/strings/trimspace/)，并检查大小写 |
| 没报错但结果不对 | 想删的其实是「`http://` 或 `https://`」 | 本函数只认一个字面量前缀 | 多个候选分别判断，或改用 [`strings.ReplaceRE`](/functions/strings/replacere/) |

更多排查入口见[故障排查](/troubleshooting/)。
