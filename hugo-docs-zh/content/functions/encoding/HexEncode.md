+++
title = "encoding.HexEncode"
linkTitle = "HexEncode"
description = "返回给定内容的十六进制编码结果。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/encoding/hexencode/"

[params.functions_and_methods]
signatures = ["encoding.HexEncode INPUT"]
returnType = "string"
+++

## 这一页解决什么问题

把文本变成纯十六进制字符串：生成 CSS 颜色值、构造哈希/标识串、调试时看清字节内容（UTF-8 中文的每个字节长什么样）。它输出**小写**十六进制，每个字节两位。

注意：这是 `encoding.HexEncode`（**无**别名短名），模板里必须写全名，不能像 `base64Encode` 那样只写后缀。

## 什么时候用，什么时候别用

**该用**：

- 把字符串转成十六进制表示（颜色、token、调试输出）；
- 需要「只用 `0-9a-f`」的字符集时；
- 与 [`encoding.HexDecode`](/functions/encoding/hexdecode/) 成对使用，往返无损（含中文）。

**别用**：

- 想压缩数据 → 十六进制是**膨胀**的：每个字节变成两个字符，体积翻倍（比 base64 更大）；
- 想计算摘要/哈希 → 用 [`crypto`](/functions/crypto/) 系列（如 `crypto.SHA256` 和 `hash.FNV32a` 之类），`HexEncode` 不做任何计算；
- 想按数字进制转换 → 那是 [`cast.ToInt`](/functions/cast/toint/) 与 `fmt` 的事，`HexEncode` 编码的是**字符串的字节**，不是数值；
- 想得到大写十六进制 → 实测输出是小写，需要大写用 [`strings.ToUpper`](/functions/strings/toupper/)。

## 上游给出的结果

```go-html-template
{{ "Hello world" | encoding.HexEncode }} → 48656c6c6f20776f726c64
```

## 完整示例：把文本与中文转成十六进制

```go-html-template {file="layouts/_partials/hex.html"}
{{ $s := "Hello world" }}
<p>{{ $s | encoding.HexEncode }}</p>
<p>{{ "中" | encoding.HexEncode }}</p>
<p>{{ "" | encoding.HexEncode }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>48656c6c6f20776f726c64</p>
<p>e4b8ad</p>
<p></p>
```

**你应当看到什么**：第二行是「中」的 **UTF-8 三个字节**（`e4 b8 ad`）——这说明编码对象是字节而不是字符；第三行空字符串得到空字符串。数字会先被当成字符串（实测 `42` → `3432`，也就是 `"42"` 的字节）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"Hello world"` | `48656c6c6f20776f726c64` | 否 |
| `"中"` | `e4b8ad`（UTF-8 字节，小写） | 否 |
| `""` | `""` | 否 |
| 数字 `42` | `3432`（相当于 `"42"`） | 否 |
| 返回类型 | `string`，小写十六进制，长度为字节数的 2 倍 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 以为会得到大写（`48656C…`） | 实测输出小写 | 需要大写就 [`strings.ToUpper`](/functions/strings/toupper/) |
| 没报错但结果不对 | 把 `0x11` 之类的数值文本编码，结果对不上数值 | 编码的是**字符串字节**，不是数值 | 先 [`cast.ToInt`](/functions/cast/toint/) 取数值，再按需格式化 |
| 报错看不懂 | `function "hexEncode" not defined` | 本函数**没有**短别名 | 写全名 `encoding.HexEncode` |
| 没报错但结果不对 | 输出比原文长一倍 | 十六进制不是压缩 | 需要短一点改用 [`encoding.Base64Encode`](/functions/encoding/base64encode/) |

更多排查入口见[故障排查](/troubleshooting/)。
