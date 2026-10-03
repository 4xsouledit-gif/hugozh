+++
title = "hash.XxHash"
linkTitle = "XxHash"
description = "返回给定字符串的 64 位 xxHash 非加密哈希。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/hash/xxhash/"

[params.functions_and_methods]
signatures = ["hash.XxHash STRING"]
returnType = "string"
aliases = ["xxhash"]
+++

## 这一页解决什么问题

`hash.XxHash` 用 xxHash 算法返回 64 位非加密哈希，输出是十六进制字符串。它比 [`hash.FNV32a`](/functions/hash/fnv32a/) 更长、分布更均匀，适合当缓存键或内容指纹；同样不是安全工具。

## 什么时候用，什么时候别用

**该用**：

- 内容 / 数据指纹（比 FNV32a 更抗碰撞）；
- 缓存键、去重键；
- 需要字符串形式的哈希（直接可用作文件名、class 名的一部分）。

**别用**：

- 安全相关 → 用 [`crypto.SHA256`](/functions/crypto/sha256/) 或 [`crypto.HMAC`](/functions/crypto/hmac/)；
- 需要数字类型 → 用 [`hash.FNV32a`](/functions/hash/fnv32a/)（返回 `int`）；
- 资源指纹 → 对 resource 用 `fingerprint`，无需手工哈希。

```go-html-template
{{ hash.XxHash "Hello world" }} → c500b0c912b376d8
```

[xxHash][] 是一种速度极快的非加密哈希算法。Hugo 使用[这份 Go 实现][this Go implementation]。

[this Go implementation]: https://github.com/cespare/xxhash
[xxHash]: https://xxhash.com/

## 完整示例（实测）

```go-html-template
{{ hash.XxHash "Hello world" }} → c500b0c912b376d8
{{ xxhash "Hello world" }}      → c500b0c912b376d8
{{ hash.XxHash "" }}            → ef46db3751d8e999
{{ hash.XxHash "中文" }}         → a75c8d077a3f4f51
{{ hash.XxHash nil }}           → ef46db3751d8e999
```

Hugo 0.167.0 实测：以上逐条与 `→` 后一致。别名 `xxhash` 与 `hash.XxHash` 等价（两者输出相同）；`nil` 与空字符串结果相同。

## 返回值边界（实测）

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"Hello world"` | `c500b0c912b376d8` | 否 |
| 空字符串 / `nil` | `ef46db3751d8e999` | 否 |
| 非 ASCII（`"中文"`） | `a75c8d077a3f4f51` | 否 |
| 别名 `xxhash` | 与 `hash.XxHash` 结果相同 | 否 |
| 返回类型 | `string`（16 位十六进制、小写） | 否 |
