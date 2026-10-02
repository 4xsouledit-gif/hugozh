+++
title = "crypto.MD5"
linkTitle = "MD5"
description = "返回给定输入的 MD5 校验和，并编码为十六进制字符串。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/crypto/md5/"

[params.functions_and_methods]
signatures = ["crypto.MD5 INPUT"]
returnType = "string"
aliases = ["md5"]
+++

## 这一页解决什么问题

`md5` 给一个输入算 MD5 摘要，返回 32 位十六进制字符串。它最常见的用途不是「安全」，而是**生成稳定的短标识**：Gravatar 头像地址、缓存键、去重键。需要判断「安全」的场合请用 SHA-256 或 HMAC。

## 什么时候用，什么时候别用

**该用**：

- Gravatar 头像（官方要求 MD5，见本页「用法」）；
- 生成与安全无关的短标识 / 缓存键；
- 需要与只认 MD5 的外部系统对接。

**别用**：

- 安全相关（签名、密码、防篡改）→ MD5 已被证明不安全，改用 [`crypto.SHA256`](/functions/crypto/sha256/) 或 [`crypto.HMAC`](/functions/crypto/hmac/)；
- 只是要一个够短的指纹 → [`hash.FNV32a`](/functions/hash/fnv32a/) / [`hash.XxHash`](/functions/hash/xxhash/) 更快；
- 资源指纹 → 对 resource 用 `fingerprint`。

```go-html-template
{{ md5 "Hello world" }} → 3e25960a79dbc69b674cd4ec67a72c62
```

如果你想用 [Gravatar][] 生成唯一头像，这个函数会很有用：

```html
<img src="https://www.gravatar.com/avatar/{{ md5 "your@email.com" }}?s=100&d=identicon">
```

[Gravatar]: https://en.gravatar.com/

## 完整示例（实测）

```go-html-template
{{ md5 "Hello world" }} → 3e25960a79dbc69b674cd4ec67a72c62
{{ md5 "" }}            → d41d8cd98f00b204e9800998ecf8427e
{{ md5 42 }}            → a1d0c6e83f027327d8461063f4ac58a6
{{ md5 nil }}           → d41d8cd98f00b204e9800998ecf8427e
```

Hugo 0.167.0 实测：以上逐条与 `→` 后一致。`md5 ""` 与 `md5 nil` 相同，因为两者都被当作空输入；`md5 42` 先转成字符串 `"42"` 再计算。

## 返回值边界（实测）

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"Hello world"` | `3e25960a79dbc69b674cd4ec67a72c62` | 否 |
| 空字符串 / `nil` | `d41d8cd98f00b204e9800998ecf8427e` | 否 |
| 数字（`42`） | 按字符串 `"42"` 计算 | 否 |
| 返回类型 | `string`（32 位十六进制，小写） | 否 |
