+++
title = "hash.FNV32a"
linkTitle = "FNV32a"
description = "返回给定字符串的 32 位 FNV（Fowler-Noll-Vo）非加密哈希。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/hash/fnv32a/"

[params.functions_and_methods]
signatures = ["hash.FNV32a STRING"]
returnType = "int"
+++

## 这一页解决什么问题

需要「够短、够快、不需要密码学强度」的哈希时（缓存键、稳定标识、给集合做简单指纹），`hash.FNV32a` 用 FNV-1a 算法返回一个 32 位非加密哈希，类型是 `int`。

它便宜到可以直接在模板里对字符串调用，但别把它当安全工具：非加密哈希可以被有意构造出碰撞。

## 什么时候用，什么时候别用

**该用**：

- 生成稳定的短数字键（例如给一组标签生成 CSS 类名后缀）；
- 需要数字而不是字符串的场合（返回 `int`，可直接比较 / 排序）；
- 简单去重或分桶逻辑。

**别用**：

- 安全相关 → 用 [`crypto.SHA256`](/functions/crypto/sha256/) 或 [`crypto.HMAC`](/functions/crypto/hmac/)；
- 需要更均匀、更抗碰撞的非加密哈希 → 用 [`hash.XxHash`](/functions/hash/xxhash/)；
- 需要十六进制字符串 → `FNV32a` 返回整数，要字符串得自己 `printf "%x"`。

```go-html-template
{{ hash.FNV32a "Hello world" }} → 1498229191
```

## 完整示例（实测）

```go-html-template
{{ hash.FNV32a "Hello world" }} → 1498229191
{{ hash.FNV32a "" }}            → 2166136261
{{ hash.FNV32a "中文" }}         → 3297308741
{{ hash.FNV32a 42 }}            → 2279835011
{{ hash.FNV32a nil }}           → 2166136261
```

Hugo 0.167.0 实测：以上逐条与 `→` 后一致。`nil` 与空字符串结果相同（都被当作空输入）；数字会先转成字符串。

## 返回值边界（实测）

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"Hello world"` | `1498229191` | 否 |
| 空字符串 / `nil` | `2166136261` | 否 |
| 非 ASCII（`"中文"`） | `3297308741` | 否 |
| 非字符串（`42`） | 按字符串 `"42"` 计算 | 否 |
| 返回类型 | `int`（实测 `%T` → `int`） | 否 |
