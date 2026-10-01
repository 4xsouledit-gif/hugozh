+++
title = "crypto.Hash"
linkTitle = "Hash"
description = "用给定哈希算法计算给定输入的校验和，并编码为十六进制字符串。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/crypto/hash/"

[params.functions_and_methods]
signatures = ["crypto.Hash [ALGORITHM] INPUT"]
returnType = "string"
+++

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
