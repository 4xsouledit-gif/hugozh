+++
title = "urls.JoinPath"
linkTitle = "JoinPath"
description = "把给定的元素拼接成一个 URL 字符串，并清理结果中的 ./ 与 ../ 元素；参数列表为空时返回空字符串。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/urls/joinpath/"

[params.functions_and_methods]
signatures = ["urls.JoinPath ELEMENT..."]
returnType = "string"
+++

## 这一页解决什么问题

需要在模板里把几段拼成一个地址（片段路径、域名加路径、从数据文件里读来的相对路径），又不想自己处理多余斜杠和 `../`。`urls.JoinPath` 负责拼接并清理 `.`、`..`，而且与操作文件系统路径的 [`path.Join`](/functions/path/join/) 不同，它**保留**开头的连续斜杠（协议相对地址 `//host/x` 需要这一点）。

## 什么时候用，什么时候别用

**该用**：

- 拼接 URL 的各个片段，尤其是片段里可能出现 `../`；
- 需要协议相对地址（`//example.org`）时。

**别用**：

- 生成站内地址并自动套用 `baseURL` → 用 [`urls.RelURL`](/functions/urls/relurl/)、[`urls.AbsURL`](/functions/urls/absurl/)（多语言用 [`urls.RelLangURL`](/functions/urls/rellangurl/)、[`urls.AbsLangURL`](/functions/urls/abslangurl/)）；
- 拼接**文件系统**路径（`path` 参数、`resources.Get` 的路径）→ 用 [`path.Join`](/functions/path/join/)：`JoinPath` 保留 `//` 的语义对文件路径是错的；
- 页面之间的链接 → 用 [`urls.Ref`](/functions/urls/ref/)、[`urls.RelRef`](/functions/urls/relref/)。

## 用法

```go-html-template
{{ urls.JoinPath }} → "" (empty string)
{{ urls.JoinPath "" }} → /
{{ urls.JoinPath "a" }} → a
{{ urls.JoinPath "a" "b" }} → a/b
{{ urls.JoinPath "/a" "b" }} → /a/b
{{ urls.JoinPath "https://example.org" "b" }} → https://example.org/b

{{ urls.JoinPath (slice "a" "b") }} → a/b
```

与 [`path.Join`][] 函数不同，`urls.JoinPath` 会保留开头连续的斜杠。

[`path.Join`]: /functions/path/join/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/build-url.html"}
[{{ urls.JoinPath }}]|[{{ urls.JoinPath "" }}]|[{{ urls.JoinPath "a" "b" }}]|[{{ urls.JoinPath "/a" "b" }}]|[{{ urls.JoinPath "//a" "b" }}]|[{{ urls.JoinPath "../a" "b" }}]
```

Hugo 0.167.0 实测输出：

```text
[]|[/]|[a/b]|[/a/b]|[//a/b]|[a/b]
```

**你应当看到什么**：空参数列表得到空字符串；单个空字符串得到 `/`；`//a` 开头的**双斜杠被保留**（`//a/b`），这是它与 `path.Join` 的分水岭；而 `../a` 里的 `..` 被清理掉，得 `a/b`。这些都与上游示例一致。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`baseURL` 取 `https://example.org/` 或 `https://example.org/docs/` 时结果相同（本函数**不读** `baseURL`）。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| 无参数 | `""`（空字符串） | 否 |
| `""` | `/` | 否 |
| `"a" "b"` | `a/b` | 否 |
| `"/a" "b"` | `/a/b` | 否 |
| `"//a" "b"` | `//a/b`（保留开头连续斜杠） | 否 |
| `"../a" "b"` | `a/b`（`.`、`..` 被清理） | 否 |
| `"https://example.org" "b"` | `https://example.org/b` | 否 |
| `(slice "a" "b")` | `a/b`（切片作为单个参数传入） | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 传空字符串想得到空串，却得到 `/` | 上游即如此：只有**参数列表为空**才返回 `""`（实测 `urls.JoinPath ""` → `/`） | 空值先用 `with` 判断，或直接不传参 |
| 没报错但结果不对 | 用 `JoinPath` 拼文件路径，结果多出斜杠 | 本函数面向 URL，保留 `//` 是有意为之 | 文件路径用 [`path.Join`](/functions/path/join/) |
| 没报错但结果不对 | 结果里没有域名前缀 | 本函数只做拼接，不读 `baseURL` | 需要带域名的完整地址用 [`urls.AbsURL`](/functions/urls/absurl/) |

更多排查入口见[故障排查](/troubleshooting/)。
