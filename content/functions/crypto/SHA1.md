+++
title = "crypto.SHA1"
linkTitle = "SHA1"
description = "返回给定输入的 SHA1 校验和，并编码为十六进制字符串。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/crypto/sha1/"

[params.functions_and_methods]
signatures = ["crypto.SHA1 INPUT"]
returnType = "string"
aliases = ["sha1"]
+++

## 这一页解决什么问题

`sha1` 给输入算 SHA-1 摘要，返回 40 位十六进制字符串。它同样属于「校验和 / 短标识」工具，而不是安全工具。

## 什么时候用，什么时候别用

**该用**：

- 与只认 SHA-1 的旧系统对接（例如某些老式完整性校验）；
- 需要 40 位十六进制摘要、且不需要密码学强度。

**别用**：

- 安全场景 → SHA-1 已被认为不安全，改用 [`crypto.SHA256`](/functions/crypto/sha256/)；
- 需要带密钥 → 用 [`crypto.HMAC`](/functions/crypto/hmac/)；
- 只要短指纹 → 用 [`hash.FNV32a`](/functions/hash/fnv32a/) / [`hash.XxHash`](/functions/hash/xxhash/)。

```go-html-template
{{ sha1 "Hello world" }} → 7b502c3a1f48c8609ae212cdfb639dee39673f5e
```

## 完整示例（实测）

```go-html-template
{{ sha1 "Hello world" }} → 7b502c3a1f48c8609ae212cdfb639dee39673f5e
{{ sha1 "" }}            → da39a3ee5e6b4b0d3255bfef95601890afd80709
```

Hugo 0.167.0 实测：两行都与 `→` 后一致（空字符串的 SHA-1 为空串摘要）。

## 返回值边界（实测）

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"Hello world"` | `7b502c3a1f48c8609ae212cdfb639dee39673f5e` | 否 |
| 空字符串 | `da39a3ee5e6b4b0d3255bfef95601890afd80709` | 否 |
| 返回类型 | `string`（40 位十六进制，小写） | 否 |
