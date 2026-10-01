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
