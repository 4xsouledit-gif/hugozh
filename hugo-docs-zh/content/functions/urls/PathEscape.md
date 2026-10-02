+++
title = "urls.PathEscape"
linkTitle = "PathEscape"
description = "返回给定字符串，并对特殊字符与保留分隔符做百分号编码，使其可以安全地用作 URL 路径中的一个片段。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/urls/pathescape/"

[params.functions_and_methods]
signatures = ["urls.PathEscape INPUT"]
returnType = "string"
+++

## 这一页解决什么问题

要把一段可能含空格、中文或 `/` 的文本放进 URL 的**某一段路径**里。如果不编码，空格会截断地址，`/` 会被当成新的层级，中文在不同浏览器里表现也不一致。`urls.PathEscape` 对片段做百分号编码，保证它只会被当作一个整体。

## 什么时候用，什么时候别用

**该用**：

- 把术语名、标签、文件名之类的值拼进一条路径的某一层；
- 想得到编码后的片段再交给 [`urls.JoinPath`](/functions/urls/joinpath/) 拼接。

**别用**：

- 要编码整条 URL 或查询字符串 → 本函数**不会**编码 `=`、`&`（实测见下文），查询串请用 `querify` 或自行拼接；
- 要生成 HTML 锚点 `id` → 用 [`urls.Anchorize`](/functions/urls/anchorize/)；
- 要生成 slug（空格变短横、标点丢弃）→ 用 [`urls.URLize`](/functions/urls/urlize/)；
- 想解码 → 用 [`urls.PathUnescape`](/functions/urls/pathunescape/)。

## 用法

**（0.153.0 新增）**

`urls.PathEscape` 函数执行 [`urls.PathUnescape`][] 的逆变换。

```go-html-template
{{ urls.PathEscape "my café" }} → my%20caf%C3%A9
```

用该函数转义字符串，使其可以安全地用作 URL 路径中的单个片段。

[`urls.PathUnescape`]: /functions/urls/pathunescape/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/segment.html"}
[{{ urls.PathEscape "my café" }}]|[{{ urls.PathEscape "a/b?c=d&e" }}]
```

Hugo 0.167.0 实测输出（第二项的 `&` 在网页里会显示为 `&amp;`，函数返回的原始值是 `&`）：

```text
[my%20caf%C3%A9]|[a%2Fb%3Fc=d&e]
```

**你应当看到什么**：空格变 `%20`，`é` 变 `%C3%A9`；第二项里 `/` 变 `%2F`、`?` 变 `%3F`，但 `=` 与 `&` 原样保留——所以它适合编码**路径片段**，不适合编码查询字符串。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"my café"` | `my%20caf%C3%A9`（空格 → `%20`，非 ASCII → UTF-8 百分号编码） | 否 |
| `"a/b?c=d&e"` | `a%2Fb%3Fc=d&e`（`/`、`?` 被编码；`=`、`&` **不**被编码） | 否 |
| 已经是纯 ASCII 字母数字 | 原样返回 | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 查询参数拼接后语义错乱 | 本函数不编码 `=`、`&`，它们会被解析成参数分隔符 | 查询串不要用 `PathEscape`，用 `querify` 或手工拼 |
| 没报错但结果不对 | 地址里出现 `%20`，但站点目录里是短横 | `PathEscape` 做的是百分号编码，不会把空格换成短横 | 要 slug 语义用 [`urls.URLize`](/functions/urls/urlize/) |
| 报错看不懂 | 解码后仍是乱码 | 对已经编码过的字符串**再次**编码（双重编码） | 先确认输入是否已编码，再决定是否调用本函数 |

更多排查入口见[故障排查](/troubleshooting/)。
