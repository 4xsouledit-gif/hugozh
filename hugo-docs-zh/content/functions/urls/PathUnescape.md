+++
title = "urls.PathUnescape"
linkTitle = "PathUnescape"
description = "返回给定字符串，并把所有百分号编码序列替换为对应的未转义字符。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/urls/pathunescape/"

[params.functions_and_methods]
signatures = ["urls.PathUnescape INPUT"]
returnType = "string"
+++

## 这一页解决什么问题

从 URL、`href`、数据文件里拿到的是**已编码**的片段：`my%20caf%C3%A9`、`%E4%B8%AD%E6%96%87`。想把它显示给读者，或想用解码后的值去查数据，就要还原成原来的文本。`urls.PathUnescape` 做的是 [`urls.PathEscape`](/functions/urls/pathescape/) 的逆变换。

## 什么时候用，什么时候别用

**该用**：

- 显示从 URL 取来的片段（文件名、术语名）；
- 解码后用解码结果去查映射、做比较。

**别用**：

- 要编码 → 用 [`urls.PathEscape`](/functions/urls/pathescape/)；
- 解析整条 URL 并分别取各部分（路径、查询、片段）→ 用 [`urls.Parse`](/functions/urls/parse/)：它已经按部分给好了解码前后的字段；
- 想把百分号编码的 URL 变回站点路径 → 直接用解析结果里的字段，而不是对整条 URL 解码。

## 用法

**（0.153.0 新增）**

`urls.PathUnescape` 函数执行 [`urls.PathEscape`][] 的逆变换。

```go-html-template
{{ urls.PathUnescape "A%2Fb%2Fc%3Fd=%C3%A9&f=g+h" }} → A/b/c?d=é&f=g+h
```

用该函数解码 URL 路径中的单个片段。

[`urls.PathEscape`]: /functions/urls/pathescape/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/decode.html"}
[{{ urls.PathUnescape "A%2Fb%2Fc%3Fd=%C3%A9&f=g+h" }}]|[{{ urls.PathUnescape (urls.PathEscape "中文 标签") }}]
```

Hugo 0.167.0 实测输出（原始值里的 `&` 在网页中显示为 `&amp;`，`+` 显示为 `&#43;`）：

```text
[A/b/c?d=é&f=g+h]|[中文 标签]
```

**你应当看到什么**：第一项把 `%2F`、`%3F`、`%C3%A9` 分别还原成 `/`、`?`、`é`；注意 `+` **原样保留**——本函数做的是路径解码，不会把 `+` 变成空格。第二项验证「先编码再解码」能拿回原文。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"A%2Fb%2Fc%3Fd=%C3%A9&f=g+h"` | `A/b/c?d=é&f=g+h`（`+` 不变空格） | 否 |
| `urls.PathUnescape (urls.PathEscape "中文 标签")` | `中文 标签`（与原文完全一致） | 否 |
| 不含 `%` 的普通字符串 | 原样返回 | 否 |
| 非法的百分号序列（如 `%ZZ`） | 上游未说明 | 上游未说明 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 查询串里的 `+` 没有变成空格 | 本函数是**路径**解码，`+` 在路径里不是空格的转义 | 查询串场景请用 `urls.Parse` 得到的 `Query`，它按查询语义解析 |
| 没报错但结果不对 | 解码结果仍带 `%` | 原文是双重编码 | 再解一次，或在源头修掉重复编码 |
| 没报错但结果不对 | 解码后拿到 `A/b/c` 却想当成一个片段 | 编码前没有把 `/` 编成 `%2F`（或用的是不会编码 `/` 的方式） | 编码用 [`urls.PathEscape`](/functions/urls/pathescape/)（实测它会把 `/` 编成 `%2F`） |

更多排查入口见[故障排查](/troubleshooting/)。
