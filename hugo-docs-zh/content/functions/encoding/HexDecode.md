+++
title = "encoding.HexDecode"
linkTitle = "HexDecode"
description = "返回给定内容的十六进制解码结果。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/encoding/hexdecode/"

[params.functions_and_methods]
signatures = ["encoding.HexDecode INPUT"]
returnType = "string"
+++

## 这一页解决什么问题

把十六进制字符串还原成文本：解析配置里存的十六进制值、还原 URL 或 cookie 里被十六进制化的内容、调试时确认某个字节序列到底是什么。

输入必须是**偶数长度**的十六进制字符，否则会直接报错（实测 `abc` → `encoding/hex: odd length hex string`）。

## 什么时候用，什么时候别用

**该用**：

- 十六进制串 → 文本（UTF-8）；
- 与 [`encoding.HexEncode`](/functions/encoding/hexencode/) 配对做往返验证。

**别用**：

- 输入可能带空格、换行或 `0x` 前缀 → 本函数不接受这些，需先清洗（实测输入必须全是 `0-9a-fA-F`）；
- 解出来是二进制（图片、压缩包）→ 返回 `string` 会损坏数据；这类数据用资源对象处理；
- 想只做大小写归一 → 用 [`strings.ToLower`](/functions/strings/tolower/)；
- 想按十六进制**解析数值**（`0x11` → 17）→ 那是 [`cast.ToInt`](/functions/cast/toint/)，`HexDecode` 解的是字节序列。

## 上游给出的结果

```go-html-template
{{ "48656c6c6f20776f726c64" | encoding.HexDecode }} → Hello world
```

## 完整示例：还原文本与中文

```go-html-template {file="layouts/_partials/hexd.html"}
{{ $s := "48656c6c6f20776f726c64" }}
<p>{{ $s | encoding.HexDecode }}</p>
<p>{{ "e4b8ad" | encoding.HexDecode }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>Hello world</p>
<p>中</p>
```

**你应当看到什么**：第二行把「中」的 UTF-8 字节还成了字符，说明解码结果按 UTF-8 理解；大小写混写也可以（实测 `48656C6C6F` → `Hello`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"48656c6c6f20776f726c64"` | `Hello world` | 否 |
| `"e4b8ad"` | `中` | 否 |
| `"48656C6C6F"`（大写） | `Hello`（大小写都接受） | 否 |
| `""` | `""` | 否 |
| `"abc"`（奇数长度） | —— | 是：`error calling HexDecode: encoding/hex: odd length hex string` |
| `"zz"`（非十六进制字符） | —— | 是：`error calling HexDecode: encoding/hex: invalid byte: U+007A 'z'` |
| 返回类型 | `string`（UTF-8 文本） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `encoding/hex: odd length hex string` | 输入长度是奇数，缺一个字符 | 检查数据源是否被截断，或补 `0`（补前先确认语义） |
| 报错看不懂 | `encoding/hex: invalid byte: U+007A 'z'` | 输入含 `0x` 前缀、空格、换行或非十六进制字符 | 先去掉前缀与空白再传入 |
| 没报错但结果不对 | 结果乱码 | 原文是二进制而非文本 | 二进制用资源对象处理，不要经过 `string` |
| 报错看不懂 | `function "hexDecode" not defined` | 本函数**没有**短别名 | 写全名 `encoding.HexDecode` |

更多排查入口见[故障排查](/troubleshooting/)。
