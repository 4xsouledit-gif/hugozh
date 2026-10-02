+++
title = "OpenAPI 函数"
linkTitle = "openapi3"
description = "把 OpenAPI 3 定义（JSON/YAML）反序列化成可遍历的数据结构：openapi3.Unmarshal。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/functions/openapi3/"

[params.teach]
difficulty = "进阶"
time = "按需查阅；动手约 30 分钟"
prereq = [
  "手边有一份 OpenAPI 3 定义文件（JSON 或 YAML），并且你知道要把它放在哪里——`assets/` 下或一个远程地址。",
  "会写 `range` 与 `with`；本组返回的是结构体/指针，**不是普通 map**，遍历方式与直觉不同。",
]
outcomes = [
  "用 `openapi3.Unmarshal` 把一份 OpenAPI 文档读成可遍历的数据结构；",
  "知道为什么 `Paths` 不能直接 `range`，而要用 `.Paths.Map`；",
  "在文档含远程外部引用时，用 `getremote` 选项复用请求头；",
  "先用 `debug.Dump` 看清结构再写模板，而不是照着猜测字段名。",
]
next = ["/functions/openapi3/unmarshal/", "/functions/resources/getremote/", "/functions/debug/dump/"]
+++

## 这一组包含什么

| 函数 | 用途 |
| --- | --- |
| [`Unmarshal`](/functions/openapi3/unmarshal/) | 把 OpenAPI 3 文档反序列化为数据结构，并自动纳入外部引用 |

## 这里的坑与直觉不同

- **返回的不是 map**：数据结构由 `kin-openapi` 生成，很多字段是结构体或指针。想遍历路径要写 `.Paths.Map`，直接 `range .Paths` 会失败；
- **外部引用会自动解析**：本地路径以 `/` 开头时相对 `assets/` 解析，其余相对入口文件解析；
- **`getremote` 是 v0.153.0 新增**的选项，文档含远程引用时才需要它，用来复用首次请求的请求头。

**先看结构再写模板**：把结果交给 `debug.Dump` 打出来，确认字段名与层级再动手，比反复构建试错快得多。

下方列出本站收录的本组全部函数。
