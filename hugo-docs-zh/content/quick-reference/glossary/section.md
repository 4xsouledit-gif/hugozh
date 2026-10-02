+++
title = "section（内容区块）"
linkTitle = "section"
description = "顶层内容目录，或任何包含 _index.md 文件的内容目录。"
date = 2026-10-02
weight = 1220
source = "https://gohugo.io/quick-reference/glossary/section/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断某个目录是不是 section，并预判新增或移动目录会怎样改变 URL 与导航"]
next = ["/content-management/sections/"]
+++

_section_（内容区块）是顶层内容目录，或任何包含&nbsp;`_index.md`&nbsp;文件的内容目录。

## 为什么重要

section 决定内容归属与 URL：`content/blog/` 下的页面 URL 以 `/blog/` 开头，并出现在该 section 的列表页里。在子目录里多放一个 `_index.md`，那个目录就成为一个 section，会多出一张列表页，导航与 `.Site.Sections` 也会跟着变；目录层级的改动还会让已有 URL 失效，所以移动内容前先确认 section 结构。

延伸阅读：[内容区块](/content-management/sections/)、[内容组织](/content-management/organization/)
