+++
title = "crypto.HMAC"
linkTitle = "HMAC"
description = "返回用密钥对消息签名得到的加密哈希。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/crypto/hmac/"

[params.functions_and_methods]
signatures = ["crypto.HMAC HASH_TYPE KEY MESSAGE [ENCODING]"]
returnType = "string"
aliases = ["hmac"]
+++

## 这一页解决什么问题

HMAC 是「带密钥的哈希」：同一个消息，密钥不同，结果就不同，因此可以用于校验来源（webhook 签名、接口回调校验）。`crypto.HMAC` 用给定的哈希算法与密钥对消息签名，默认输出十六进制字符串。

它与 [`crypto.Hash`](/functions/crypto/hash/) 的区别只有一个：**多了一把密钥**；想验证签名，就必须用同一个密钥重算再比对。

## 什么时候用，什么时候别用

**该用**：

- 生成 / 校验 webhook 签名、接口回调签名；
- 需要把签名值放进 URL 或表单（`ENCODING` 选 `hex`）；
- 需要二进制签名再 Base64（`ENCODING` 选 `binary`，见「用法」）。

**别用**：

- 只是资源指纹 / 校验和 → 用 [`crypto.SHA256`](/functions/crypto/sha256/) 或 `crypto.Hash`；
- 需要可解密的加密 → Hugo 模板层不提供加密函数，只有摘要；
- 密钥会随站点配置提交进仓库 → 构建产物会带上签名，但密钥本身不应公开。

`HASH_TYPE` 参数取 `md5`、`sha1`、`sha256` 或 `sha512`。

可选的 `ENCODING` 参数取 `hex`（默认）或 `binary`。

```go-html-template
{{ hmac "sha256" "Secret key" "Secret message" }}
5cceb491f45f8b154e20f3b0a30ed3a6ff3027d373f85c78ffe8983180b03c84

{{ hmac "sha256" "Secret key" "Secret message" "hex" }}
5cceb491f45f8b154e20f3b0a30ed3a6ff3027d373f85c78ffe8983180b03c84

{{ hmac "sha256" "Secret key" "Secret message" "binary" | base64Encode }}
XM60kfRfixVOIPOwow7Tpv8wJ9Nz+Fx4/+iYMYCwPIQ=
```

## 完整示例（实测）

```go-html-template
{{ hmac "sha256" "Secret key" "Secret message" }}
{{ hmac "md5" "Secret key" "Secret message" }}
{{ hmac "sha1" "Secret key" "Secret message" }}
{{ hmac "sha512" "Secret key" "Secret message" }}
{{ hmac "sha256" "Secret key" "Secret message" "binary" | base64Encode }}
```

Hugo 0.167.0 实测输出：

```text
5cceb491f45f8b154e20f3b0a30ed3a6ff3027d373f85c78ffe8983180b03c84
fcbefb296539e6968b395009b963d63f
627e153d28e9f0daa538db9e92aa80a1865d09bb
a59671d23358538f6e0300d65c4bcd19efa27a2a1105355937fa5d690cb6530c63afffa069914b579576acf29ff1ea57470a219926ac05370cd83ae32b49680c
XM60kfRfixVOIPOwow7Tpv8wJ9Nz+Fx4/+iYMYCwPIQ=
```

**你应当看到什么**：`ENCODING` 默认 `hex`；改成 `binary` 得到二进制摘要，通常再经 [`encoding.Base64Encode`](/functions/encoding/base64encode/) 变成可打印字符串。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 省略 `ENCODING` | 等价于 `hex` | 否 |
| `ENCODING = "binary"` | 返回二进制字符串，可直接管道给 `base64Encode` | 否 |
| 不支持的编码（`"base64"`） | —— | 是：`"base64" is not a supported encoding method` |
| 不支持的哈希（`"sha3"`） | —— | 是：`hmac: sha3 is not a supported hash function` |
| 参数不足（只给 2 个） | —— | 是：`wrong number of args for hmac: want at least 3 got 2` |
| 返回类型 | `string` | 否 |
