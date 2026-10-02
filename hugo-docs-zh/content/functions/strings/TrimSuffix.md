+++
title = "strings.TrimSuffix"
linkTitle = "TrimSuffix"
description = "返回给定字符串，并从结尾删除指定后缀。"
date = 2026-10-02
weight = 310
source = "https://gohugo.io/functions/strings/trimsuffix/"

[params.functions_and_methods]
signatures = ["strings.TrimSuffix SUFFIX STRING"]
returnType = "string"
+++

## 这一页解决什么问题

想把结尾的固定文本去掉，得到「剩下的那部分」：去掉文件名末尾的 `.md`、去掉 URL 末尾的斜杠、去掉资源名末尾的 `.min.js`。与 [`strings.HasSuffix`](/functions/strings/hassuffix/) 只回答「是不是」不同，本函数直接返回处理后的字符串。

## 什么时候用，什么时候别用

**该用**：

- 后缀是固定文本，且希望**最多删一次**；
- 拿到结果继续参与拼接（例如给文件名换扩展名）。

**别用**：

- 想删的是「结尾的某一类字符」而不是一整段文本 → 用 [`strings.TrimRight`](/functions/strings/trimright/)（它按字符集合反复删）；
- 想删开头 → 用 [`strings.TrimPrefix`](/functions/strings/trimprefix/) 或 [`strings.TrimLeft`](/functions/strings/trimleft/)；
- 只想判断是不是这个后缀 → 用 [`strings.HasSuffix`](/functions/strings/hassuffix/)；
- 想按模式去尾 → 用 [`strings.ReplaceRE`](/functions/strings/replacere/)。

## 用法

```go-html-template
{{ strings.TrimSuffix "a" "aabbaa" }} → aabba
{{ strings.TrimSuffix "aa" "aabbaa" }} → aabb
{{ strings.TrimSuffix "aaa" "aabbaa" }} → aabbaa
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/strip-ext.html"}
[{{ strings.TrimSuffix ".md" "content/news/a.md" }}]
```

Hugo 0.167.0 实测输出：

```text
[content/news/a]
```

**你应当看到什么**：结尾的 `.md` 被删掉了。若把后缀写成 `".txt"`（字符串里没有），结果会原样返回——本函数不会报错，也不会做模糊匹配。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ strings.TrimSuffix "a" "aabbaa" }}` | `aabba`——只删**一次**末尾的 `a` | 否 |
| `{{ strings.TrimSuffix "aa" "aabbaa" }}` | `aabb` | 否 |
| `{{ strings.TrimSuffix "aaa" "aabbaa" }}` | `aabbaa`——后缀不匹配时**原样返回** | 否 |
| 后缀比字符串长 | 原样返回，不报错 | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `aabbaa` 想删光所有结尾的 `a`，结果还剩一个 | 本函数只删**一次**完整后缀（实测 `"aa"` 得 `aabb`，`"a"` 得 `aabba`） | 要按字符集合反复删，用 [`strings.TrimRight`](/functions/strings/trimright/) |
| 没报错但结果不对 | 后缀明明在结尾却没删掉 | 大小写不同，或前面多了空白 | 先 [`strings.TrimSpace`](/functions/strings/trimspace/) 并检查大小写 |
| 没报错但结果不对 | 想删的其实是「`.md` 或 `.markdown`」 | 本函数只认一个字面量后缀 | 多个候选分别判断，或改用 [`strings.ReplaceRE`](/functions/strings/replacere/) |

更多排查入口见[故障排查](/troubleshooting/)。
