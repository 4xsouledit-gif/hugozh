+++
title = "哈希函数"
linkTitle = "hash"
description = "生成非加密哈希，用于短指纹与缓存键：hash.FNV32a 与 hash.XxHash。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/hash/"

[params.teach]
difficulty = "参考"
time = "按需查阅"
prereq = [
  "会写基本 Go 模板。",
]
outcomes = [
  "用 `hash.FNV32a` 或 `hash.XxHash` 给一段内容生成稳定的短标识；",
  "分清本组（非加密，快）与 [crypto](/functions/crypto/) 组（加密强度，慢）该选哪个；",
  "知道同一个输入在同一版本下输出稳定，但**不要**把它当安全用途。",
]
next = ["/functions/crypto/", "/functions/hash/xxhash/"]
+++

## 这一组包含什么

| 函数 | 用途 |
| --- | --- |
| [`FNV32a`](/functions/hash/fnv32a/) | 32 位 FNV-1a 哈希，输出短、开销小 |
| [`XxHash`](/functions/hash/xxhash/) | xxHash，速度很快，适合大段内容 |

## 什么时候用、什么时候别用

- **用**：生成缓存键、给内联样式/脚本算一个稳定的短标识、做「内容变了才更新」的判断；
- **别用**：任何安全用途（防篡改、口令、签名）→ 用 [crypto](/functions/crypto/) 组；
- **注意**：哈希值取决于函数与输入，**换函数或改一个字符结果就完全不同**，不要把它当成语义化 ID 长期依赖。

Hugo 内部还有 [`resources.Fingerprint`](/functions/resources/fingerprint/)（对资源生成带哈希的文件名与 SRI），那是**资源发布**场景的专用做法，与本组不是一回事；用法见[资源指纹](/hugo-pipes/fingerprint/)。

下方列出本站收录的本组全部函数。
