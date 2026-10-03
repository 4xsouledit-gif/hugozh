+++
title = "加密函数"
linkTitle = "crypto"
description = "生成加密哈希与 HMAC 签名：md5、sha1、sha256，以及带密钥的 hmac。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/crypto/"

[params.teach]
difficulty = "参考"
time = "按需查阅"
prereq = [
  "会写基本 Go 模板。",
]
outcomes = [
  "分清**加密哈希**（本组：`md5` / `sha1` / `sha256` / `hmac`）与**非加密哈希**（[hash](/functions/hash/) 组）；",
  "用 `crypto.SHA256` 一类函数给字符串生成十六进制摘要；",
  "用 `crypto.HMAC` 做带密钥的签名，并知道密钥该怎么传（而不是硬编码进模板）。",
]
next = ["/functions/hash/", "/functions/crypto/sha256/"]
+++

## 这一组包含什么

| 函数 | 用途 |
| --- | --- |
| [`md5`](/functions/crypto/md5/) | MD5 摘要（**已不适合安全用途**，仅用于校验或兼容旧格式） |
| [`sha1`](/functions/crypto/sha1/) | SHA-1 摘要（同样已不推荐用于安全场景） |
| [`sha256`](/functions/crypto/sha256/) | SHA-256 摘要，生成指纹、内容校验的常用选择 |
| [`hmac`](/functions/crypto/hmac/) | 带密钥的消息认证码（HMAC） |
| [`Hash`](/functions/crypto/hash/) | 用一个「哈希函数」值来调用上述算法的入口 |

## 什么时候用、什么时候别用

- **别用**：只想给内容生成一个短指纹、避免文件名冲突 → 用 [hash](/functions/hash/) 组（`hash.FNV32a`、`hash.XxHash`），更快也不需要加密强度；
- **用**：需要与外部系统对账（例如校验下载文件的完整性）、或需要带密钥的签名；
- **注意**：模板里做的哈希只能防意外，**不能防篡改**——模板与密钥对读者是可见的，别把「模板里算了 HMAC」当成服务端安全措施。

下方列出本站收录的本组全部函数。
