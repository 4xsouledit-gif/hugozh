+++
title = "编码函数"
linkTitle = "encoding"
description = "用这些函数对数据做编码与解码。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/encoding/"
+++

这一章解决「文本要进出非文本环境」的问题：把内容塞进 URL、JSON、`data:` URI 用 base64；需要在 `0-9a-f` 字符集里表示字节用十六进制；把模板里的数据交给前端 JavaScript 用 JSON。

两个容易混淆的点先说：**编码不是加密**（base64/hex 谁都能解回来），以及**解码函数对输入格式很挑**（缺补齐的 `=`、URL 安全字符、奇数长度的十六进制都会直接让构建失败）。

## 读完本章你应该能够

- 在 base64、十六进制、JSON 之间按用途选对函数，并知道三者的体积开销（base64 约 +33%，十六进制翻倍）；
- 说清 `base64Decode` 与 `encoding.HexDecode` 的输入要求，以及它们各自的报错信息；
- 处理中文：base64 与十六进制都按 **UTF-8 字节**工作，往返无损；
- 用 `encoding.Jsonify` 输出 JSON，并知道默认会转义 `<`、`>`、`&`、键按字节序排序、返回类型是 `template.HTML`；
- 记住哪些函数有短别名、哪些必须写全名：`base64Encode`、`base64Decode`、`jsonify` 是别名；`encoding.HexEncode`、`encoding.HexDecode` **没有**别名。

## 建议阅读顺序

1. **[encoding.Jsonify](/functions/encoding/jsonify/)** —— 日常最常用：给前端传数据。
2. **[encoding.Base64Encode](/functions/encoding/base64encode/)** / **[encoding.Base64Decode](/functions/encoding/base64decode/)** —— 成对使用，注意解码对补齐与字符表的要求。
3. **[encoding.HexEncode](/functions/encoding/hexencode/)** / **[encoding.HexDecode](/functions/encoding/hexdecode/)** —— 成对使用，注意必须写全名、输入必须是偶数长度的合法十六进制。

> [!TIP]
> 想确认自己算出来的编码对不对，可以拿本页的实测值对照：`"Hugo"` 的 base64 是 `SHVnbw==`，`"Hello world"` 的十六进制是 `48656c6c6f20776f726c64`。
