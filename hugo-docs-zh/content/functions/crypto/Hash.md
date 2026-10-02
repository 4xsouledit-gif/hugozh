+++
title = "crypto.Hash"
linkTitle = "Hash"
description = "用给定哈希算法计算给定输入的校验和，并编码为十六进制字符串。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/crypto/hash/"

[params.functions_and_methods]
signatures = ["crypto.Hash [ALGORITHM] INPUT"]
returnType = "string"
+++

## 这一页解决什么问题

需要给资源算校验和（fingerprint、SRI、缓存键）时，`crypto.Hash` 用一个调用同时完成「选算法」和「算哈希」：传入算法名与输入，返回十六进制字符串。它比 [`crypto.SHA256`](/functions/crypto/sha256/) 这类单一算法函数多了一个「算法可变量」——算法来自变量或配置时用它。

## 什么时候用，什么时候别用

**该用**：

- 算法需要动态决定（`$algo := "sha512"`）；
- 构造子资源完整性（SRI）字符串：算法名 + `-` + Base64 哈希（见本页「用法」）；
- 需要 `sha384`、`sha512` 这类没有独立函数名的算法（它们只能通过 `crypto.Hash` 使用）。

**别用**：

- 算法固定为 SHA-256 → 直接用 [`crypto.SHA256`](/functions/crypto/sha256/)（更短）；
- 需要「带密钥签名」→ 用 [`crypto.HMAC`](/functions/crypto/hmac/)；
- 需要非加密哈希（短指纹更快）→ 用 [`hash.FNV32a`](/functions/hash/fnv32a/) / [`hash.XxHash`](/functions/hash/xxhash/)；
- 资源指纹 → 直接对 resource 用 `fingerprint`，它会同时生成 `.Data.Integrity`。

`ALGORITHM` 取 `md5`、`sha1`、`sha256`（默认）、`sha384`、`sha512` 之一：

```go-html-template
{{ crypto.Hash "sha256" "Hello world" }} → 64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c
{{ "Hello world" | crypto.Hash "sha512" }} → b7f783baed8297f0db917462184ff4f08e69c2d5e5f79a942600f9725f58ce1f29c18139bf80b06c0fff2bdd34738452ecf40c488c22a7e3d80cdf6f9c1c0d47
```

省略算法时默认使用 `sha256`：

```go-html-template
{{ "Hello world" | crypto.Hash }} → 64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c
```

支持的算法与带指纹资源的 [`.Data.Integrity`][] 中[子资源完整性][Subresource Integrity]哈希所用的算法一致。把 `crypto.Hash` 与 [`encoding.HexDecode`][]、[`encoding.Base64Encode`][] 组合起来，就能从字符串构造出 SRI 哈希：

```go-html-template
{{ $algo := "sha256" }}
{{ $integrity := printf "%s-%s" $algo ("Hello world" | crypto.Hash $algo | encoding.HexDecode | encoding.Base64Encode) }}
```

[Subresource Integrity]: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
[`.Data.Integrity`]: /methods/resource/data/
[`encoding.Base64Encode`]: /functions/encoding/base64encode/
[`encoding.HexDecode`]: /functions/encoding/hexdecode/

## 完整示例（实测）

```go-html-template
{{ crypto.Hash "sha256" "Hello world" }}
{{ crypto.Hash "sha512" "Hello world" }}
{{ crypto.Hash "md5" "Hello world" }}
{{ crypto.Hash "sha1" "Hello world" }}
{{ crypto.Hash "sha384" "Hello world" }}
{{ "Hello world" | crypto.Hash }}
```

Hugo 0.167.0 实测输出：

```text
64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c
b7f783baed8297f0db917462184ff4f08e69c2d5e5f79a942600f9725f58ce1f29c18139bf80b06c0fff2bdd34738452ecf40c488c22a7e3d80cdf6f9c1c0d47
3e25960a79dbc69b674cd4ec67a72c62
7b502c3a1f48c8609ae212cdfb639dee39673f5e
9203b0c4439fd1e6ae5878866337b7c532acd6d9260150c80318e8ab8c27ce330189f8df94fb890df1d298ff360627e1
64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c
```

**你应当看到什么**：第 6 行与第 1 行相同——省略算法时默认 `sha256`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 省略 `ALGORITHM` | 等价于 `sha256` | 否 |
| 空字符串输入 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | 否 |
| 非字符串输入（`42`） | 先转成字符串再算：实测 `crypto.Hash "sha256" 42` 与 `sha256 42` 输出相同（`73475cb40a568e8da8a045ced110137e159f890ac4da883b6b17dc651b3a8049`） | 否 |
| 不支持的算法（`sha3`） | —— | 是：`crypto.Hash: "sha3" is not a supported hash algorithm` |
| 只传一个参数 | 该参数当作 `INPUT`，算法用默认的 `sha256`（实测 `crypto.Hash "abc"` → `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`） | 否 |
| 返回类型 | `string`（十六进制、小写） | 否 |
