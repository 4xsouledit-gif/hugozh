+++
title = "片段（fragment）"
linkTitle = "片段"
description = "URL 末尾以 `#` 开头、指向页面元素 `id` 属性的那一段。"
date = 2026-10-02
weight = 450
source = "https://gohugo.io/quick-reference/glossary/fragment/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能读懂带 # 的链接指向页面里的什么，并能排查「页面打开了但没跳到位置」的问题"]
next = ["/content-management/urls/"]
+++

片段（fragment）是 URL 的最后一段，以井号（`#`）开头，用于引用页面中某个 HTML 元素的 `id` 属性。

## 为什么重要

片段是站内互链和目录跳转的基础：标题锚点由 Hugo 根据标题文字生成，所以改动标题用词、调整锚点设置或改用自定的 `id`，都会让旧链接「页面能打开、但不跳到位置」——浏览器不会报错，只是停在页首，很难察觉。跨页面引用时还要注意片段必须与目标页面实际存在的 `id` 完全一致（大小写敏感），复制页面上生成的锚点最稳妥。

延伸阅读：[URL 管理](/content-management/urls/)、[标题渲染钩子](/render-hooks/headings/)
