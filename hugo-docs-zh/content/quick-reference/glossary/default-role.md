+++
title = "默认角色"
linkTitle = "默认角色"
description = "由 defaultContentRole 定义的角色，未定义时回退到 guest。"
date = 2026-10-02
weight = 310
source = "https://gohugo.io/quick-reference/glossary/default-role/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断没写角色的内容会归到哪个角色下，并能定位「内容存在但页面为空」的原因"]
next = ["/configuration/roles/"]
+++

## 默认角色

_默认角色_（default role）是由 [`defaultContentRole`][] 设置定义的值；当项目没有定义任何角色时，回退为 `guest`。当项目定义了一个或多个角色而没有设置该项时，默认角色是项目中的第一个角色，由最低的[weight](g)确定；权重相同或未定义权重时，以字典序作为最终的判定依据。

另见：[role](g)。

## 为什么重要

角色是内容变体的一根轴：同一逻辑页面可以为不同角色准备不同版本，而「没写角色」的内容全部落到默认角色下。默认角色选错时，构建不会报错，症状是某个角色视角的页面上列表或正文为空；用 `role` 过滤内容集合时若把角色名拼错，也会得到空集合而不是错误提示。是否启用角色维度、角色叫什么，都在 `defaultContentRole` 与 `roles` 配置里决定。

延伸阅读：[角色配置](/configuration/roles/)、[版本配置](/configuration/versions/)

[`defaultContentRole`]: /configuration/all/#defaultcontentrole
