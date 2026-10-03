+++
title = "模板（template）"
linkTitle = "模板"
description = "包含模板动作的文件，位于项目、主题或模块的 layouts 目录中。"
date = 2026-10-02
weight = 1390
source = "https://gohugo.io/quick-reference/glossary/template/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断某个页面为什么用了这份模板，而不是你刚改过的那份",
]
next = ["/templates/lookup-order/"]
+++

_模板_（template）是包含 [_template actions_](g) 的文件，位于项目、主题或模块的 `layouts` 目录中。

参见：[模板](/templates/)

## 为什么重要

模板决定每个 URL 最终输出成什么 HTML。Hugo 不是按你的直觉挑模板，而是按查找顺序依次匹配目录与文件名；把模板放进 `layouts` 后如果没生效，通常不是文件写错了，而是它在查找顺序里输给了另一个同名文件（常见于项目与主题里各有一份）。调试时先确认当前渲染这块输出的到底是哪个模板，再决定改哪一份。

延伸阅读：[模板查找顺序](/templates/lookup-order/)、[检查与调试](/troubleshooting/inspection/)
