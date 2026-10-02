+++
title = "无头包（headless bundle）"
linkTitle = "无头包"
description = "未发布的叶子包或分支包，其内容与资源可被其它页面引用。"
date = 2026-10-02
weight = 520
source = "https://gohugo.io/quick-reference/glossary/headless-bundle/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一个页面包该不该发布，并解释「素材页被单独发布出来」的原因"]
next = ["/content-management/page-bundles/"]
+++

无头包（headless bundle）是一种未发布的[leaf bundle](g)或未发布的[branch bundle](g)，其中的内容与资源可以包含到其它页面中。

## 为什么重要

无头包是「只当素材、不当页面」的做法：典型用途是把一组图片或一段结构化内容放在页面包里，供首页或列表页取用，而不生成自己的 URL。忘记开启无头（把 `headless` 写漏或写到包内的资源文件上）时，构建不会报错，只是多出一个不该出现在导航和站点地图里的页面；反过来，把它当普通页面用 `GetPage` 去取时可能取不到预期的页面对象，因为无头页面不在常规页面集合里。

延伸阅读：[页面包](/content-management/page-bundles/)、[构建选项](/content-management/build-options/)

参见：[构建选项](/content-management/build-options/)
