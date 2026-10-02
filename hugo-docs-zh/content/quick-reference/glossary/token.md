+++
title = "标记（token）"
linkTitle = "标记"
description = "格式字符串中以冒号开头的标识符，渲染时被替换为某个值。"
date = 2026-10-02
weight = 1430
source = "https://gohugo.io/quick-reference/glossary/token/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断某个令牌在这个位置会不会被替换，URL 不对时该从哪一页查起",
]
next = ["/configuration/permalinks/"]
+++

_标记_（token）是格式字符串中的标识符，以冒号开头，渲染时被替换为某个值。在以下情况使用标记：

- 配置[文件缓存][file caches]、[front matter](g)（前置元数据）和 [permalinks](g)（永久链接）
- 本地化[日期][dates]
- 在前置元数据中设置 [`url`][]

## 为什么重要

令牌只在支持它的位置才会被替换，例如 [permalinks](g)、前置元数据里的 `url`，以及日期格式字符串。把令牌写在不支持它的地方不会报错，它会原样留在 URL 或输出里，往往等到部署后访问 404 才被发现。另一个高频问题是冒号后面写错名字：`:` 之后必须是该位置支持的那几个标识符，写错了不会有提示。

延伸阅读：[永久链接配置](/configuration/permalinks/)、[URL 管理](/content-management/urls/)

[`url`]: /content-management/urls/#tokens
[dates]: /functions/time/format/#localization
[file caches]: /configuration/caches/#tokens
