+++
title = "反序列化（unmarshal）"
linkTitle = "反序列化"
description = "把序列化对象转换为可在模板中访问的数据结构。"
date = 2026-10-02
weight = 1480
source = "https://gohugo.io/quick-reference/glossary/unmarshal/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断模板里取不到数据是解析失败，还是键名大小写不一致造成的",
]
next = ["/functions/transform/unmarshal/"]
+++

_反序列化_（unmarshal，动词）是把序列化对象转换为数据结构。例如，把 JSON 文件转换为可在模板中访问的 [_map_](g)。

参见：[transform.Unmarshal](/functions/transform/unmarshal/)

## 为什么重要

要把 `data/` 目录下的 JSON、YAML、TOML 文件，或模板里拿到的 JSON 字符串变成可用的数据，就得先反序列化，否则它只是一段字符串，取字段一律为空。它的反向操作是 [marshal](g)，两者常在同一条数据处理链上出现。失败往往分两种：格式错误会直接报错并带上 `transform.Unmarshal`；格式没错但键名大小写与文件里写的不一致时不会报错，只会取到 nil，页面渲染成空白。

延伸阅读：[transform.Unmarshal](/functions/transform/unmarshal/)、[数据源](/content-management/data-sources/)
